/**
 * Shared utility for resolving environment variables with optional prefixing
 */
export function getPrefixedEnv(key: string, prefix?: string): string | undefined {
    // Normalize prefix: use provided prefix, fallback to global POSTPIPE_VAR_PREFIX
    const rawPrefix = prefix || process.env.POSTPIPE_VAR_PREFIX || "";
    const cleanPrefix = rawPrefix.toUpperCase().replace(/\s+/g, '_');

    if (cleanPrefix) {
        // 1. Try Suffix format (e.g., SMTP_HOST_BENTERPRISE) - User's preferred format
        const suffixed = `${key}_${cleanPrefix}`;
        if (process.env[suffixed]) return process.env[suffixed];

        // 2. Try Prefix format (e.g., BENTERPRISE_SMTP_HOST) - Legacy/Alternative support
        const prefixed = `${cleanPrefix}_${key}`;
        if (process.env[prefixed]) return process.env[prefixed];

        // 3. If the prefix itself is a full environment variable name (for backward compatibility with old Frontend URL logic)
        if (process.env[rawPrefix]) return process.env[rawPrefix];
    }
    
    return process.env[key];
}
