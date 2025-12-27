'use server';

import { createForm, getConnectors } from '../../lib/server-db';

export async function createFormAction(formData: FormData) {
  const name = formData.get('name') as string;
  const connectorId = formData.get('connectorId') as string;
  const fieldsJson = formData.get('fields') as string;

  if (!name || !connectorId) {
    return { error: 'Name and Connector are required' };
  }

  let fields = [];
  try {
      fields = JSON.parse(fieldsJson);
  } catch (e) {
      return { error: 'Invalid fields data' };
  }

  try {
     const form = await createForm(connectorId, name, fields);
     return { success: true, formId: form.id };
  } catch (e) {
      return { error: 'Failed to create form' };
  }
}

export async function getConnectorsAction() {
    const connectors = await getConnectors();
    return connectors.map((c: any) => ({
        ...c,
        _id: c._id.toString(),
        id: c.id?.toString() || '',
    }));
}
