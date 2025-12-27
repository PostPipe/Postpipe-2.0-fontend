import { DatabaseAdapter } from '../../types';
import { MongoAdapter } from './mongodb';

export function getAdapter(): DatabaseAdapter {
  // Auto-detect MongoDB if URI is present
  const type = process.env.DB_TYPE?.toLowerCase() || (process.env.MONGODB_URI ? 'mongodb' : undefined);

  switch (type) {
    case 'mongodb':
      return new MongoAdapter();
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
