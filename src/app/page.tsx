import { Suspense } from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Code,
  Combine,
  Rocket,
  Palette,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { HeroParticles } from '@/components/layout/hero-particles';
import { cn } from '@/lib/utils';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { TerminalMakers } from '@/components/ui/terminal-makers';
import { PathSelection } from '@/components/layout/path-selection';
import { HowItWorks } from '@/components/layout/how-it-works';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PricingSection } from '@/components/layout/pricing-section';
import { Marquee } from '@/components/ui/marquee';
import { LanyardMakers } from '@/components/ui/lanyard-makers';

const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-image');

const features = [
  {
    icon: <Palette className="size-8 text-primary" />,
    title: 'Visual Form Builder',
    description: 'Create and customize static forms with ease. No coding required until you want to.',
  },
  {
    icon: <Combine className="size-8 text-primary" />,
    title: 'Workflow Templates',
    description: 'Jumpstart your projects with a marketplace of dynamic, ready-to-use workflow templates.',
  },
  {
    icon: <Rocket className="size-8 text-primary" />,
    title: 'Agentic AI',
    description: 'Use pre-formatted AI prompts to generate frontends and accelerate your development.',
  },
  {
    icon: <Code className="size-8 text-primary" />,
    title: 'Embed Anywhere',
    description: 'Generate simple HTML/JS snippets to embed your forms on any website or platform.',
  },
  {
    icon: <ShieldCheck className="size-8 text-primary" />,
    title: 'Centralized Auth',
    description: 'Secure authentication across all your PostPipe services for a seamless user experience.',
  },
];

const faqs = [
  {
    question: "How do I connect my database to a static form?",
    answer: "Using the PostPipe Static Connector, you simply provide your database credentials (like MongoDB or PostgreSQL). We generate a secure, ready-to-use API endpoint that you can immediately plug into your frontend forms."
  },
  {
    question: "How secure are the form submissions?",
    answer: "We use a zero-trust architecture. Every form submission is verified using cryptographic signatures (HMAC) to guarantee that the request originated from your exact authorized domain, preventing spam and data injection."
  },
  {
    question: "Can I embed these forms anywhere?",
    answer: "Absolutely. Once your form is configured, you receive a simple HTML/JS snippet. You can embed this into any platform—WordPress, Webflow, plain HTML sites, or modern frameworks like React and Next.js."
  },
  {
    question: "Which databases do you currently support?",
    answer: "The Static Connector natively supports PostgreSQL (including Supabase, Neon, AWS RDS) and MongoDB (like MongoDB Atlas). We handle the connection pooling and data validation automatically."
  }
];

export const metadata: Metadata = {
  title: 'PostPipe | The Ultimate Static Form & Architecture Backend',
  description: 'Connect any database to your frontend with our secure, zero-trust static form submission architecture in minutes.',
};

export default function Home() {
  return (
    <>
      <section
        id="hero"
        className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-center px-4 md:px-6 lg:px-8"
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'PostPipe',
              url: 'https://www.postpipe.in',
              description: 'The ultimate zero-trust static form submission and backend architecture.',
              applicationCategory: 'DeveloperApplication',
              genre: 'Software Development',
              browserRequirements: 'Requires JavaScript',
              softwareVersion: '2.0',
              author: {
                '@type': 'Organization',
                name: 'PostPipe',
              },
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.9',
                ratingCount: '250',
              },
            }),
          }}
        />
        <HeroParticles />
      </section>

      <PathSelection />

      <HowItWorks />

      <section id="features" className="bg-background-muted py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="font-headline text-4xl font-bold">
              Everything You Need to Build Faster
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-lg text-muted-foreground">
              PostPipe Pro provides the tools to streamline your development
              process from end to end.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-4 lg:grid-cols-12 xl:max-h-[34rem] xl:grid-rows-2">
            <GridItem
              area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
              icon={<Palette className="h-4 w-4 text-black dark:text-neutral-400" />}
              title="Visual Form Builder"
              description="Create and customize static forms with ease. No coding required until you want to."
            />
            <GridItem
              area="md:[grid-area:1/7/2/13] xl:[grid-area:1/5/3/8]"
              icon={<Combine className="h-4 w-4 text-black dark:text-neutral-400" />}
              title="Workflow Templates"
              description="Jumpstart your projects with a marketplace of dynamic, ready-to-use workflow templates."
            />
            <GridItem
              area="md:[grid-area:2/1/3/7] xl:[grid-area:1/8/2/13]"
              icon={<Rocket className="h-4 w-4 text-black dark:text-neutral-400" />}
              title="Agentic AI"
              description="Use pre-formatted AI prompts to generate frontends and accelerate your development."
            />
            <GridItem
              area="md:[grid-area:2/7/3/13] xl:[grid-area:2/1/3/5]"
              icon={<Code className="h-4 w-4 text-black dark:text-neutral-400" />}
              title="Embed Anywhere"
              description="Generate simple HTML/JS snippets to embed your forms on any website or platform."
            />
            <GridItem
              area="md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]"
              icon={<ShieldCheck className="h-4 w-4 text-black dark:text-neutral-400" />}
              title="Centralized Auth"
              description="Secure authentication across all your PostPipe services for a seamless user experience."
            />
          </div>
        </div>
      </section>
      <div className="w-full bg-background relative overflow-hidden">
        <Marquee text="Scale Infinite • Zero Infrastructure • PostPipe • " repeat={4} duration={40} fontSize="xl" />
      </div>

      <Suspense fallback={null}>
        <PricingSection hideIfPurchased={true} isHome={true} />
      </Suspense>
      <section id="faq" className="bg-background py-20 md:py-32">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="font-headline text-3xl md:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
              Everything you need to know about PostPipe and how it works.
            </p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-border/50">
                <AccordionTrigger className="text-left text-lg md:text-xl font-medium hover:no-underline hover:text-primary transition-colors py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <LanyardMakers />
    </>
  );
}

interface GridItemProps {
  area: string;
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
}

const GridItem = ({ area, icon, title, description }: GridItemProps) => {
  return (
    <div className={cn("min-h-[16rem] md:min-h-[14rem] list-none w-full", area)}>
      <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-border p-2 md:rounded-[1.5rem] md:p-3">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          borderWidth={3}
        />
        <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-[0.75px] bg-background p-6 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)] md:p-6">
          <div className="relative flex flex-1 flex-col justify-between gap-3">
            <div className="w-fit rounded-lg border-[0.75px] border-border bg-muted p-2">
              {icon}
            </div>
            <div className="space-y-3">
              <h3 className="pt-0.5 text-xl leading-[1.375rem] font-semibold font-sans tracking-[-0.04em] md:text-2xl md:leading-[1.875rem] text-balance text-foreground">
                {title}
              </h3>
              <h2 className="[&_b]:md:font-semibold [&_strong]:md:font-semibold font-sans text-sm leading-[1.125rem] md:text-base md:leading-[1.375rem] text-muted-foreground">
                {description}
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
