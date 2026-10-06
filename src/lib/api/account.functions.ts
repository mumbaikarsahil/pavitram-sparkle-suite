import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { getAuthenticatedCustomer, clearAuthCookie } from '../session.server';

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ==========================================
// 1. GET ACCOUNT PROFILE (IDOR-Proof)
// ==========================================
export const getAccountProfileFn = createServerFn({ method: 'POST' })
  .handler(async () => {
    // 🔒 SECURED: Extracts verified customerId from HttpOnly cookie
    const { customerId } = await getAuthenticatedCustomer();

    // 1. Fetch the web customer FIRST
    const { data: customerData, error: customerError } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single();

    if (customerError || !customerData) {
      throw new Error("Unable to retrieve account details.");
    }

    // Strip everything except the core 10-digit phone number (e.g., +91 9876543210 -> 9876543210)
    const cleanPhone = customerData.phone ? customerData.phone.replace(/\D/g, '').slice(-10) : '';

    const [profileRes, ordersRes] = await Promise.all([
      supabaseAdmin
        .from('ecommerce_customer_profiles')
        .select('*')
        .eq('customer_id', customerId)
        .maybeSingle(),

      supabaseAdmin
        .from('ecommerce_orders')
        .select(`
          id, order_number, status, final_total, created_at, expected_delivery_date,
          ecommerce_order_items ( id, quantity, total_price, product_id )
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
    ]);

    let loyaltyData = null;

    // ✨ STEP 1: Try finding loyalty account by exact Web Customer ID
    const { data: exactLoyalty } = await supabaseAdmin
      .from('loyalty_accounts')
      .select('*')
      .eq('customer_id', customerId)
      .maybeSingle();

    if (exactLoyalty && Number(exactLoyalty.total_points) > 0) {
      loyaltyData = exactLoyalty;
    } 
    // ✨ STEP 2: If points are 0 or null, aggressively hunt the POS loyalty account via 10-digit Phone Match
    else if (cleanPhone && cleanPhone.length === 10) {
      const { data: phoneLoyalty } = await supabaseAdmin
        .from('loyalty_accounts')
        .select('*, customers!inner(phone)')
        .ilike('customers.phone', `%${cleanPhone}%`)
        .order('total_points', { ascending: false })
        .limit(1);

      if (phoneLoyalty && phoneLoyalty.length > 0) {
        loyaltyData = phoneLoyalty[0]; // Grab the account that actually has points!
      } else {
         loyaltyData = exactLoyalty; // Fallback
      }
    } else {
      loyaltyData = exactLoyalty;
    }

    return {
      customer: customerData,
      profile: profileRes.data || null,
      orders: ordersRes.data || [],
      loyalty: loyaltyData
    };
  });

// ==========================================
// 2. UPDATE ACCOUNT PROFILE (IDOR-Proof)
// ==========================================
export const updateAccountProfileFn = createServerFn({ method: 'POST' })
  .validator(z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Valid email is required"),
    dob: z.string().optional(),
    anniversary: z.string().optional(),
    streetAddress: z.string().optional(),
    apartment: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional()
  }))
  .handler(async ({ data }) => {
    const { customerId } = await getAuthenticatedCustomer();
    const fullName = `${data.firstName} ${data.lastName}`.trim();

    const { error: customerError } = await supabaseAdmin
      .from('customers')
      .update({
        full_name: fullName,
        email: data.email.trim(),
        birth_date: data.dob || null,
        anniversary_date: data.anniversary || null
      })
      .eq('id', customerId);

    if (customerError) throw new Error("Failed to update personal details.");

    const { data: updatedProfile, error: profileError } = await supabaseAdmin
      .from('ecommerce_customer_profiles')
      .upsert({
        customer_id: customerId,
        first_name: data.firstName.trim(),
        last_name: data.lastName.trim(),
        street_address: data.streetAddress || null,
        apartment: data.apartment || null,
        city: data.city || null,
        state: data.state || null,
        pincode: data.pincode || null
      }, { onConflict: 'customer_id' })
      .select()
      .single();

    if (profileError) throw new Error("Failed to save address details.");

    return { success: true, profile: updatedProfile };
  });

// ==========================================
// 3. DELETE ACCOUNT (DPDP Act Compliance - IDOR-Proof)
// ==========================================
export const deleteAccountFn = createServerFn({ method: 'POST' })
  .handler(async () => {
    const { customerId } = await getAuthenticatedCustomer();

    await supabaseAdmin.from('ecommerce_customer_profiles').delete().eq('customer_id', customerId);

    await supabaseAdmin.from('customers').update({
        full_name: 'Deleted User',
        email: null,
        phone: `DELETED_${Date.now()}`,
        customer_status: 'Churned'
      }).eq('id', customerId);

    clearAuthCookie();
    return { success: true, message: "Account data permanently erased." };
  });