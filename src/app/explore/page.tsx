import { ExplorePageContent } from "@/components/explore/ExplorePageContent"
import { getTemplates } from "@/lib/actions/explore"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: 'Explore',
}

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Page({ searchParams }: Props) {
    const params = await searchParams;
    console.log("Explore Page Search Params:", params);
    const q = typeof params.q === 'string' ? params.q : undefined;
    const category = typeof params.category === 'string' ? params.category : undefined;
    const tag = typeof params.tag === 'string' ? params.tag : undefined;
    const templates = await getTemplates(q, category, tag);
    return <ExplorePageContent templates={templates} />
}
