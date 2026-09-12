import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/server-db';
import { getAppOctokit } from '@/lib/github/octokit';

import { getSession } from '@/lib/auth/actions';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const installation_id = searchParams.get('installation_id');
  const setup_action = searchParams.get('setup_action');
  
  if (!installation_id) {
    return NextResponse.json({ error: 'Missing installation_id' }, { status: 400 });
  }

  try {
    const session = await getSession();
    const userId = session?.userId || '000000000000000000000000'; // Fallback just in case

    const db = await connectDB();
    const octokit = getAppOctokit();
    
    // Fetch installation details from GitHub to know who installed it
    const { data: installation } = await octokit.request('GET /app/installations/{installation_id}', {
      installation_id: parseInt(installation_id),
    });

    const account = installation.account as any;
    const accountName = account?.login || account?.name || 'unknown';
    const accountType = account?.type || 'User';

    // Store or update in DB using MongoDB native driver
    await db.collection('github_installations').updateOne(
      { installationId: parseInt(installation_id) },
      {
        $set: {
          installationId: parseInt(installation_id),
          userId: userId, // Link to actual authenticated User ID from session
          accountName,
          accountType,
          repositorySelection: installation.repository_selection,
          updatedAt: new Date(),
        }
      },
      { upsert: true }
    );

    // Redirect the user back to the static connector creation page
    return NextResponse.redirect(new URL(`/static?github_connected=true&installation_id=${installation_id}`, req.url));
  } catch (error: any) {
    console.error('Error handling GitHub callback:', error);
    return NextResponse.json({ error: 'Failed to process installation', details: error.message }, { status: 500 });
  }
}
