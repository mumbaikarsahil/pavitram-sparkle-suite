import { getRequest, setResponseHeader } from '@tanstack/react-start/server';

const SESSION_COOKIE_NAME = 'pavitram_auth_session';
const SESSION_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || 'pavitram-default-super-secret-key-32';

// 1. Sign data using Web Crypto HMAC-SHA256
async function signData(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// 2. Generate a tamper-proof session token (expires in 30 days)
export async function createSessionToken(customerId: string, phone: string): Promise<string> {
  const payload = JSON.stringify({
    customerId,
    phone,
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
  });
  const encodedPayload = btoa(payload).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const signature = await signData(encodedPayload, SESSION_SECRET);
  return `${encodedPayload}.${signature}`;
}

// 3. Verify session token and extract customerId securely
export async function verifySessionToken(token: string): Promise<{ customerId: string; phone: string } | null> {
  try {
    const [encodedPayload, signature] = token.split('.');
    if (!encodedPayload || !signature) return null;

    const expectedSignature = await signData(encodedPayload, SESSION_SECRET);
    if (signature !== expectedSignature) return null;

    const rawPayload = atob(encodedPayload.replace(/-/g, '+').replace(/_/g, '/'));
    const data = JSON.parse(rawPayload);

    if (Date.now() > data.exp) return null;
    return { customerId: data.customerId, phone: data.phone };
  } catch {
    return null;
  }
}

// 4. Attach HttpOnly Cookie to Response
export function setAuthCookie(sessionToken: string) {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieValue = `${SESSION_COOKIE_NAME}=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}${isProduction ? '; Secure' : ''}`;
  setResponseHeader('Set-Cookie', cookieValue);
}

// 5. Clear Auth Cookie
export function clearAuthCookie() {
  setResponseHeader('Set-Cookie', `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

// 6. Extract Session directly from incoming request headers
export async function getAuthenticatedCustomer(): Promise<{ customerId: string; phone: string }> {
  const request = getRequest();
  const cookieHeader = request?.headers?.get('cookie') || '';
  
  const cookies = Object.fromEntries(
    cookieHeader.split('; ').filter(Boolean).map(c => {
      const [k, ...v] = c.split('=');
      return [k, v.join('=')];
    })
  );

  const token = cookies[SESSION_COOKIE_NAME];
  if (!token) {
    throw new Error('UNAUTHORIZED: No active session. Please log in.');
  }

  const session = await verifySessionToken(token);
  if (!session) {
    throw new Error('UNAUTHORIZED: Session expired or invalid. Please log in again.');
  }

  return session;
}