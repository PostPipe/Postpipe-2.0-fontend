'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const ADMIN_SECRET = process.env.ADMIN_SECRET;

export async function loginAdmin(formData: FormData) {
  const secret = formData.get('secret') as string;

  if (secret === ADMIN_SECRET) {
    cookies().set('admin_token', secret, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/'
    });
    return { success: true };
  } else {
    return { success: false, message: 'Invalid Secret' };
  }
}

export async function logoutAdmin() {
  cookies().delete('admin_token');
  redirect('/admin');
}
