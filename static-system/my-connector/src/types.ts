export interface PostPipeIngestPayload {
  formId: string;
  formName?: string;
  targetDb?: string; // e.g. "secondary", "marketing"
  submissionId: string;
  timestamp: string; // ISO-8601
  data: Record<string, unknown>;
  signature: string;
}

export interface ConnectorResponse {
  status: "ok" | "error";
  stored: boolean;
  message?: string;
}

export interface DatabaseAdapter {
  connect(): Promise<void>;
  insert(submission: PostPipeIngestPayload): Promise<void>;
<<<<<<<< HEAD:static-system/packages/database/src/types.ts
  query(formId: string, limit?: number): Promise<PostPipeIngestPayload[]>;
========
  query(formId: string, options?: any): Promise<PostPipeIngestPayload[]>;
>>>>>>>> 3e6d6dc777d1b0acedc765b9e0880151889e9b2d:static-system/my-connector/src/types.ts
  disconnect?(): Promise<void>;
}

export interface ConnectorConfig {
  connectorId: string;
  connectorSecret: string;
  port: number;
}
