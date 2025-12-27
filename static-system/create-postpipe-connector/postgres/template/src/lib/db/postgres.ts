import { Pool } from 'pg';
import { DatabaseAdapter, PostPipeIngestPayload } from '../../types';

export class PostgresAdapter implements DatabaseAdapter {
  private pool: Pool;
  private tableName: string;

  constructor() {
    const connectionString = process.env.POSTGRES_URI;
    this.tableName = process.env.POSTGRES_TABLE || 'postpipe_submissions';

    if (!connectionString) {
      throw new Error("POSTGRES_URI is required for PostgresAdapter");
    }

    this.pool = new Pool({
      connectionString,
    });
  }

  async connect(): Promise<void> {
    // Test connection
    const client = await this.pool.connect();
    try {
      // Ensure table exists (Auto-migration for convenience)
      await client.query(`
        CREATE TABLE IF NOT EXISTS ${this.tableName} (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          submission_id TEXT UNIQUE NOT NULL,
          form_id TEXT NOT NULL,
          data JSONB NOT NULL,
          metadata JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log(`[PostgresAdapter] Connected & Verified table '${this.tableName}'`);
    } finally {
      client.release();
    }
  }

  async insert(payload: PostPipeIngestPayload): Promise<void> {
    const { submissionId, formId, data, ...rest } = payload;
    
    const query = `
      INSERT INTO ${this.tableName} (submission_id, form_id, data, metadata)
      VALUES ($1, $2, $3, $4)
    `;
    
    const values = [
      submissionId,
      formId,
      JSON.stringify(data),
      JSON.stringify(rest) // Store signature, timestamp etc in metadata
    ];

    await this.pool.query(query, values);
    console.log(`[PostgresAdapter] Saved submission ${submissionId}`);
  }
}
