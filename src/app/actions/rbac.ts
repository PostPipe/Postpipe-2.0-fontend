'use server';

import crypto from 'crypto';
import { getSession } from '../../lib/auth/actions';
import { getConnector, saveRBACState, getRBACState, createRBACSystem, getRBACSystems, updateRBACSystem, deleteRBACSystem } from '../../lib/server-db';
import { ensureFullUrl } from '../../lib/utils';

export async function fetchRBACStateAction(connectorId: string) {
  const session = await getSession();
  if (!session || !session.userId) throw new Error("Unauthorized");

  // Verify ownership of connector
  const connector = await getConnector(connectorId);
  if (!connector) throw new Error("Connector not found");
  // Ideally, verify the connector belongs to session.userId (getConnector currently fetches globally but we should verify)

  const state = await getRBACState(session.userId, connectorId);
  return state || { roles: [], permissions: [], users: [] };
}

export async function createRBACSystemAction(name: string, connectorId: string) {
  const session = await getSession();
  if (!session || !session.userId) throw new Error("Unauthorized");
  return await createRBACSystem(session.userId, name, connectorId);
}

export async function getRBACSystemsAction() {
  const session = await getSession();
  if (!session || !session.userId) throw new Error("Unauthorized");
  return await getRBACSystems(session.userId);
}

export async function deleteRBACSystemAction(systemId: string) {
  const session = await getSession();
  if (!session || !session.userId) throw new Error("Unauthorized");
  await deleteRBACSystem(session.userId, systemId);
}

export async function dispatchRBACWebhookAction(connectorId: string, state: any, rbacSystemId?: string) {
  const session = await getSession();
  if (!session || !session.userId) throw new Error("Unauthorized");

  const connector = await getConnector(connectorId);
  if (!connector) throw new Error("Connector not found");

  // 1. Save state in Postpipe internally
  if (rbacSystemId) {
    await updateRBACSystem(session.userId, rbacSystemId, state);
  } else {
    await saveRBACState(session.userId, connectorId, state);
  }

  // 2. Prepare Webhook Payload
  const payload = {
    type: 'rbac.sync',
    timestamp: new Date().toISOString(),
    data: state,
  };

  const bodyString = JSON.stringify(payload);
  const signature = crypto
    .createHmac('sha256', connector.secret)
    .update(bodyString)
    .digest('hex');

  const ingestUrl = `${ensureFullUrl(connector.url)}/postpipe/rbac/sync`;
  
  // 3. Dispatch to User's Connector Webhook
  try {
    const res = await fetch(ingestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-postpipe-signature': signature
      },
      body: bodyString
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[RBAC Sync] Webhook failed: Status=${res.status} Text=${errText}`);
      if (res.status === 404) {
        return { success: false, error: `Endpoint /postpipe/rbac/sync is not implemented on your connector` };
      }
      return { success: false, error: `Connector webhook returned status ${res.status}` };
    }
    
    return { success: true };
  } catch (e: any) {
    console.error(`[RBAC Sync] Connection failed to ${ingestUrl}`, e);
    return { success: false, error: `Could not connect to your connector. Is it running?` };
  }
}

export async function saveRBACProjectConfigAction(systemId: string, configUpdates: any) {
  const session = await getSession();
  if (!session || !session.userId) throw new Error("Unauthorized");

  // In production, encrypt the JWT secret before saving
  if (configUpdates.jwtConfig && configUpdates.jwtConfig.secret) {
     // NOTE: We should use AES-256-GCM encryption here via the backend's utility.
     // For this action, we simulate it by storing a marker or we can just call the backend API if we had one.
     // Assuming the encryption logic is available or will be processed.
     configUpdates.jwtConfig.encryptedSecret = `enc_${Buffer.from(configUpdates.jwtConfig.secret).toString('base64')}`;
     delete configUpdates.jwtConfig.secret;
  }

  await updateRBACSystem(session.userId, systemId, configUpdates);
  return { success: true };
}

export async function bootstrapMasterAdminAction(systemId: string, adminData: any) {
  const session = await getSession();
  if (!session || !session.userId) throw new Error("Unauthorized");

  const systems = await getRBACSystems(session.userId);
  const system = systems.find((s: any) => s.id === systemId);
  if (!system) throw new Error("System not found");

  const connector = await getConnector(system.connectorId);
  if (!connector) throw new Error("Connector not found");

  const schema = system.schemaMapping;
  if (!schema) throw new Error("Schema not configured");

  // Route INSERT to connector
  const operation = {
    verb: 'insertOne',
    entity: 'user',
    data: {
      [schema.fields.email]: adminData.email,
      [schema.fields.passwordHash]: adminData.password, // Frontend should send hashed password if possible, or backend hashes it
      // Adding role mapping directly or setting a flag
    }
  };

  const payload = JSON.stringify({
    operation: {
      verb: operation.verb,
      table: schema.usersTable,
      data: operation.data
    },
    databaseType: system.databaseType,
    timestamp: new Date().toISOString()
  });

  const signature = crypto
    .createHmac('sha256', connector.secret)
    .update(payload)
    .digest('hex');

  const url = `${connector.url}/postpipe/rbac/query`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-postpipe-signature': signature
      },
      body: payload
    });

    if (!res.ok) {
      return { success: false, error: 'Failed to bootstrap admin' };
    }
    
    return { success: true };
  } catch (err) {
    return { success: false, error: 'Could not reach connector' };
  }
}
