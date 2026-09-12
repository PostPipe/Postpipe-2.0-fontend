"use server"

import mongoose from "mongoose";
import { getSession } from "@/lib/auth/actions";
import { revalidatePath } from "next/cache";
import { createSystem as createSystemDB, getSystems as getSystemsDB } from "@/lib/server-db";
import dbConnect from "@/lib/auth/mongodb";
import Template from "@/lib/models/Template";

// In-memory cache for template metadata to avoid redundant database roundtrips
const globalTemplateCache = new Map<string, any>();

export async function createSystem(name: string, type: string, templateId?: string) {
    const session = await getSession();
    if (!session?.userId) {
        return { success: false, message: "Please log in to add systems." };
    }

    try {
        await createSystemDB(name, type, templateId, session.userId);
        revalidatePath('/dashboard/systems');
        return { success: true, message: "System added to dashboard." };
    } catch (error) {
        console.error("Error creating system:", error);
        return { success: false, message: "Failed to create system." };
    }
}

export async function getSystems() {
    const session = await getSession();
    if (!session?.userId) return [];

    try {
        const systems = await getSystemsDB(session.userId);
        if (!systems || systems.length === 0) return [];
        
        // Find template IDs that are not in memory cache
        const uncachedTemplateIds: string[] = systems
            .map((s: any) => s.templateId)
            .filter((id: string) => id && typeof id === 'string' && !globalTemplateCache.has(id));

        if (uncachedTemplateIds.length > 0) {
            try {
                await dbConnect();
                
                // Separate valid 24-hex ObjectIds from slugs/custom IDs to prevent CastError
                const validObjectIds = uncachedTemplateIds.filter((id) =>
                    mongoose.Types.ObjectId.isValid(id) && id.length === 24
                );
                const stringSlugs = uncachedTemplateIds.filter(
                    (id) => !mongoose.Types.ObjectId.isValid(id) || id.length !== 24
                );

                const queryConditions: any[] = [];
                if (validObjectIds.length > 0) {
                    queryConditions.push({ _id: { $in: validObjectIds } });
                }
                if (stringSlugs.length > 0) {
                    queryConditions.push({ slug: { $in: stringSlugs } });
                }

                if (queryConditions.length > 0) {
                    const templates = await Template.find(
                        queryConditions.length === 1 ? queryConditions[0] : { $or: queryConditions },
                        'name slug category tags author thumbnailUrl cli aiPrompt npmPackageUrl databaseConfigurations'
                    ).lean();

                    templates.forEach((t: any) => {
                        // Sanitize databaseConfigurations sub-document to avoid BSON _id ObjectId buffers
                        const sanitizedDbConfigs = t.databaseConfigurations
                            ? t.databaseConfigurations.map((db: any) => ({
                                  databaseName: String(db.databaseName || ''),
                                  logo: String(db.logo || ''),
                                  prompt: String(db.prompt || ''),
                              }))
                            : [];

                        const sanitizedTemplate = {
                            ...t,
                            _id: t._id ? t._id.toString() : undefined,
                            databaseConfigurations: sanitizedDbConfigs,
                        };

                        if (t._id) globalTemplateCache.set(t._id.toString(), sanitizedTemplate);
                        if (t.slug) globalTemplateCache.set(t.slug, sanitizedTemplate);
                    });
                }
            } catch (enrichError) {
                console.error("Failed to enrich systems with templates:", enrichError);
            }
        }

        const mappedSystems = systems.map((sys: any) => {
            const template: any = sys.templateId ? globalTemplateCache.get(sys.templateId) : null;
            
            const dbConfigs = template?.databaseConfigurations
                ? template.databaseConfigurations.map((db: any) => ({
                      databaseName: String(db.databaseName || ''),
                      logo: String(db.logo || ''),
                      prompt: String(db.prompt || ''),
                  }))
                : undefined;

            return {
                id: String(sys.id || ''),
                name: String(sys.name || ''),
                type: String(sys.type || 'System'),
                database: String(dbConfigs?.[0]?.databaseName || 'MongoDB'), 
                status: 'Active' as const,
                environment: 'Dev' as const,
                lastUsed: sys.createdAt ? new Date(sys.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
                isFavorite: false,
                image: String(template?.thumbnailUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60"), 
                author: { 
                    name: String(template?.author?.name || 'PostPipe'),
                    profileUrl: template?.author?.profileUrl ? String(template.author.profileUrl) : undefined
                },
                tags: Array.isArray(template?.tags) ? template.tags.map((t: any) => String(t)) : [],
                cli: template?.cli ? String(template.cli) : undefined,
                aiPrompt: template?.aiPrompt ? String(template.aiPrompt) : undefined,
                npmPackageUrl: template?.npmPackageUrl ? String(template.npmPackageUrl) : undefined,
                databaseConfigurations: dbConfigs
            };
        });

        // Ensure purely serializable plain JSON object array for React Server Components
        return JSON.parse(JSON.stringify(mappedSystems));
    } catch (error) {
        console.error("Error fetching systems:", error);
        return [];
    }
}

export async function toggleFavoriteSystem(systemId: string) {
    // Not implemented in new schema yet
    return { success: true };
}
