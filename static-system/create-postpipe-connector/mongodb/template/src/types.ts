export interface PostPipeIngestPayload {
  formId: string;
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
  disconnect?(): Promise<void>;
}

export interface ConnectorConfig {
  connectorId: string;
  connectorSecret: string;
  port: number;
}
