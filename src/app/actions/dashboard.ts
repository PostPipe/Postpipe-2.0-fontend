'use server';

import crypto from 'crypto';
import {
  getForms,
  getForm,
  getConnector,
  getConnectors,
  deleteForm,
  deleteConnector,
  duplicateForm,
  updateForm,
  getSystems,
  createSystem,
  updateSystem,
  createForm,
  getRBACSystems,
  createRBACSystem,
  updateRBACSystem,
  deleteRBACSystem,
  deleteAuthPreset,
  deleteSystem,
  System
} from '../../lib/server-db';
import { ensureFullUrl } from '../../lib/utils';

import { getSession } from '../../lib/auth/actions';
import { sendMasterAdminSetupEmail } from '../../lib/auth/email';

export async function getDashboardData() {
  const session = await getSession();
  if (!session || !session.userId) {
    // Return empty data if not authenticated
    return { forms: [], connectors: [], systems: [] };
  }

  // Fetch all data in parallel
  const [forms, connectors, baseSystems, rbacSystems] = await Promise.all([
    getForms(session.userId),
    getConnectors(session.userId),
    getSystems(session.userId),
    getRBACSystems(session.userId)
  ]);
  
  const systems = [...baseSystems, ...rbacSystems];

  // Create a map for fast O(1) connector lookup
  const connectorMap = new Map(connectors.map(c => [c.id, c]));

  // Enhance forms with data from the pre-fetched connectors
  const formsWithSecrets = forms.map(f => {
    const connector = connectorMap.get(f.connectorId);
    
    // If no connector, return form with placeholders
    if (!connector) {
      return {
        ...f,
        connectorUrl: '#',
        connectorName: 'Missing Connector',
        readToken: null,
        publicSubmitUrl: `http://localhost:3000/api/public/submit/${f.id}`,
        connectorGetterUrl: null
      };
    }

    // Generate Read Token
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
      connectorUrl: ensureFullUrl(connector.url),
      connectorName: connector.name,
      readToken: token,
      publicSubmitUrl: `http://localhost:3000/api/public/submit/${f.id}`,
      connectorGetterUrl: `${ensureFullUrl(connector.url)}/api/postpipe/forms/${f.id}/submissions`
    };
  });

  const validForms = formsWithSecrets;

  // Serialize forms
  const serializedForms = validForms.map((f: any) => ({
    ...f,
    _id: f._id?.toString(),
    id: f.id?.toString(),
    connectorId: f.connectorId?.toString(),
  }));

  // Serialize connectors
  const serializedConnectors = connectors.map((c: any) => ({
    ...c,
    _id: c._id?.toString(),
    id: c.id?.toString(),
  }));

  const serializedSystems = systems.map((s: any) => ({
    ...s,
    _id: s._id?.toString(),
    id: s.id?.toString(),
  }));

  return { forms: serializedForms, connectors: serializedConnectors, systems: serializedSystems };
}

export async function duplicateFormAction(id: string) {
  const session = await getSession();
  if (!session || !session.userId) throw new Error("Unauthorized");

  await duplicateForm(id, session.userId);
  return { success: true };
}

export async function toggleFormStatusAction(id: string) {
  const session = await getSession();
  if (!session || !session.userId) throw new Error("Unauthorized");

  const form = await getForm(id);
  if (!form) return { success: false, error: "Form not found" };
  if (form.userId !== session.userId) throw new Error("Unauthorized");

  const newStatus = form.status === 'Live' ? 'Paused' : 'Live';
  await updateForm(id, { status: newStatus });

  return { success: true, status: newStatus };
}

export async function createSystemAction(name: string, type: string, templateId?: string) {
  const session = await getSession();
  if (!session || !session.userId) throw new Error("Unauthorized");

  const system = await createSystem(name, type, templateId, session.userId);
  
  return {
    ...system,
    _id: (system as any)._id?.toString(),
    id: system.id?.toString(),
  };
}

export async function updateSystemAction(id: string, updates: Partial<System>) {
  const session = await getSession();
  if (!session || !session.userId) throw new Error("Unauthorized");
  await updateSystem(id, session.userId, updates);

  return { success: true };
}

