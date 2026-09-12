'use server';

import { registerConnector, updateConnectorUrl } from '../../lib/server-db';
import { getSession } from '../../lib/auth/actions';

export async function registerConnectorAction(formData: FormData) {
  const url = formData.get('url') as string; // Optional now
  const name = formData.get('name') as string;
  const envPrefix = formData.get('envPrefix') as string;

  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { error: 'Unauthorized' };
    }

    const connector = await registerConnector(url || null, name, session.userId, envPrefix);
    return {
      success: true,
      connectorId: connector.id,
      connectorSecret: connector.secret
    };
  } catch (e: any) {
    if (e.message && e.message.includes('PLAN_LIMIT_REACHED')) {
      return { error: e.message.replace('PLAN_LIMIT_REACHED: ', '') };
    }
    return { error: 'Failed to register connector' };
  }
}

export async function finalizeConnectorAction(id: string, url: string) {
  if (!id || !url) {
    return { error: 'Connector ID and URL are required' };
  }

  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { error: 'Unauthorized' };
    }

    await updateConnectorUrl(id, url, session.userId);
    return { success: true };
  } catch (e) {
    return { error: 'Failed to verify connector' };
  }
}

export async function getUserGitHubInstallations() {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { error: 'Unauthorized' };
    }

    const { connectDB } = await import('../../lib/server-db');
    const db = await connectDB();
    
    // Find all installations for this user
    const installations = await db.collection('github_installations')
      .find({ userId: session.userId })
      .sort({ updatedAt: -1 })
      .toArray();
      
    return { 
      success: true, 
      installations: JSON.parse(JSON.stringify(installations)) 
    };
  } catch (e) {
    return { error: 'Failed to fetch installations' };
  }
}
