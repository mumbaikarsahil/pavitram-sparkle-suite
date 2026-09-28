import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Admin Client securely (Runs ONLY on the server)
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ==========================================
// 1. SEND OTP FUNCTION (With Rate Limiting)
// ==========================================
export const sendOtpFn = createServerFn({ method: 'POST' })
  .validator(z.object({ phone: z.string() }))
  .handler(async ({ data }) => {
    const { phone } = data;

    // Sanitize phone number
    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.length === 10) formattedPhone = '91' + formattedPhone;
    if (formattedPhone.length < 12) throw new Error("Invalid phone number format.");

    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000).toISOString();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    // SECURITY CHECK 1: 60-Second Cooldown
    const { data: recentOtp } = await supabaseAdmin
      .from('otp_verifications')
      .select('created_at')
      .eq('phone', formattedPhone)
      .gte('created_at', oneMinuteAgo)
      .maybeSingle();

    if (recentOtp) throw new Error("Please wait 60 seconds before requesting a new code.");

    // SECURITY CHECK 2: Max 5 requests per 24 hours (Toll Fraud Protection)
    const { count: dailyRequests } = await supabaseAdmin
      .from('otp_verifications')
      .select('id', { count: 'exact', head: true })
      .eq('phone', formattedPhone)
      .gte('created_at', oneDayAgo);

    if (dailyRequests && dailyRequests >= 5) {
      throw new Error("Maximum daily OTP requests reached. Please try again tomorrow.");
    }

    // Generate 6-digit OTP and Expiry (5 minutes)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000).toISOString();

    // Invalidate old pending OTPs
    await supabaseAdmin.from('otp_verifications').delete().eq('phone', formattedPhone);

    // Insert new OTP securely
    const { error: dbError } = await supabaseAdmin.from('otp_verifications').insert({
      phone: formattedPhone,
      otp_code: otp,
      expires_at: expiresAt,
    });

    if (dbError) throw new Error("Database error while generating OTP.");

    // Dispatch to your ERP's Convo360 Wrapper
    const waRes = await fetch('https://www.biillojewel.co.in/api/whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'message.sendDirect',
        payload: {
          user_id: formattedPhone,
          template_name: 'otp_verification', // Replace with your exact Convo360 OTP template name
          lang: 'en',
          namespace: 'bfbb14c4_778e_453b_97c2_92f60bb9e978',
          parameters: [otp],        // ✨ Fills the {{1}} in the text body
          button_parameters: [otp]
        }
      })
    });

    if (!waRes.ok) {
      const errData = await waRes.json().catch(() => ({}));
      throw new Error(errData.message || "Failed to trigger WhatsApp message via ERP.");
    }

    return { success: true, message: "OTP sent successfully." };
  });