export async function createRBACSystemAction(payload: {
  name: string;
  connectorId: string;
  targetDatabase?: string;
  tableName: string;
  rolesCol: string;
  emailCol: string;
  passwordCol: string;
  managedForms?: string[];
}) {
  const session = await getSession();
  if (!session || !session.userId) throw new Error("Unauthorized");

  const { name, connectorId, targetDatabase, tableName, rolesCol, emailCol, passwordCol, managedForms } = payload;
  const connector = await getConnector(connectorId);
  if (!connector) throw new Error("Connector not found");

  // Step 1: Create Roles Form
  const rolesFormName = `Roles`;
  const rolesFields = [
    { name: 'name', type: 'text', required: true }
  ];
  const rolesForm = await createForm(connectorId, rolesFormName, rolesFields, session.userId, targetDatabase, undefined, name);

  // Step 2: Create Permissions Form
  const permsFormName = `Permissions`;
  const permsFields = [
    { 
      name: 'role', 
      type: 'relation', 
      required: true, 
      isRelationalSource: false, 
      reference: { collection: rolesForm.id, displayField: 'name' } 
    },
    { name: 'accessible_forms', type: 'list', required: false }
  ];
  const permsForm = await createForm(connectorId, permsFormName, permsFields, session.userId, targetDatabase, undefined, name);

  // Step 3: Save RBAC System configuration
  const system = await createRBACSystem(name, connectorId, session.userId);
  await updateRBACSystem(system.id, session.userId, {
    settings: {
      targetDatabase,
      tableName,
      rolesCol,
      emailCol,
      passwordCol,
      rolesFormId: rolesForm.id,
      permissionsFormId: permsForm.id,
      managedForms: managedForms || []
    }
  });

  // Step 4: Trigger Connector Initialization
  try {
    const connectorUrl = ensureFullUrl(connector.url);
    await fetch(`${connectorUrl}/api/rbac/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${connector.secret}`
      },
      body: JSON.stringify({
        tableName,
        rolesCol,
        targetDatabase
      })
    });
  } catch (e) {
    console.warn("Could not reach connector to initialize RBAC schema:", e);
  }

  // Step 5: Init Master Admin
  let fallbackSetupLink = null;
  try {
    const postpipeDashboardUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const connectorUrl = ensureFullUrl(connector.url);
    const res = await fetch(`${connectorUrl}/api/auth/init-master-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${connector.secret}`
      },
      body: JSON.stringify({
        email: session.email,
        targetDatabase,
        postpipeDashboardUrl
      })
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data.setupLink) {
        await sendMasterAdminSetupEmail(session.email, data.setupLink);
        // Fallback UI for local development if Resend is not configured on Postpipe
        if (!process.env.RESEND_API_KEY) {
          fallbackSetupLink = data.setupLink;
        }
      }
    }
  } catch (e) {
    console.warn("Could not reach connector to initialize master admin:", e);
  }

  return { success: true, systemId: system.id, fallbackSetupLink };
}

export async function deleteRBACSystemAction(id: string) {
  const session = await getSession();
  if (!session || !session.userId) throw new Error("Unauthorized");
  await deleteRBACSystem(id, session.userId);
  return { success: true };
}

export async function updateRBACSystemAction(id: string, updates: any) {
  const session = await getSession();
  if (!session || !session.userId) throw new Error("Unauthorized");
  await updateRBACSystem(id, session.userId, updates);
  return { success: true };
}

export async function deleteFormAction(id: string) {
  const session = await getSession();
  if (!session || !session.userId) {
    throw new Error("Unauthorized");
  }

  const form = await getForm(id);
  if (!form) return { success: false, error: "Form not found" };

  if (form.userId !== session.userId) {
    throw new Error("Unauthorized");
  }

  await deleteForm(id);
  return { success: true };
}

export async function bulkUpdateFormGroupsAction(formIds: string[], groupName: string) {
  const session = await getSession();
  if (!session || !session.userId) throw new Error("Unauthorized");

  const dbModule = await import('../../lib/server-db');
  
  // Update each form (in a real production app, we'd use a bulkWrite or updateMany with filter)
  // For simplicity and to reuse updateForm logic:
  await Promise.all(formIds.map(id => dbModule.updateForm(id, { group: groupName || undefined })));

  return { success: true };
}

export async function bulkDeleteFormsAction(formIds: string[]) {
  const session = await getSession();
  if (!session || !session.userId) throw new Error("Unauthorized");

  const dbModule = await import('../../lib/server-db');
  
  await Promise.all(formIds.map(async (id) => {
    const form = await dbModule.getForm(id);
    if (form && form.userId === session.userId) {
      await dbModule.deleteForm(id);
    }
  }));

  return { success: true };
}

export async function deleteConnectorAction(id: string) {
  const session = await getSession();
  if (!session || !session.userId) {
    throw new Error("Unauthorized");
  }

  const connector = await getConnector(id);
  if (!connector) return { success: false, error: "Connector not found" };



  // We pass session.userId to ensure we only delete if it belongs to the user
  await deleteConnector(id, session.userId);
  return { success: true };
}

export async function getConnectorsAction() {
  const session = await getSession();
  if (!session || !session.userId) {
    throw new Error("Unauthorized");
  }

  const connectors = await getConnectors(session.userId);
  return connectors.map((c: any) => ({
    ...c,
    _id: c._id?.toString(),
    id: c.id?.toString(),
  }));
}

export async function deleteAuthPresetAction(id: string) {
  const session = await getSession();
  if (!session || !session.userId) throw new Error("Unauthorized");
  await deleteAuthPreset(session.userId, id);
  return { success: true };
}

/**
 * Returns a lightweight list of the user's forms for use as
 * reference-field collection options in the form builder.
 */
export async function getFormsAction() {
  const session = await getSession();
  if (!session || !session.userId) return [];

  const forms = await getForms(session.userId);
  return forms.map((f: any) => ({
    id: f.id,
    name: f.name,
    fields: (f.fields || []).map((field: any) => ({
      name: field.name,
      type: field.type,
    })),
  }));
}

export async function deleteSystemAction(id: string) {
  const session = await getSession();
  if (!session || !session.userId) throw new Error("Unauthorized");
  
  const dbModule = await import('../../lib/server-db');
  await dbModule.deleteSystem(id, session.userId);
  return { success: true };
}

export async function updateRBACSystemSettingsAction(systemId: string, updates: any) {
  const session = await getSession();
  if (!session || !session.userId) throw new Error("Unauthorized");
  
  const dbModule = await import('../../lib/server-db');
  await dbModule.updateRBACSystem(systemId, session.userId, updates);
  return { success: true };
}
