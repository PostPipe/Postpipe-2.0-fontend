/**
 * Project Config Service
 *
 * Loads per-project RBAC configuration from PostPipe's own metadata store.
 * This is the ONLY data PostPipe stores — connector bindings, encrypted
 * JWT secrets, and schema mappings. Never end-user data.
 */

import crypto from 'crypto';
import type { RBACProjectConfig } from '../types';

// ─── Encryption ─────────────────────────────────────────────────────────────

const MASTER_KEY = process.env.RBAC_MASTER_KEY || 'postpipe-dev-master-key-change-in-prod!!';

/**
 * Encrypt a JWT secret with AES-256-GCM.
 * Returns `iv:authTag:ciphertext` as a hex-encoded string.
 */
export function encryptJWTSecret(plaintext: string): string {
  const key = crypto.scryptSync(MASTER_KEY, 'postpipe-rbac-salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypt a JWT secret from `iv:authTag:ciphertext` format.
 */
export function decryptJWTSecret(encrypted: string): string {
  const key = crypto.scryptSync(MASTER_KEY, 'postpipe-rbac-salt', 32);
  const [ivHex, authTagHex, ciphertext] = encrypted.split(':');

  if (!ivHex || !authTagHex || !ciphertext) {
    throw new Error('Invalid encrypted secret format');
  }

  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(ivHex, 'hex')
  );
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

// ─── Config Cache ───────────────────────────────────────────────────────────

interface CacheEntry {
  config: RBACProjectConfig;
  expiresAt: number;
}

const CONFIG_CACHE = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ─── Config Loader ──────────────────────────────────────────────────────────

/**
 * Fetch the RBAC project configuration for a given project ID.
 *
 * In production this queries PostPipe's metadata MongoDB
 * (`postpipe_core.user_rbac_systems`). For now, we use the
 * PostPipe core API at POSTPIPE_CORE_URL.
 */
export async function getProjectConfig(
  projectId: string
): Promise<RBACProjectConfig | null> {
  // 1. Check cache
  const cached = CONFIG_CACHE.get(projectId);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.config;
  }

  // 2. Fetch from PostPipe core metadata API
  const coreUrl = process.env.POSTPIPE_CORE_URL || 'http://127.0.0.1:9002';

  try {
    const res = await fetch(`${coreUrl}/api/v1/rbac/project-config/${projectId}`, {
      headers: { 'x-internal-key': process.env.INTERNAL_API_KEY || '' },
    });

    if (!res.ok) {
      console.error(`[ProjectConfig] Failed to fetch config for ${projectId}: ${res.status}`);
      return null;
    }

    const data = (await res.json()) as { config: RBACProjectConfig };
    const config = data.config;

    // Decrypt the JWT secret at runtime
    if (config.jwt?.encryptedSecret) {
      config._decryptedJWTSecret = decryptJWTSecret(config.jwt.encryptedSecret);
    }

    // Cache it
    CONFIG_CACHE.set(projectId, {
      config,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return config;
  } catch (err) {
    console.error(`[ProjectConfig] Error fetching config for ${projectId}:`, err);
    return null;
  }
}

/**
 * Invalidate the cache for a project (e.g. after config update).
 */
export function invalidateConfigCache(projectId: string): void {
  CONFIG_CACHE.delete(projectId);
}
