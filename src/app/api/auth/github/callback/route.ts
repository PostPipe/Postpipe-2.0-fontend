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
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
          },
          body: JSON.stringify({
              client_id: process.env.GITHUB_CLIENT_ID,
              client_secret: process.env.GITHUB_CLIENT_SECRET,
              code,
              redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/github/callback`,
          }),
      });
      
      const tokens = await tokenResponse.json();
      
      if (tokens.error || !tokens.access_token) {
           return NextResponse.redirect(new URL(`/login?error=token_exchange_failed&details=${tokens.error_description}`, req.url));
      }
      
      // 2. Get User Info
      const userResponse = await fetch('https://api.github.com/user', {
           headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      
      const githubUser = await userResponse.json();
      
      // GitHub email might be private, so fetch emails if needed
      let email = githubUser.email;
      if (!email) {
          const emailsResponse = await fetch('https://api.github.com/user/emails', {
              headers: { Authorization: `Bearer ${tokens.access_token}` },
          });
          const emails = await emailsResponse.json();
          const primary = emails.find((e: any) => e.primary && e.verified);
          if (primary) email = primary.email;
      }
      
      if (!email) {
          return NextResponse.redirect(new URL('/login?error=no_email_public', req.url));
      }

      await dbConnect();
      
      // 3. Find or Create User
      let user = await User.findOne({ email });
      
      if (user) {
          if (!user.githubId) {
             user.githubId = githubUser.id.toString();
             if (!user.image) user.image = githubUser.avatar_url;
             await user.save();
          }
      } else {
          user = await User.create({
              name: githubUser.name || githubUser.login,
              email: email,
              githubId: githubUser.id.toString(),
              image: githubUser.avatar_url,
              isVerified: true, // GitHub accounts are verified
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
      console.error("GitHub Auth Error:", error);
      return NextResponse.redirect(new URL('/login?error=server_error', req.url));
  }
}
