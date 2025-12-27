import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

const ADMIN_SECRET = process.env.ADMIN_SECRET;

export function isAuthorized(req: NextRequest): boolean {
  // 1. Check if secret is configured
  if (!ADMIN_SECRET) {
    console.error('ADMIN_SECRET is not defined in .env');
    return false;
  }

  // 2. Check for cookie (from browser)
  const cookieStore = cookies();
  const tokenCookie = cookieStore.get('admin_token');
  if (tokenCookie && tokenCookie.value === ADMIN_SECRET) {
    return true;
  }

  // 3. Check for auth header (for API calls)
  const authHeader = req.headers.get('x-admin-secret');
  if (authHeader === ADMIN_SECRET) {
    return true;
  }

  return false;
}
