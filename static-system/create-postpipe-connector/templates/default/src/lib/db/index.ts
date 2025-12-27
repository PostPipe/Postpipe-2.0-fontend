import { DatabaseAdapter } from '../../types';
import { MongoAdapter } from './mongodb';
import { PostgresAdapter } from './postgres';
import { SupabaseAdapter } from './supabase';

export function getAdapter(): DatabaseAdapter {
  const type = process.env.DB_TYPE?.toLowerCase();

  switch (type) {
    case 'mongodb':
      return new MongoAdapter();
    case 'postgres':
    case 'postgresql':
      return new PostgresAdapter();
    case 'supabase':
      return new SupabaseAdapter();
    default:
      console.warn(`[Config] No valid DB_TYPE set (got '${type}'). Defaulting to Memory (Dry Run).`);
      return new MemoryAdapter();
  }
}

class MemoryAdapter implements DatabaseAdapter {
  async connect() {
    console.log("[MemoryAdapter] Connected (Data will be lost on restart)");
  }
  async insert(payload: any) {
    console.log("[MemoryAdapter] Received:", JSON.stringify(payload, null, 2));
  }
}
