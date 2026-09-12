import { ExplorePageContent } from '@/components/explore/ExplorePageContent';
import {
    getMasterTemplate,
    getCatalogItemByIndex,
    getExploreFilters,
} from '@/lib/actions/explore';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Explore',
};

export const dynamic = 'force-dynamic';

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page({ searchParams }: Props) {
    const params = await searchParams;
    const q = typeof params.q === 'string' ? params.q : undefined;
    const category =
        typeof params.category === 'string' ? params.category : undefined;
    const tag = typeof params.tag === 'string' ? params.tag : undefined;

    const [masterTemplate, firstCatalogResult, filters] = await Promise.all([
        getMasterTemplate(),
        getCatalogItemByIndex({
            index: 0,
            category,
            tag,
            searchQuery: q,
        }),
        getExploreFilters(),
    ]);

    return (
        <ExplorePageContent
            masterTemplate={masterTemplate}
            initialFirstCard={firstCatalogResult.item}
            initialCatalogTotalCount={firstCatalogResult.totalCount}
            availableCategories={filters?.categories || []}
            searchQuery={q}
            selectedCategory={category}
            selectedTag={tag}
        />
    );
}


