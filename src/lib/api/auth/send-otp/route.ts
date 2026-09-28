import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    if (!phone) return NextResponse.json({ error: 'Phone number required' }, { status: 400 });

    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.length === 10) formattedPhone = '91' + formattedPhone;

    // 1. Generate 6-digit OTP and 5-minute expiration
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // 2. Invalidate older unused OTPs for this number
    await supabaseAdmin
      .from('otp_verifications')
      .delete()
      .eq('phone', formattedPhone);

    // 3. Save new OTP record
    const { error: dbError } = await supabaseAdmin.from('otp_verifications').insert({
      phone: formattedPhone,
      otp_code: otp,
      expires_at: expiresAt,
    });
    if (dbError) throw dbError;

    // 4. Dispatch via your Convo360 /api/whatsapp route
    const waRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'message.sendDirect',
        payload: {
          user_id: formattedPhone,
          template_name: 'otp_verification', // Must match your approved template name in Convo360
          lang: 'en',
          namespace: 'bfbb14c4_778e_453b_97c2_92f60bb9e978',
          parameters: [otp] // Variable {{1}} in WhatsApp template
        }
      })
    });

    if (!waRes.ok) {
      const errData = await waRes.json();
      throw new Error(errData.message || 'WhatsApp gateway failure');
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}