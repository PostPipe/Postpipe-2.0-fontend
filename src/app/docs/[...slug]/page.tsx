import React from "react";
import { getDocBySlug } from "@/lib/docs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ChevronRight, Check } from "lucide-react";
import Link from "next/link";
import { Mermaid } from "@/components/ui/mermaid";

interface DocPageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: DocPageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDocBySlug(slug);
  if (!doc) return { title: "PostPipe Documentation" };
  return {
    title: `${doc.frontmatter.title || "Docs"} - PostPipe`,
    description: doc.frontmatter.description || "PostPipe Documentation",
  };
}

// Helper to convert to title case
function toTitleCase(str: string) {
  return str.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
}

export default async function DocPage({ params }: DocPageProps) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);

  if (!doc) notFound();

  const isIntro = slug.length === 1 && slug[0] === "introduction";

  return (
    <div className="py-10 max-w-4xl">
      {/* Breadcrumb */}
      {!isIntro && (
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
          <Link href="/docs/introduction" className="hover:text-foreground transition-colors">
            Docs
          </Link>
          <ChevronRight size={14} />
          <span className="text-foreground font-medium">{toTitleCase(doc.frontmatter.title || "")}</span>
        </nav>
      )}

      {/* Page Header */}
      <header className="mb-10 pb-8 border-b border-border/50">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-3">
          {toTitleCase(doc.frontmatter.title || "Documentation")}
        </h1>
        {doc.frontmatter.description && (
          <p className="text-lg text-muted-foreground leading-relaxed mt-2 max-w-3xl">
            {doc.frontmatter.description}
          </p>
        )}
        {isIntro && (
          <div className="flex gap-4 mt-6">
            <Link
              href="/docs/guides/static-connector"
              className="inline-flex items-center justify-center rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 shadow-sm transition-colors"
            >
              Static Setup
            </Link>
            <Link
              href="/docs/guides/cli-components"
              className="inline-flex items-center justify-center rounded-lg text-sm font-semibold border border-border bg-card text-foreground hover:bg-muted h-10 px-6 shadow-sm transition-colors"
            >
              Forge CLI
            </Link>
          </div>
        )}
      </header>

      {/* Markdown Body */}
      <div className="prose prose-base max-w-none dark:prose-invert
        prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground prose-headings:scroll-mt-24
        prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-border/50
        prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
        prose-p:text-muted-foreground prose-p:leading-7 prose-p:my-5
        prose-a:text-primary prose-a:no-underline prose-a:font-medium hover:prose-a:underline
        prose-strong:text-foreground prose-strong:font-semibold
        prose-em:text-muted-foreground
        prose-ul:my-5 prose-li:my-1.5 prose-li:text-muted-foreground
        prose-ol:my-5
        prose-code:text-[0.85em] prose-code:font-mono prose-code:bg-muted/50 prose-code:text-foreground prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-[#09090b] prose-pre:border prose-pre:border-border/40 prose-pre:rounded-xl prose-pre:p-5 prose-pre:my-6 prose-pre:overflow-x-auto prose-pre:text-[0.85em]
        prose-blockquote:border-l-4 prose-blockquote:border-primary/50 prose-blockquote:pl-5 prose-blockquote:text-muted-foreground prose-blockquote:not-italic prose-blockquote:my-6
        prose-table:text-sm prose-th:text-foreground prose-th:font-semibold prose-th:border-b prose-th:border-border prose-th:pb-3 prose-td:text-muted-foreground prose-td:border-b prose-td:border-border/50 prose-td:py-3
        [&_hr]:border-border/50 [&_hr]:my-8
      ">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => <h1>{children}</h1>,
            h2: ({ children }) => <h2>{children}</h2>,
            h3: ({ children }) => <h3>{children}</h3>,
            h4: ({ children }) => <h4>{children}</h4>,
            // Clean task-list item rendering
            li: ({ children, className, ...props }: any) => {
              const isTask = className?.includes("task-list-item");
              if (isTask) {
                return (
                  <li className="!list-none flex items-start gap-3 !pl-0 !ml-0 my-2 [&>p]:m-0 [&>p]:leading-relaxed" {...props}>
                    {children}
                  </li>
                );
              }
              return <li className={className} {...props}>{children}</li>;
            },
            // Replace raw checkbox inputs with styled spans
            input: ({ type, checked }: any) => {
              if (type !== "checkbox") return null;
              return (
                <span
                  className={`inline-flex items-center justify-center w-[18px] h-[18px] rounded-[4px] border shrink-0 mt-[3px] ${
                    checked
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-input bg-transparent"
                  }`}
                >
                  {checked && <Check size={12} strokeWidth={3} />}
                </span>
              );
            },
            // Mermaid diagrams
            code({ node, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || "");
              if (match?.[1] === "mermaid") {
                return <Mermaid chart={String(children).replace(/\n$/, "")} />;
              }
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {doc.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
