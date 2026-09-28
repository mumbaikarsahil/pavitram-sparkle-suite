import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { phone, otp } = await req.json();
    if (!phone || !otp) return NextResponse.json({ error: 'Phone and OTP required' }, { status: 400 });

    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.length === 10) formattedPhone = '91' + formattedPhone;

    // 1. Fetch valid pending record
    const { data: record, error } = await supabaseAdmin
      .from('otp_verifications')
      .select('*')
      .eq('phone', formattedPhone)
      .eq('is_verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !record) {
      return NextResponse.json({ error: 'No OTP request found. Please request a new code.' }, { status: 400 });
    }

    // 2. Validate expiry
    if (new Date() > new Date(record.expires_at)) {
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
    }

    // 3. Prevent brute-force (Limit to 5 attempts)
    if (record.attempts >= 5) {
      return NextResponse.json({ error: 'Too many incorrect attempts. Request a new OTP.' }, { status: 429 });
    }

    // 4. Verify Code
    if (record.otp_code !== otp.trim()) {
      await supabaseAdmin.from('otp_verifications').update({ attempts: record.attempts + 1 }).eq('id', record.id);
      return NextResponse.json({ error: 'Invalid verification code.' }, { status: 400 });
    }

    // 5. Mark as used
    await supabaseAdmin.from('otp_verifications').update({ is_verified: true }).eq('id', record.id);

    // 6. Find or Create Customer
    let { data: customer } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('phone', formattedPhone)
      .maybeSingle();

    if (!customer) {
      const { data: newCust, error: createErr } = await supabaseAdmin
        .from('customers')
        .insert({ phone: formattedPhone, full_name: 'Online Guest' })
        .select()
        .single();
      if (createErr) throw createErr;
      customer = newCust;
    }

    return NextResponse.json({ success: true, customer });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}