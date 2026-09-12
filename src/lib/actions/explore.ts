'use server';

import dbConnect from '@/lib/auth/mongodb';
import Template from '@/lib/models/Template';

export interface PaginatedTemplatesResult {
    templates: any[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
}

export async function getTemplatesPaginated(
    options: {
        page?: number;
        limit?: number;
        category?: string;
        tag?: string;
        searchQuery?: string;
        excludeMaster?: boolean;
    } = {},
): Promise<PaginatedTemplatesResult> {
    await dbConnect();
    try {
        const {
            page = 1,
            limit = 8,
            category,
            tag,
            searchQuery,
            excludeMaster = false,
        } = options;

        const query: any = { isPublished: true };

        if (category) {
            query.category = category;
        }

        if (tag) {
            query.tags = tag;
        }

        if (excludeMaster) {
            query.tags = {
                ...(query.tags ? { $all: [query.tags] } : {}),
                $nin: ['master', 'Master', 'MASTER', 'Master Template'],
            };
        }

        if (searchQuery) {
            const regex = new RegExp(searchQuery, 'i');
            query.$or = [{ name: regex }, { category: regex }, { tags: regex }];
        }

        const currentPage = Math.max(1, page);
        const skip = (currentPage - 1) * limit;

        const [totalCount, templates] = await Promise.all([
            Template.countDocuments(query),
            Template.find(query)
                .select(
                    'name slug category tags author thumbnailUrl demoGifUrl createdAt',
                )
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        return {
            templates: JSON.parse(JSON.stringify(templates)),
            totalCount,
            totalPages,
            currentPage,
        };
    } catch (error) {
        console.error('Error fetching paginated templates:', error);
        return {
            templates: [],
            totalCount: 0,
            totalPages: 0,
            currentPage: 1,
        };
    }
}

export async function getMasterTemplate() {
    await dbConnect();
    try {
        const template = await Template.findOne({
            isPublished: true,
            tags: { $in: ['master', 'Master', 'MASTER', 'Master Template'] },
        })
            .select(
                'name slug category tags author thumbnailUrl demoGifUrl createdAt cli aiPrompt npmPackageUrl databaseConfigurations',
            )
            .sort({ createdAt: -1 })
            .lean();

        if (!template) {
            // Fallback to any latest template if no master template found
            const fallback = await Template.findOne({ isPublished: true })
                .select(
                    'name slug category tags author thumbnailUrl demoGifUrl createdAt cli aiPrompt npmPackageUrl databaseConfigurations',
                )
                .sort({ createdAt: -1 })
                .lean();
            return fallback ? JSON.parse(JSON.stringify(fallback)) : null;
        }

        return JSON.parse(JSON.stringify(template));
    } catch (error) {
        console.error('Error fetching master template:', error);
        return null;
    }
}

function buildCatalogQuery(category?: string, tag?: string, searchQuery?: string) {
    const query: any = {
        isPublished: true,
        tags: { $nin: ['master', 'Master', 'MASTER', 'Master Template'] },
    };

    const andConditions: any[] = [];

    if (category && category.trim()) {
        const catRegex = new RegExp(category.trim(), 'i');
        andConditions.push({
            $or: [
                { category: catRegex },
                { tags: catRegex },
                { name: catRegex },
            ],
        });
    }

    if (tag && tag.trim()) {
        const tagRegex = new RegExp(tag.trim(), 'i');
        andConditions.push({
            $or: [{ tags: tagRegex }, { category: tagRegex }],
        });
    }

    if (searchQuery && searchQuery.trim()) {
        const searchRegex = new RegExp(searchQuery.trim(), 'i');
        andConditions.push({
            $or: [
                { name: searchRegex },
                { category: searchRegex },
                { tags: searchRegex },
            ],
        });
    }

    if (andConditions.length > 0) {
        query.$and = andConditions;
    }

    return query;
}

export async function getCatalogCount(options: {
    category?: string;
    tag?: string;
    searchQuery?: string;
} = {}): Promise<number> {
    await dbConnect();
    try {
        const { category, tag, searchQuery } = options;
        const query = buildCatalogQuery(category, tag, searchQuery);
        return await Template.countDocuments(query);
    } catch (error) {
        console.error('Error fetching catalog count:', error);
        return 0;
    }
}

export async function getCatalogItemByIndex(options: {
    index: number;
    category?: string;
    tag?: string;
    searchQuery?: string;
}): Promise<{ item: any | null; totalCount: number }> {
    await dbConnect();
    try {
        const { index = 0, category, tag, searchQuery } = options;
        const query = buildCatalogQuery(category, tag, searchQuery);

        const [totalCount, items] = await Promise.all([
            Template.countDocuments(query),
            Template.find(query)
                .select(
                    'name slug category tags author thumbnailUrl demoGifUrl createdAt cli aiPrompt npmPackageUrl databaseConfigurations',
                )
                .sort({ createdAt: -1 })
                .skip(Math.max(0, index))
                .limit(1)
                .lean(),
        ]);

        const item = items.length > 0 ? JSON.parse(JSON.stringify(items[0])) : null;
        return { item, totalCount };
    } catch (error) {
        console.error('Error fetching catalog item by index:', error);
        return { item: null, totalCount: 0 };
    }
}


export async function getMasterTemplates() {
    await dbConnect();
    try {
        const templates = await Template.find({
            isPublished: true,
            tags: { $in: ['master', 'Master', 'MASTER', 'Master Template'] },
        })
            .select(
                'name slug category tags author thumbnailUrl demoGifUrl createdAt cli aiPrompt npmPackageUrl databaseConfigurations',
            )
            .sort({ createdAt: -1 })
            .lean();
        return JSON.parse(JSON.stringify(templates));
    } catch (error) {
        console.error('Error fetching master templates:', error);
        return [];
    }
}

export async function getTemplateDetails(id: string) {
    await dbConnect();
    try {
        const template = await Template.findById(id).lean();
        if (!template) return null;
        return JSON.parse(JSON.stringify(template));
    } catch (error) {
        console.error('Error fetching template details:', error);
        return null;
    }
}

export async function getTemplates(
    searchQuery?: string,
    category?: string,
    tag?: string,
) {
    await dbConnect();
    try {
        const query: any = { isPublished: true };

        if (category) {
            query.category = category;
        }

        if (tag) {
            query.tags = tag;
        }

        if (searchQuery) {
            const regex = new RegExp(searchQuery, 'i');
            query.$or = [{ name: regex }, { category: regex }, { tags: regex }];
        }

        const templates = await Template.find(query)
            .sort({ createdAt: -1 })
            .lean();
        return JSON.parse(JSON.stringify(templates));
    } catch (error) {
        console.error('Error fetching templates:', error);
        return [];
    }
}

export async function getExploreFilters() {
    await dbConnect();
    try {
        const templates = await Template.find({ isPublished: true })
            .select('category tags')
            .lean();

        const categories = new Set<string>();
        const tags = new Set<string>();

        templates.forEach((t: any) => {
            if (t.category) categories.add(t.category);
            if (t.tags && Array.isArray(t.tags)) {
                t.tags.forEach((tag: string) => tags.add(tag));
            }
        });

        return {
            categories: Array.from(categories),
            tags: Array.from(tags),
        };
    } catch (error) {
        console.error('Error fetching filters:', error);
        return { categories: [], tags: [] };
    }
}
