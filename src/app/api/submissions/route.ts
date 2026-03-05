import { NextRequest, NextResponse } from 'next/server';
import { getForm, getConnector, getUserDatabaseConfig } from '@/lib/server-db';
import { ensureFullUrl } from '@/lib/utils';
import { getSession } from '@/lib/auth/actions';

export async function GET(req: NextRequest) {
    console.log("[API] Incoming request to /api/submissions");
    
    // 1. Authenticate user
    const session = await getSession();
    if (!session || !session.userId) {
        return NextResponse.json({ status: "error", error: "Unauthorized" }, { status: 401 });
    }

    // 2. Extract query parameters
    const url = new URL(req.url);
    const formId = url.searchParams.get("formId");

    if (!formId) {
        return NextResponse.json({ status: "error", error: "Missing formId" }, { status: 400 });
    }

    try {
        // 3. Get Form
        const form = await getForm(formId);
        if (!form) {
            return NextResponse.json({ status: "error", error: "Form not found" }, { status: 404 });
        }

        // Ensure user owns this form
        if (form.userId !== session.userId) {
            return NextResponse.json({ status: "error", error: "Forbidden" }, { status: 403 });
        }

        // 4. Get Connector
        console.log(`[API] Connector lookup for Form ${formId}: ${form.connectorId}`);
        const connector = await getConnector(form.connectorId);
        
        if (!connector) {
            return NextResponse.json({ status: "error", error: "Connector not found" }, { status: 404 });
        }

        if (!connector.secret) {
            console.error(`[API] Critical: Connector ${connector.id} has no valid secret.`);
            return NextResponse.json({ status: "error", error: "Connector configuration error (missing secret)" }, { status: 500 });
        }

        // 5. Build connection map (User DB Config vs Connector DB Config)
        let databaseConfig = null;
        const target = form.targetDatabase || "default";

        // Try user global config first
        if (form.userId) {
            const userConfig = await getUserDatabaseConfig(form.userId);
            if (userConfig?.databases?.[target]) {
                databaseConfig = userConfig.databases[target];
            }
        }

        // Fallback to connector config
        if (!databaseConfig && connector.databases?.[target]) {
            databaseConfig = connector.databases[target];
        }

        // Build list of all multi-node targets to fetch from
        const allTargets = new Map<string, any>();
        allTargets.set(target, databaseConfig || {});

        const userConfig = await getUserDatabaseConfig(form.userId || "");
        if (userConfig?.databases) {
            Object.entries(userConfig.databases).forEach(([alias, config]) => allTargets.set(alias, config));
        }
        if (connector.databases) {
            Object.entries(connector.databases).forEach(([alias, config]) => allTargets.set(alias, config));
        }

        // 6. Fetch from Connector Adapter
        console.log(`[API] Firing fetch requests to Connector ${connector.url} for ${allTargets.size} configured targets`);
        const MAX_RETRIES = 3;

        const fetchWithRetry = async (targetAlias: string, targetConfig: any, attempt: number = 0): Promise<any> => {
            const queryParams = new URLSearchParams({
                formId: form.id,
                limit: "100",
                targetDatabase: targetAlias,
                databaseConfig: JSON.stringify(targetConfig) // Pass dynamic config to connector
            });

            const baseUrl = ensureFullUrl(connector.url);
            const fetchUrl = `${baseUrl}/postpipe/data?${queryParams.toString()}`;

            try {
                const res = await fetch(fetchUrl, {
                    headers: { Authorization: `Bearer ${connector.secret}` },
                    cache: 'no-store'
                });

                if (res.ok) {
                    const data = await res.json();
                    return { ok: true, data: data.data || [] };
                }
                if (res.status === 401 || res.status === 403) {
                    return { ok: false, error: "AuthFailed" };
                }
                
                throw new Error(`Connector Error: ${res.status}`);
            } catch (err: any) {
                // SSL Fallback
                const errMsg = String(err);
                if ((errMsg.includes('ssl') || errMsg.includes('certificate') || errMsg.includes('ECONNREFUSED')) && fetchUrl.startsWith('https://')) {
                    const fallbackUrl = fetchUrl.replace(/^https:\/\//, 'http://');
                    const res = await fetch(fallbackUrl, {
                        headers: { Authorization: `Bearer ${connector.secret}` },
                        cache: 'no-store'
                    });
                    if (res.ok) {
                        const data = await res.json();
                        return { ok: true, data: data.data || [] };
                    }
                }

                if (attempt < MAX_RETRIES) {
                    await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt)));
                    return fetchWithRetry(targetAlias, targetConfig, attempt + 1);
                }
                return { ok: false, error: err.message };
            }
        };

        const fetchPromises = Array.from(allTargets.entries()).map(([alias, config]) => {
            return fetchWithRetry(alias, config);
        });

        // 7. Aggregate records securely
        const results = await Promise.all(fetchPromises);
        let mergedRecords: any[] = [];
        let authFailed = false;

        for (const result of results) {
            if (result.ok && Array.isArray(result.data)) {
                mergedRecords = [...mergedRecords, ...result.data];
            } else if (!result.ok && result.error === "AuthFailed") {
                authFailed = true;
            }
        }

        if (authFailed && mergedRecords.length === 0) {
            return NextResponse.json({ status: "error", error: "Connector Authentication Failed" }, { status: 401 });
        }

        // Sort descending by timestamp
        mergedRecords.sort((a, b) => {
            const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
            const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
            return dateB - dateA;
        });

        console.log(`[API] Successfully retrieved ${mergedRecords.length} records. Sending to client.`);
        
        // 8. Return JSON
        return NextResponse.json({
            status: "success",
            records: mergedRecords
        });

    } catch (e: any) {
        console.error("[API] Internal Error fetching submissions:", e);
        return NextResponse.json({ status: "error", error: "Internal Server Error" }, { status: 500 });
    }
}
