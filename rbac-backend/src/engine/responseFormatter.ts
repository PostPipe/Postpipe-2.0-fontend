/**
 * Response Formatter
 *
 * Normalises connector responses into a consistent API format.
 */

import type { ConnectorRBACResponse } from '../types';

interface FormattedResponse {
  success: boolean;
  data?: any;
  error?: string;
  meta?: {
    count?: number;
  };
}

/**
 * Format a successful response with optional data stripping.
 */
export function formatSuccess(data: any, count?: number): FormattedResponse {
  const res: FormattedResponse = {
    success: true,
    data: stripSensitiveFields(data),
  };
  if (count !== undefined) {
    res.meta = { count };
  }
  return res;
}

/**
 * Format an error response.
 */
export function formatError(error: string, statusHint?: number): FormattedResponse {
  return {
    success: false,
    error,
  };
}

/**
 * Format a connector response into our standard API shape.
 */
export function formatConnectorResponse(
  connectorRes: ConnectorRBACResponse
): FormattedResponse {
  if (!connectorRes.success) {
    return formatError(connectorRes.error || 'Connector operation failed');
  }

  return formatSuccess(connectorRes.data, connectorRes.count);
}

/**
 * Strip sensitive fields from user data before returning to the frontend.
 */
function stripSensitiveFields(data: any): any {
  if (!data) return data;

  if (Array.isArray(data)) {
    return data.map(stripSensitiveFields);
  }

  if (typeof data === 'object') {
    const cleaned = { ...data };
    // Remove password hashes, tokens, and internal DB fields
    const sensitiveKeys = [
      'password', 'password_hash', 'passwordHash',
      'refresh_token', 'refreshToken',
      'token_version', 'tokenVersion',
      '__v', '_rev',
    ];
    for (const key of sensitiveKeys) {
      delete cleaned[key];
    }
    return cleaned;
  }

  return data;
}
