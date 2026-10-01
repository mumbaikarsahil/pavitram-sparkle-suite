import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { createSessionToken, setAuthCookie, clearAuthCookie } from '../session.server';

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function getClientIp(): string {
  const request = getRequest();
  const forwarded = request?.headers?.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request?.headers?.get('x-real-ip') || '127.0.0.1';
}

// ==========================================
// 1. SECURED SEND OTP (With Multi-Layer Anti-Fraud)
// ==========================================
export const sendOtpFn = createServerFn({ method: 'POST' })
  .validator(z.object({ phone: z.string() }))
  .handler(async ({ data }) => {
    const { phone } = data;
    const clientIp = getClientIp();

    // 1. Normalize phone
    const rawDigits = phone.replace(/\D/g, '');
    const basePhone = (rawDigits.startsWith('91') && rawDigits.length === 12) 
      ? rawDigits.substring(2) 
      : rawDigits;
    const formattedPhone = `91${basePhone}`;

    if (basePhone.length !== 10) {
      throw new Error("Invalid mobile number. Please enter a valid 10-digit number.");
    }

    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000).toISOString();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000).toISOString();

    // 🛡️ ANTI-FRAUD LAYER 1: IP Rate Limit (Max 3 OTPs / 10 mins per IP)
    const { count: ipRecentRequests } = await supabaseAdmin
      .from('otp_rate_limits')
      .select('id', { count: 'exact', head: true })
      .eq('ip_address', clientIp)
      .gte('created_at', tenMinutesAgo);

    if (ipRecentRequests && ipRecentRequests >= 3) {
      throw new Error("Too many verification attempts from this network. Please wait 10 minutes.");
    }

    // 🛡️ ANTI-FRAUD LAYER 2: IP 24-Hour Cap (Max 12 OTPs / 24 hours per IP)
    const { count: ipDailyRequests } = await supabaseAdmin
      .from('otp_rate_limits')
      .select('id', { count: 'exact', head: true })
      .eq('ip_address', clientIp)
      .gte('created_at', oneDayAgo);

    if (ipDailyRequests && ipDailyRequests >= 12) {
      throw new Error("Daily verification limit reached for this device. Please try again tomorrow.");
    }

    // 🛡️ ANTI-FRAUD LAYER 3: Phone 60-Second Cooldown
    const { data: recentOtp } = await supabaseAdmin
      .from('otp_verifications')
      .select('created_at')
      .eq('phone', formattedPhone)
      .gte('created_at', oneMinuteAgo)
      .maybeSingle();

    if (recentOtp) throw new Error("Please wait 60 seconds before requesting a new code.");

    // 🛡️ ANTI-FRAUD LAYER 4: Phone 24-Hour Cap (Max 5 requests per number)
    const { count: dailyPhoneRequests } = await supabaseAdmin
      .from('otp_verifications')
      .select('id', { count: 'exact', head: true })
      .eq('phone', formattedPhone)
      .gte('created_at', oneDayAgo);

    if (dailyPhoneRequests && dailyPhoneRequests >= 5) {
      throw new Error("Maximum daily OTP requests reached for this number. Try again tomorrow.");
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000).toISOString();

    // Log IP usage for toll fraud protection
    await supabaseAdmin.from('otp_rate_limits').insert({
      ip_address: clientIp,
      phone: formattedPhone
    });

    // Invalidate prior pending OTPs
    await supabaseAdmin.from('otp_verifications').delete().eq('phone', formattedPhone);

    // Save active OTP
    const { error: dbError } = await supabaseAdmin.from('otp_verifications').insert({
      phone: formattedPhone,
      otp_code: otp,
      expires_at: expiresAt,
    });

    if (dbError) throw new Error("Database error while generating OTP.");

    // Auto-resolve subscriber in Convo360 wrapper
    try {
      await fetch('https://www.biillojewel.co.in/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'subscriber.createByPhone',
          payload: { phone: formattedPhone, name: "Pavitram Website User" }
        })
      });
    } catch (e) {
      console.warn("Subscriber auto-resolve skipped:", e);
    }

    // Dispatch WhatsApp template
    const waRes = await fetch('https://www.biillojewel.co.in/api/whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'message.sendDirect',
        payload: {
          user_id: formattedPhone,
          template_name: 'otp_verification',
          lang: 'en',
          namespace: 'bfbb14c4_778e_453b_97c2_92f60bb9e978',
          parameters: [otp],
          button_parameters: [otp]
        }
      })
    });

    if (!waRes.ok) {
      const errData = await waRes.json().catch(() => ({}));
      throw new Error(errData.message || "Failed to deliver WhatsApp verification code.");
    }

    return { success: true, message: "Verification code sent to your WhatsApp." };
  });

