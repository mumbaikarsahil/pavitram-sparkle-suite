import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

// ==========================================================
// SUPABASE ADMIN CLIENT
// ==========================================================

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ==========================================================
// 1. GET ACCOUNT PROFILE & DASHBOARD DATA
// ==========================================================

export const getAccountProfileFn = createServerFn({
  method: "POST",
})
  .validator(
    z.object({
      customerId: z.string().uuid(),
    })
  )
  .handler(async ({ data }) => {
    const { customerId } = data;

    // ------------------------------------------------------
    // Fetch main customer record
    // ------------------------------------------------------
    const { data: customer, error: customerError } = await supabaseAdmin
      .from("customers")
      .select(`id, company_id, full_name, phone, email, birth_date, anniversary_date`)
      .eq("id", customerId)
      .single();

    if (customerError || !customer) {
      throw new Error(customerError?.message || "Unable to load customer account.");
    }

    // ------------------------------------------------------
    // Fetch ecommerce-specific profile (Addresses)
    // ------------------------------------------------------
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("ecommerce_customer_profiles")
      .select(`id, customer_id, first_name, last_name, street_address, apartment, city, state, pincode`)
      .eq("customer_id", customerId)
      .maybeSingle();

    if (profileError) {
      console.error("ECOMMERCE PROFILE FETCH ERROR:", profileError);
    }

    // ------------------------------------------------------
    // Fetch Order History (Joined with Order Items)
    // ------------------------------------------------------
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from("ecommerce_orders")
      .select(`
        *,
        ecommerce_order_items (*)
      `)
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });

    if (ordersError) {
      console.error("ORDERS FETCH ERROR:", ordersError);
    }

    // ------------------------------------------------------
    // Return all dashboard data
    // ------------------------------------------------------
    return {
      success: true,
      customer,
      profile: profile || null,
      orders: orders || [],
    };
  });

// ==========================================================
// 2. UPDATE ACCOUNT PROFILE
// ==========================================================

export const updateAccountProfileFn = createServerFn({
  method: "POST",
})
  .validator(
    z.object({
      customerId: z.string().uuid(),
      firstName: z.string().trim().min(1, "First name is required.").max(100),
      lastName: z.string().trim().min(1, "Last name is required.").max(100),
      email: z.string().trim().email("Invalid email address.").or(z.literal("")),
      dob: z.string().optional(),
      anniversary: z.string().optional(),
      streetAddress: z.string().trim().max(300).optional(),
      apartment: z.string().trim().max(150).optional(),
      city: z.string().trim().max(100).optional(),
      state: z.string().trim().max(100).optional(),
      pincode: z.string().trim().regex(/^\d{6}$/, "Invalid PIN code.").or(z.literal("")),
    })
  )
  .handler(async ({ data }) => {
    const { customerId, firstName, lastName, email, dob, anniversary, streetAddress, apartment, city, state, pincode } = data;
    const fullName = `${firstName} ${lastName}`.trim();

    // 1. Update COMMON customers table
    const { data: updatedCustomer, error: customerError } = await supabaseAdmin
      .from("customers")
      .update({
        full_name: fullName,
        email: email || null,
        birth_date: dob || null,
        anniversary_date: anniversary || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", customerId)
      .select(`id, company_id, full_name, phone, email, birth_date, anniversary_date`)
      .single();

    if (customerError || !updatedCustomer) throw new Error("Failed to update customer information.");

    // 2. Update ecommerce-specific table
    const { data: updatedProfile, error: profileError } = await supabaseAdmin
      .from("ecommerce_customer_profiles")
      .upsert({
        customer_id: customerId,
        first_name: firstName,
        last_name: lastName,
        street_address: streetAddress || null,
        apartment: apartment || null,
        city: city || null,
        state: state || null,
        pincode: pincode || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: "customer_id" })
      .select(`id, customer_id, first_name, last_name, street_address, apartment, city, state, pincode`)
      .single();

    if (profileError || !updatedProfile) throw new Error("Failed to update ecommerce profile.");

    return {
      success: true,
      customer: updatedCustomer,
      profile: updatedProfile,
    };
  });

// ==========================================================
// 3. DPDP COMPLIANCE: DELETE ACCOUNT
// ==========================================================

export const deleteAccountFn = createServerFn({
  method: "POST",
})
  .validator(
    z.object({
      customerId: z.string().uuid(),
    })
  )
  .handler(async ({ data }) => {
    const { customerId } = data;

    // Deleting the main customer record. 
    // Foreign keys with 'on delete CASCADE' (like ecommerce_customer_profiles) will automatically drop associated data.
    const { error } = await supabaseAdmin
      .from("customers")
      .delete()
      .eq("id", customerId);

    if (error) {
      console.error("DPDP ACCOUNT DELETION ERROR:", error);
      throw new Error("Failed to delete account data.");
    }

    return { success: true };
  });