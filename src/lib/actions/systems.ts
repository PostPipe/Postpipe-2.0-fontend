"use server"

import dbConnect from "@/lib/auth/mongodb";
import System from "@/lib/models/System";
import Template from "@/lib/models/Template";
import { getSession } from "@/lib/auth/actions";
import { revalidatePath } from "next/cache";

export async function createSystem(templateId: string) {
    await dbConnect();
    const session = await getSession();
    
    // For demo purposes, if no session, we can't save to a user. 
    // However, we'll try to use a "guest" ID if no session, or just return error.
    // Given the prompt context, we probably should support this. 
    // I'll return success: false if not logged in.
    if (!session?.userId) {
        return { success: false, message: "Please log in to add systems." };
    }

    try {
        const template = await Template.findById(templateId);
        if (!template) {
            return { success: false, message: "Template not found." };
        }

        // Check if already exists
        let system = await System.findOne({ userId: session.userId, template: templateId });
        
        if (system) {
            system.lastUsed = new Date();
            await system.save();
        } else {
            system = new System({
                userId: session.userId,
                template: templateId,
                name: template.name,
                type: template.category || 'Custom',
                status: 'Active',
                environment: 'Dev',
                lastUsed: new Date(),
                isFavorite: false
            });
            await system.save();
        }

        revalidatePath('/dashboard/systems');
        return { success: true, message: "System added to dashboard." };
    } catch (error) {
        console.error("Error creating system:", error);
        return { success: false, message: "Failed to create system." };
    }
}

export async function getSystems() {
    await dbConnect();
    const session = await getSession();
    if (!session?.userId) return [];

    try {
        const systems = await System.find({ userId: session.userId })
            .populate('template')
            .sort({ lastUsed: -1 })
            .lean();
        
        // Transform for client
        return JSON.parse(JSON.stringify(systems)).map((sys: any) => ({
            id: sys._id,
            name: sys.name,
            type: sys.type,
            database: sys.template?.tags?.includes('Postgres') ? 'Postgres' : 'MongoDB', 
            status: sys.status,
            environment: sys.environment,
            lastUsed: new Date(sys.lastUsed).toLocaleDateString(),
            isFavorite: sys.isFavorite,
            image: sys.template?.thumbnailUrl || sys.template?.demoGifUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60",
            author: sys.template?.author || { name: 'PostPipe' },
            tags: sys.template?.tags || [],
            cli: sys.template?.cli,
            aiPrompt: sys.template?.aiPrompt,
            npmPackageUrl: sys.template?.npmPackageUrl
        }));
    } catch (error) {
        console.error("Error fetching systems:", error);
        return [];
    }
}

export async function toggleFavoriteSystem(systemId: string) {
    await dbConnect();
    const session = await getSession();
    if (!session?.userId) return { success: false };

    try {
        const system = await System.findOne({ _id: systemId, userId: session.userId });
        if (system) {
            system.isFavorite = !system.isFavorite;
            await system.save();
            revalidatePath('/dashboard/systems');
            return { success: true };
        }
        return { success: false, message: "System not found" };
    } catch (e) {
        return { success: false };
    }
}