// ==========================================
// 2. SECURED VERIFY OTP (Issues Signed Session Cookie)
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

    const rawDigits = phone.replace(/\D/g, '');
    const basePhone = (rawDigits.startsWith('91') && rawDigits.length === 12) 
      ? rawDigits.substring(2) 
      : rawDigits;
    const phoneWith91 = `91${basePhone}`;
    const phoneWithout91 = basePhone;

    const companyId = process.env.PAVITRAM_COMPANY_ID;
    if (!companyId) throw new Error("PAVITRAM_COMPANY_ID is not configured.");

    const { data: record, error: otpFetchError } = await supabaseAdmin
      .from('otp_verifications')
      .select('*')
      .eq('phone', phoneWith91)
      .eq('is_verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpFetchError || !record) throw new Error("No active OTP request found.");
    if (new Date() > new Date(record.expires_at)) throw new Error("OTP has expired. Request a new one.");
    if (record.attempts >= 5) throw new Error("Too many incorrect attempts. Request a new code.");

    if (record.otp_code !== otp.trim()) {
      await supabaseAdmin
        .from('otp_verifications')
        .update({ attempts: record.attempts + 1 })
        .eq('id', record.id);

      throw new Error(`Invalid code. ${4 - record.attempts} attempts remaining.`);
    }

    // Mark OTP verified
    await supabaseAdmin
      .from('otp_verifications')
      .update({ is_verified: true })
      .eq('id', record.id);

    // Look up customer (both formats)
    let { data: customer } = await supabaseAdmin
      .from('customers')
      .select('id, company_id, full_name, phone, email, birth_date, anniversary_date')
      .eq('company_id', companyId)
      .or(`phone.eq.${phoneWith91},phone.eq.${phoneWithout91}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!customer) {
      const { data: newCustomer, error: createError } = await supabaseAdmin
        .from('customers')
        .insert({
          company_id: companyId,
          phone: phoneWith91,
          full_name: '',
          customer_status: 'Lead',
        })
        .select('id, company_id, full_name, phone, email, birth_date, anniversary_date')
        .single();

      if (createError) throw new Error("Failed to create customer profile.");
      customer = newCustomer;
    }

    // Ensure ecommerce profile exists
    let { data: profile } = await supabaseAdmin
      .from('ecommerce_customer_profiles')
      .select('*')
      .eq('customer_id', customer.id)
      .maybeSingle();

    if (!profile) {
      const { data: newProf } = await supabaseAdmin
        .from('ecommerce_customer_profiles')
        .insert({ customer_id: customer.id, first_name: '', last_name: '' })
        .select()
        .single();
      profile = newProf;
    }

    // 🔒 ISSUE SECURE SESSION COOKIE (Kills IDOR completely)
    const sessionToken = await createSessionToken(customer.id, customer.phone);
    setAuthCookie(sessionToken);

    return {
      success: true,
      customer: {
        ...customer,
        ecommerce_profile: profile,
      },
    };
  });

// ==========================================
// 3. LOGOUT (Invalidates Cookie)
// ==========================================
export const logoutFn = createServerFn({ method: 'POST' }).handler(async () => {
  clearAuthCookie();
  return { success: true };
});