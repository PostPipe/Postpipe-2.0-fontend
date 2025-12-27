'use server';

import crypto from 'crypto';
import { getForms, getForm, getConnector, getConnectors, deleteForm, deleteConnector } from '../../lib/server-db';

export async function getDashboardData() {
  const forms = await getForms();
  
  // Enhance forms with proper tokens/urls
  const formsWithSecrets = await Promise.all(forms.map(async f => {
      const connector = await getConnector(f.connectorId);
      if (!connector) return null;

      // Generate Read Token (Same logic as before, but dynamic secret)
      const payload = {
        formId: f.id,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 365) // 1 year
      };
      
      const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
      
      const signature = crypto
        .createHmac('sha256', connector.secret)
        .update(payloadB64)
        .digest('hex');
        
      const token = `pp_read_${payloadB64}.${signature}`;
      
      return {
          ...f,
          connectorUrl: connector.url,
          readToken: token,
          // The public ingest endpoint the user can use for testing
          publicSubmitUrl: `http://localhost:3000/api/public/submit/${f.id}`,
          // The direct connector getter endpoint
          connectorGetterUrl: `${connector.url}/api/postpipe/forms/${f.id}/submissions`
      };
  }));

  const validForms = formsWithSecrets.filter(Boolean);

  const connectors = await getConnectors(); // Fetch connectors directly from DB util

  return { forms: validForms, connectors };
}

export async function deleteFormAction(id: string) {
    await deleteForm(id);
    return { success: true };
}

export async function deleteConnectorAction(id: string) {
    await deleteConnector(id);
    return { success: true };
}
