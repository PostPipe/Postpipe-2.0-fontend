"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Database, 
  Code2, 
  ShieldCheck, 
  Check, 
  Copy,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

type FrameworkTab = "html" | "react" | "webflow";

export function HowItWorks() {
  const [activeTab, setActiveTab] = useState<FrameworkTab>("html");
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const handleCopy = (text: string, stepIndex: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepIndex);
    setTimeout(() => {
      setCopiedStep(null);
    }, 2000);
  };

  const step1Code = `// postpipe.config.ts
export default defineConfig({
  connector: "postgresql", // or "mongodb"
  connectionString: process.env.DATABASE_URL,
  tables: ["contacts", "leads"],
  zeroTrust: true,
  rateLimit: "100/min"
});`;

  const step2CodeMap: Record<FrameworkTab, string> = {
    html: `<!-- Drop into any HTML page -->
<form data-postpipe="contacts" method="POST">
  <input type="email" name="email" required />
  <button type="submit">Submit</button>
</form>
<script src="https://postpipe.in/pp.js" async></script>`,
    react: `// React & Next.js Hook
import { usePostPipe } from "@postpipe/react";

export function ContactForm() {
  const { submit, isSubmitting } = usePostPipe("contacts");
  return (
    <form onSubmit={submit}>
      <input type="email" name="email" required />
      <button disabled={isSubmitting}>Submit</button>
    </form>
  );
}`,
    webflow: `<!-- Webflow / Framer / WordPress -->
Action URL: https://api.postpipe.in/v1/submit/contacts
Method: POST
Signature Check: Automatic
Redirect: /thank-you`,
  };

  const step3Code = `// Cryptographically signed & verified
{
  "status": "verified_200",
  "signature": "hmac_sha256_9f8a2c...",
  "destination": "postgresql://contacts",
  "data": {
    "email": "alex@acme.corp",
    "verified": true,
    "receivedAt": "2026-09-05T11:04:21Z"
  }
}`;

  return (
    <section id="how-it-works" className="py-24 px-4 bg-background border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mb-4">
            How PostPipe Works
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Connect your database and start capturing form submissions in minutes. 
            No complex backend setups or DevOps required.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* STEP 1 */}
          <div className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Step 1</div>
                <h3 className="font-semibold text-foreground">Connect Database</h3>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-6 flex-grow">
              Provide your database credentials. We securely pool connections and provision isolated endpoints.
            </p>

            <div className="rounded-lg border border-border bg-zinc-950 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
                <span className="text-xs font-mono text-muted-foreground">postpipe.config.ts</span>
                <button
                  onClick={() => handleCopy(step1Code, 1)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title="Copy snippet"
                >
                  {copiedStep === 1 ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-zinc-300 overflow-x-auto">
                <code>{step1Code}</code>
              </pre>
            </div>
          </div>

          {/* STEP 2 */}
          <div className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Code2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Step 2</div>
                <h3 className="font-semibold text-foreground">Embed Snippet</h3>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-6">
              Drop our snippet into any framework or platform. Zero client dependencies required.
            </p>

            <div className="flex items-center gap-1 mb-4 p-1 rounded-md bg-muted">
              {(["html", "react", "webflow"] as FrameworkTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex-1 text-xs py-1.5 px-2 rounded-sm font-medium transition-all capitalize",
                    activeTab === tab 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab === "react" ? "React" : tab}
                </button>
              ))}
            </div>

            <div className="rounded-lg border border-border bg-zinc-950 overflow-hidden mt-auto">
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
                <span className="text-xs font-mono text-muted-foreground">
                  {activeTab === "html" ? "index.html" : activeTab === "react" ? "ContactForm.tsx" : "webflow.config"}
                </span>
                <button
                  onClick={() => handleCopy(step2CodeMap[activeTab], 2)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title="Copy snippet"
                >
                  {copiedStep === 2 ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-zinc-300 overflow-x-auto min-h-[160px]">
                <code>{step2CodeMap[activeTab]}</code>
              </pre>
            </div>
          </div>

          {/* STEP 3 */}
          <div className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Step 3</div>
                <h3 className="font-semibold text-foreground">Receive Verified Data</h3>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-6 flex-grow">
              Submissions are cryptographically signed before direct insertion into your database.
            </p>

            <div className="rounded-lg border border-border bg-zinc-950 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
                <span className="text-xs font-mono text-muted-foreground">payload.json</span>
                <button
                  onClick={() => handleCopy(step3Code, 3)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title="Copy snippet"
                >
                  {copiedStep === 3 ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-zinc-300 overflow-x-auto">
                <code>{step3Code}</code>
              </pre>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

