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

export const metadata: Metadata = {
  title: 'Home',
};

export default function Home() {
  return (
    <>
      <section
        id="hero"
        className="relative"
      >
        <HeroParticles />
      </section>

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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <Card
                key={feature.title}
                className={cn(
                  "relative overflow-hidden border-border/50 bg-gradient-to-br from-background via-background/80 to-muted/20 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_8px_30px_-6px_hsl(var(--primary)/0.2)] group",
                  // Make the last two centered if we have 5 items? Or just let them flow. 
                  // Let's use col-span logic to make it a bento. 
                  // 3 items top row, 2 items bottom row spanning larger?
                  i >= 3 ? "lg:col-span-1.5" : ""
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <CardHeader className="relative flex flex-col gap-2 z-10">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-2 group-hover:rotate-6 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <CardTitle className="font-headline text-xl group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}