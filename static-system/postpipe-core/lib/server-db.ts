import { MongoClient } from 'mongodb';

// --- Types ---
export interface Connector {
  id: string;      // Generated UUID
  secret: string;  // Generated "sk_..."
  url: string;     // e.g. http://localhost:3001
  name: string;
}

export interface FormField {
  name: string;
  type: string;    // text, email, number, etc.
  required: boolean;
}

export interface Form {
  id: string; // Slug/ID e.g. "contact-us"
  name: string;
  connectorId: string;
  fields: FormField[];
  createdAt: string;
}

// --- Persistence ---
// --- Persistence ---
// NOTE: We check this lazily or let it fail at runtime in functions to allow build-time execution without env vars.

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'postpipe_core';
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

function getClientPromise(): Promise<MongoClient> {
  if (clientPromise) return clientPromise;

  if (!uri) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
  }

  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR.
    // @ts-ignore
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      // @ts-ignore
      global._mongoClientPromise = client.connect();
    }
    // @ts-ignore
    clientPromise = global._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
  return clientPromise;
}

async function getDB() {
    const c = await getClientPromise();
    return c.db(dbName);
}

// --- Connectors ---
export async function registerConnector(url: string, name: string = 'My Connector'): Promise<Connector> {
  const db = await getDB();
  
  // Clean URL
  let cleanUrl = url.replace(/\/$/, ""); 
  
  // Check duplicates
  const existing = await db.collection<Connector>('connectors').findOne({ url: cleanUrl });
  if (existing) return existing;

  const newConnector: Connector = {
    id: `conn_${Math.random().toString(36).substr(2, 9)}`,
    secret: `sk_live_${Math.random().toString(36).substr(2, 16)}${Math.random().toString(36).substr(2, 16)}`,
    url: cleanUrl,
    name
  };

  await db.collection('connectors').insertOne(newConnector);
  return newConnector;
}

export async function getConnector(id: string): Promise<Connector | undefined> {
  const db = await getDB();
  const res = await db.collection<Connector>('connectors').findOne({ id });
  return res || undefined;
}

export async function getConnectors(): Promise<Connector[]> {
    const db = await getDB();
    return db.collection<Connector>('connectors').find({}).toArray();
}


// --- Forms ---
export async function createForm(connectorId: string, name: string, fields: FormField[]): Promise<Form> {
  const db = await getDB();
  
  // Simple slugify for ID
  const baseId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  let id = baseId;
  let counter = 1;

  while (await db.collection('forms').findOne({ id })) {
      id = `${baseId}-${counter++}`;
  }

  const newForm: Form = {
    id,
    name,
    connectorId,
    fields,
    createdAt: new Date().toISOString()
  };

  await db.collection('forms').insertOne(newForm);
  return newForm;
}

export async function getForms(): Promise<Form[]> {
  const db = await getDB();
  return db.collection<Form>('forms').find({}).toArray();
}

export async function getForm(id: string): Promise<Form | undefined> {
  const db = await getDB();
  const res = await db.collection<Form>('forms').findOne({ id });
  return res || undefined;
}

export async function deleteConnector(id: string): Promise<void> {
  const db = await getDB();
  await db.collection('connectors').deleteOne({ id });
  await db.collection('forms').deleteMany({ connectorId: id });
}

export async function deleteForm(id: string): Promise<void> {
  const db = await getDB();
  await db.collection('forms').deleteOne({ id });
}