// ==========================================
// 2. VERIFY OTP FUNCTION (With Brute-Force Defense)
// ==========================================
export const verifyOtpFn = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      phone: z.string(),
      otp: z.string().length(6),
    })
  )
  .handler(async ({ data }) => {
    const { phone, otp } = data;

    // --------------------------------------------------
    // 1. Normalize phone for multi-format checking
    // --------------------------------------------------
    const rawPhone = phone.replace(/\D/g, '');
    const basePhone = (rawPhone.startsWith('91') && rawPhone.length === 12) 
      ? rawPhone.substring(2) 
      : rawPhone;

    const phoneWith91 = `91${basePhone}`;
    const phoneWithout91 = basePhone;

    if (phoneWith91.length !== 12) {
      throw new Error("Invalid phone number format.");
    }

    // Pavitram company ID must be stored server-side in env
    const companyId = process.env.PAVITRAM_COMPANY_ID;

    if (!companyId) {
      throw new Error("PAVITRAM_COMPANY_ID is not configured.");
    }

    // --------------------------------------------------
    // 2. Fetch active OTP (Using the standard 91 format)
    // --------------------------------------------------
    const { data: record, error: otpFetchError } = await supabaseAdmin
      .from('otp_verifications')
      .select('*')
      .eq('phone', phoneWith91)
      .eq('is_verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpFetchError) {
      console.error("OTP FETCH ERROR:", otpFetchError);
      throw new Error("Unable to verify OTP.");
    }

    if (!record) {
      throw new Error("No active OTP request found.");
    }

    // --------------------------------------------------
    // 3. Expiry validation
    // --------------------------------------------------
    if (new Date() > new Date(record.expires_at)) {
      throw new Error("OTP has expired. Please request a new one.");
    }

    // --------------------------------------------------
    // 4. Brute-force protection
    // --------------------------------------------------
    if (record.attempts >= 5) {
      throw new Error(
        "Too many incorrect attempts. Please request a new code."
      );
    }

    // --------------------------------------------------
    // 5. OTP match
    // --------------------------------------------------
    if (record.otp_code !== otp.trim()) {
      await supabaseAdmin
        .from('otp_verifications')
        .update({
          attempts: record.attempts + 1,
        })
        .eq('id', record.id);

      throw new Error(
        `Invalid code. ${4 - record.attempts} attempts remaining.`
      );
    }

    // --------------------------------------------------
    // 6. Mark OTP verified
    // --------------------------------------------------
    const { error: verifyError } = await supabaseAdmin
      .from('otp_verifications')
      .update({
        is_verified: true,
      })
      .eq('id', record.id);

    if (verifyError) {
      console.error("OTP VERIFY UPDATE ERROR:", verifyError);
      throw new Error("Unable to complete OTP verification.");
    }

    // --------------------------------------------------
    // 7. Find existing customer
    //    IMPORTANT: Checks for BOTH phone formats
    // --------------------------------------------------
    let { data: customer, error: customerFetchError } =
      await supabaseAdmin
        .from('customers')
        .select(`
          id,
          company_id,
          full_name,
          phone,
          email,
          birth_date,
          anniversary_date
        `)
        .eq('company_id', companyId)
        .or(`phone.eq.${phoneWith91},phone.eq.${phoneWithout91}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (customerFetchError) {
      console.error("CUSTOMER LOOKUP ERROR:", customerFetchError);
      throw new Error("Unable to load customer profile.");
    }

    // --------------------------------------------------
    // 8. Create new customer if not found
    // --------------------------------------------------
    if (!customer) {
      const { data: newCustomer, error: createCustomerError } =
        await supabaseAdmin
          .from('customers')
          .insert({
            company_id: companyId,
            phone: phoneWith91, // Standardize on 91 format for new users
            full_name: '', // Empty name triggers the onboarding screen automatically
            customer_status: 'Lead',
          })
          .select(`
            id,
            company_id,
            full_name,
            phone,
            email,
            birth_date,
            anniversary_date
          `)
          .single();

      if (createCustomerError) {
        // In case two requests try to create the same customer simultaneously
        if (createCustomerError.code === '23505') {
          const retry = await supabaseAdmin
            .from('customers')
            .select(`
              id,
              company_id,
              full_name,
              phone,
              email,
              birth_date,
              anniversary_date
            `)
            .eq('company_id', companyId)
            .or(`phone.eq.${phoneWith91},phone.eq.${phoneWithout91}`)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (retry.error || !retry.data) {
            console.error("CUSTOMER RETRY LOOKUP ERROR:", retry.error);
            throw new Error("Failed to create customer profile.");
          }

          customer = retry.data;
        } else {
          console.error("CUSTOMER CREATE ERROR:", {
            code: createCustomerError.code,
            message: createCustomerError.message,
            details: createCustomerError.details,
            hint: createCustomerError.hint,
          });

          throw new Error(
            createCustomerError.message ||
            "Failed to create customer profile."
          );
        }
      } else {
        customer = newCustomer;
      }
    }

    // --------------------------------------------------
    // 9. Ensure ecommerce profile exists
    // --------------------------------------------------
    const { data: ecommerceProfile, error: ecommerceFetchError } =
      await supabaseAdmin
        .from('ecommerce_customer_profiles')
        .select(`
          id,
          customer_id,
          first_name,
          last_name,
          street_address,
          apartment,
          city,
          state,
          pincode
        `)
        .eq('customer_id', customer.id)
        .maybeSingle();

    if (ecommerceFetchError) {
      console.error(
        "ECOMMERCE PROFILE LOOKUP ERROR:",
        ecommerceFetchError
      );
      throw new Error("Unable to load ecommerce profile.");
    }

    let profile = ecommerceProfile;

    // Create ecommerce-only profile for first-time website users
    if (!profile) {
      const { data: newProfile, error: profileCreateError } =
        await supabaseAdmin
          .from('ecommerce_customer_profiles')
          .insert({
            customer_id: customer.id,
            first_name: '',
            last_name: '',
          })
          .select(`
            id,
            customer_id,
            first_name,
            last_name,
            street_address,
            apartment,
            city,
            state,
            pincode
          `)
          .single();

      if (profileCreateError) {
        console.error("ECOMMERCE PROFILE CREATE ERROR:", {
          code: profileCreateError.code,
          message: profileCreateError.message,
          details: profileCreateError.details,
          hint: profileCreateError.hint,
        });

        throw new Error(
          profileCreateError.message ||
          "Failed to create ecommerce profile."
        );
      }

      profile = newProfile;
    }

    // --------------------------------------------------
    // 10. Return everything needed by frontend
    // --------------------------------------------------
    return {
      success: true,
      customer: {
        ...customer,
        ecommerce_profile: profile,
      },
    };
  });