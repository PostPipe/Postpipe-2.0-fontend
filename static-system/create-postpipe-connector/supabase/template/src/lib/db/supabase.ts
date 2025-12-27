import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DatabaseAdapter, PostPipeIngestPayload } from '../../types';

export class SupabaseAdapter implements DatabaseAdapter {
  private supabase: SupabaseClient;
  private tableName: string;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // Must be service key to write
    this.tableName = process.env.SUPABASE_TABLE || 'postpipe_submissions';

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("SUPABASE_URL and SUPABASE_SERVICE_KEY are required");
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async connect(): Promise<void> {
    // Supabase is stateless, just verify credentials with a light ping if possible
    // or just assume it works.
    console.log(`[SupabaseAdapter] Initialized for table '${this.tableName}'`);
  }

  async insert(payload: PostPipeIngestPayload): Promise<void> {
    const { submissionId, formId, data, ...rest } = payload;
    
    const { error } = await this.supabase
      .from(this.tableName)
      .insert({
        submission_id: submissionId,
        form_id: formId,
        data: data,
        metadata: rest,
      });

    if (error) {
      throw new Error(`Supabase Insert Error: ${error.message}`);
    }
    
    console.log(`[SupabaseAdapter] Saved submission ${submissionId}`);
  }
}
