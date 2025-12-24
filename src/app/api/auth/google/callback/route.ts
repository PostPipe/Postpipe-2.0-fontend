import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/auth/mongodb';
import User from '@/lib/auth/User';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  
  if (!code) {
      return NextResponse.redirect(new URL('/login?error=no_code', req.url));
  }
  
  try {
      // 1. Exchange code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
              code,
              client_id: process.env.GOOGLE_CLIENT_ID!,
              client_secret: process.env.GOOGLE_CLIENT_SECRET!,
              redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`,
              grant_type: 'authorization_code',
          }),
      });
      
      const tokens = await tokenResponse.json();
      
      if (!tokens.access_token) {
           return NextResponse.redirect(new URL('/login?error=token_exchange_failed', req.url));
      }
      
      // 2. Get User Info
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
           headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      
      const googleUser = await userResponse.json();
      
      if (!googleUser.email) {
          return NextResponse.redirect(new URL('/login?error=no_email', req.url));
      }

      await dbConnect();
      
      // 3. Find or Create User
      let user = await User.findOne({ email: googleUser.email });
      
      if (user) {
          if (!user.googleId) {
             user.googleId = googleUser.id;
             if (!user.image) user.image = googleUser.picture;
             await user.save();
          }
      } else {
          user = await User.create({
              name: googleUser.name || googleUser.email.split('@')[0],
              email: googleUser.email,
              googleId: googleUser.id,
              image: googleUser.picture,
              isVerified: true, // Google emails are verified
          });
      }
      
      // 4. Create Session
       const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        const cookieStore = await cookies();
        cookieStore.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/',
        });

        // Client readable cookie
        cookieStore.set('postpipe_auth', encodeURIComponent(user.email), {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/',
        });
        
        return NextResponse.redirect(new URL('/dashboard/forms', req.url));

  } catch (error) {
      console.error("Google Auth Error:", error);
      return NextResponse.redirect(new URL('/login?error=server_error', req.url));
  }
}
