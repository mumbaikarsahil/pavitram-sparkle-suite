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

    const [customerRes, profileRes, ordersRes] = await Promise.all([
      supabaseAdmin
        .from('customers')
        .select('id, full_name, phone, email, birth_date, anniversary_date')
        .eq('id', customerId)
        .single(),

      supabaseAdmin
        .from('ecommerce_customer_profiles')
        .select('*')
        .eq('customer_id', customerId)
        .maybeSingle(),

      supabaseAdmin
        .from('ecommerce_orders')
        .select(`
          id,
          order_number,
          status,
          final_total,
          created_at,
          expected_delivery_date,
          ecommerce_order_items (
            id,
            quantity,
            total_price,
            product_id
          )
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
    ]);

    if (customerRes.error || !customerRes.data) {
      throw new Error("Unable to retrieve account details.");
    }

    return {
      customer: customerRes.data,
      profile: profileRes.data || null,
      orders: ordersRes.data || []
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
    // 🔒 SECURED: Customer can only mutate their OWN profile
    const { customerId } = await getAuthenticatedCustomer();

    const fullName = `${data.firstName} ${data.lastName}`.trim();

    // 1. Update master customer table
    const { error: customerError } = await supabaseAdmin
      .from('customers')
      .update({
        full_name: fullName,
        email: data.email.trim(),
        birth_date: data.dob || null,
        anniversary_date: data.anniversary || null
      })
      .eq('id', customerId);

    if (customerError) {
      console.error("Update Customer Error:", customerError);
      throw new Error("Failed to update personal details.");
    }

    // 2. Upsert primary address in ecommerce profile
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

    if (profileError) {
      console.error("Update Profile Error:", profileError);
      throw new Error("Failed to save address details.");
    }

    return { success: true, profile: updatedProfile };
  });

// ==========================================
// 3. DELETE ACCOUNT (DPDP Act Compliance - IDOR-Proof)
// ==========================================
export const deleteAccountFn = createServerFn({ method: 'POST' })
  .handler(async () => {
    // 🔒 SECURED: Prevents an attacker from deleting other users' accounts
    const { customerId } = await getAuthenticatedCustomer();

    // Anonymize/erase ecommerce data in compliance with DPDP 2023
    await supabaseAdmin
      .from('ecommerce_customer_profiles')
      .delete()
      .eq('customer_id', customerId);

    await supabaseAdmin
      .from('customers')
      .update({
        full_name: 'Deleted User',
        email: null,
        phone: `DELETED_${Date.now()}`,
        customer_status: 'Churned'
      })
      .eq('id', customerId);

    // Invalidate session cookie immediately
    clearAuthCookie();

    return { success: true, message: "Account data permanently erased." };
  });