'use server';

import { registerConnector } from '../../lib/server-db';

export async function registerConnectorAction(formData: FormData) {
  const url = formData.get('url') as string;
  const name = formData.get('name') as string;

  if (!url) {
    return { error: 'URL is required' };
  }

  try {
     const connector = await registerConnector(url, name);
     return { 
         success: true, 
         connectorId: connector.id, 
         connectorSecret: connector.secret 
     };
  } catch (e) {
      return { error: 'Failed to register connector' };
  }
}
