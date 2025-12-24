import { redirect } from 'next/navigation';

export async function GET() {
  const rootUrl = 'https://github.com/login/oauth/authorize';
  const options = {
    client_id: process.env.GITHUB_CLIENT_ID || '',
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/github/callback`,
    scope: 'user:email',
  };

  const qs = new URLSearchParams(options);

  return redirect(`${rootUrl}?${qs.toString()}`);
}
