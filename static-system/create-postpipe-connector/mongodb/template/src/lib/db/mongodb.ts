import { MongoClient, Db } from 'mongodb';
import { DatabaseAdapter, PostPipeIngestPayload } from '../../types';

export class MongoAdapter implements DatabaseAdapter {
  private client: MongoClient;
  private db: Db | null = null;
  private uri: string;
  private dbName: string;
  private collectionName: string;

  constructor() {
    this.uri = process.env.MONGODB_URI || '';
    this.dbName = process.env.MONGODB_DB_NAME || 'postpipe_data';
    this.collectionName = process.env.MONGODB_COLLECTION || 'submissions';

    if (!this.uri) {
      throw new Error("MONGODB_URI is required for MongoAdapter");
    }
    
    this.client = new MongoClient(this.uri);
  }

  async connect(): Promise<void> {
    if (!this.db) {
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      console.log(`[MongoAdapter] Connected to ${this.dbName}`);
    }
  }

  async insert(payload: PostPipeIngestPayload): Promise<void> {
    if (!this.db) await this.connect();
    
    // We store the whole payload, or just the data?
    // "Connector Logic: Persist data to database"
    // Usually we want the metadata too (submissionId, timestamp).
    // Let's store the whole object.
    
    await this.db!.collection(this.collectionName).insertOne({
      ...payload,
      _receivedAt: new Date()
    });
    
    console.log(`[MongoAdapter] Saved submission ${payload.submissionId}`);
  }

  async disconnect(): Promise<void> {
    await this.client.close();
  }
}
