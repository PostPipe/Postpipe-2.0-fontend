"use client";

import { buttonVariants, Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { 
  Check, 
  Star, 
  Shield, 
  Zap, 
  ArrowRight,
  AlertTriangle,
  Calendar,
  CreditCard,
  RefreshCcw,
  ShieldCheck,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect, Suspense } from "react";
import confetti from "canvas-confetti";
import NumberFlow from "@number-flow/react";
import { useAuth } from "@/hooks/use-auth";
import { useCountry } from "@/components/country-provider";
import { useRouter, useSearchParams } from "next/navigation";
import { createCheckoutSession, verifySubscription } from "@/lib/auth/actions";

interface PricingPlan {
  name: string;
  prices: {
    monthly: string;
    quarterly: string;
    yearly: string;
  };
  periods: {
    monthly: string;
    quarterly: string;
    yearly: string;
  };
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
  icon: React.ReactNode;
}

const postpipePlans: PricingPlan[] = [
  {
    name: "Starter",
    prices: {
      monthly: "0",
      quarterly: "0",
      yearly: "0",
    },
    periods: {
      monthly: "forever",
      quarterly: "forever",
      yearly: "forever",
    },
    features: [
      "2 Database Connectors",
      "1,000 Submissions / month",
      "Zero-Trust Signature Verification",
      "Community Support",
    ],
    description: "Perfect for testing and personal projects.",
    buttonText: "Get Started",
    href: "#",
    isPopular: false,
    icon: <Zap className="h-6 w-6 text-zinc-400" />
  },
  {
    name: "Builder",
    prices: {
      monthly: "399",
      quarterly: "699",
      yearly: "1899",
    },
    periods: {
      monthly: "month",
      quarterly: "3 months",
      yearly: "year",
    },
    features: [
      "10 Database Connectors",
      "50,000 Submissions / month",
      "Custom Webhooks & Triggers",
      "Priority Email Support",
    ],
    description: "For freelancers and production applications.",
    buttonText: "Upgrade to Builder",
    href: "checkout",
    isPopular: true,
    icon: <Star className="h-6 w-6 text-zinc-100" />
  },
  {
    name: "Enterprise",
    prices: {
      monthly: "Custom",
      quarterly: "Custom",
      yearly: "Custom",
    },
    periods: {
      monthly: "",
      quarterly: "",
      yearly: "",
    },
    features: [
      "Unlimited Connectors",
      "Unlimited Submissions",
      "Custom Database Adapters",
      "White-labeled Dashboard",
      "24/7 Slack Support & SLA",
    ],
    description: "For agencies and high-volume routing.",
    buttonText: "Contact Sales",
    href: "mailto:founder@postpipe.in",
    isPopular: false,
    icon: <Shield className="h-6 w-6 text-zinc-400" />
  },
];

interface PricingSectionProps {
  hideIfPurchased?: boolean;
  isHome?: boolean;
}

function PaymentSuccessHandler() {
  const searchParams = useSearchParams();
  const { refreshSession } = useAuth();
  const router = useRouter();
  const hasFiredSuccess = useRef(false);

  useEffect(() => {
    const handleSuccess = async () => {
      if (searchParams.get("success") === "true" && !hasFiredSuccess.current) {
        hasFiredSuccess.current = true;

        // If returning from Dodo Payments with a subscription_id, verify it immediately
        const subId = searchParams.get("subscription_id");
        if (subId) {
          await verifySubscription(subId);
        }

        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        if (refreshSession) {
          refreshSession();
        }

        // Clean up the URL
        router.replace("/pricing");
      }
    };

    handleSuccess();
  }, [searchParams, refreshSession, router]);

  return null;
}

export function PricingSection({ hideIfPurchased, isHome }: PricingSectionProps = {}) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "quarterly" | "yearly">("monthly");
  const { user } = useAuth();
  const { getRawPrice, currencySymbol } = useCountry();
  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState<string | null>(null);

  const handleCheckout = async (planName: string) => {
    if (!user) {
        router.push("/login?redirect=/pricing");
        return;
    }
    setIsCheckingOut(planName);
    try {
        const res = await createCheckoutSession(planName.toLowerCase(), billingCycle);
        if (res.success && res.url) {
            window.location.href = res.url;
        } else {
            alert(res.message || "Failed to initiate checkout");
            setIsCheckingOut(null);
        }
    } catch (error) {
        console.error(error);
        alert("An error occurred during checkout.");
        setIsCheckingOut(null);
    }
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = (cycle: "monthly" | "quarterly" | "yearly") => {
    setBillingCycle(cycle);
  };

  if (mounted && hideIfPurchased && user && user.plan !== 'starter') {
    return null;
  }

  return (
    <>
      <Suspense fallback={null}>
        <PaymentSuccessHandler />
      </Suspense>
      <section id="pricing" className="py-20 md:py-32 bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(161,161,170,0.08)_0%,transparent_70%)] pointer-events-none" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
            Simple, Transparent <span className="text-primary">Pricing</span>
          </h2>
          <p className="text-muted-foreground text-lg whitespace-pre-line max-w-2xl mx-auto">
            Bring your own infrastructure. Only pay for the tools and limits you need to scale your forms.
          </p>
        </div>

        <div className="flex justify-center items-center gap-2 mb-16 p-1 bg-zinc-900/50 backdrop-blur-md rounded-full border border-white/5 w-fit mx-auto">
          {(["monthly", "quarterly", "yearly"] as const).map((cycle) => (
            <button
              key={cycle}
              onClick={() => {
                handleToggle(cycle);
                if (cycle === "yearly") {
                  confetti({
                    particleCount: 30,
                    spread: 50,
                    origin: { y: 0.6 },
                    disableForReducedMotion: true,
                    colors: [
                      "hsl(var(--primary))",
                      "hsl(var(--accent))",
                      "hsl(var(--secondary))",
                    ],
                  });
                }
              }}
              className={cn(
                "relative px-6 py-2.5 text-sm font-medium rounded-full transition-colors duration-200 capitalize flex items-center",
                billingCycle === cycle
                  ? "text-white"
                  : "text-muted-foreground hover:text-white"
              )}
            >
              {billingCycle === cycle && (
                <motion.div
                  layoutId="billing-pill"
                  className="absolute inset-0 bg-primary border border-primary rounded-full"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {cycle}
                {cycle === "yearly" && (
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider ml-1",
                    billingCycle === cycle ? "bg-white/20 text-white" : "bg-primary/20 text-primary"
                  )}>Save Big</span>
                )}
              </span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 sm:2 gap-4 max-w-6xl mx-auto">
          {postpipePlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.4,
                ease: [0.25, 0.1, 0.25, 1],
                delay: index * 0.08,
              }}
              className={cn(
                "rounded-[2rem] border p-8 xl:p-10 bg-card/90 backdrop-blur-md text-center flex flex-col justify-between relative transition-colors duration-200",
                plan.isPopular 
                  ? "border-zinc-500/50 shadow-2xl shadow-primary/5 ring-1 ring-zinc-500/20 md:-translate-y-4 z-10" 
                  : "border-border/60 hover:bg-card/70 z-0",
                !plan.isPopular && "mt-0 md:mt-4"
              )}
            >
              {plan.isPopular && (
                <div className="absolute top-0 right-8 px-3 py-1 bg-zinc-100 text-zinc-900 text-[10px] font-bold uppercase tracking-widest rounded-b-lg">
                  Founder's Deal
                </div>
              )}
              
              <div className="flex-1 flex flex-col">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-6 mx-auto", plan.isPopular ? "bg-zinc-800 mt-2" : "bg-zinc-800/50")}>
                    {plan.icon}
                </div>
                
                <h3 className="text-2xl font-bold mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                    {plan.description}
                </p>
                
                <div className="mt-2 flex items-baseline justify-center gap-x-2">
                  {plan.prices[billingCycle] === "Custom" ? (
                    <span className="text-4xl lg:text-5xl font-black tracking-tight text-foreground">
                        Custom
                    </span>
                  ) : (
                    <div className="flex items-end gap-2 flex-wrap justify-center">
                        {plan.prices[billingCycle] !== "0" && (
                             <span className="text-lg text-muted-foreground line-through decoration-muted-foreground/50 leading-none mb-1" suppressHydrationWarning>
                                 {currencySymbol}{Math.round(getRawPrice(plan.prices[billingCycle]) * 1.48)}
                             </span>
                        )}
                        <span className="text-4xl lg:text-5xl font-black tracking-tight text-foreground flex items-center leading-none" suppressHydrationWarning>
                            <span className="text-2xl mr-1" suppressHydrationWarning>{currencySymbol}</span>
                            <NumberFlow
                                value={getRawPrice(plan.prices[billingCycle])}
                                format={{
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 0,
                                }}
                                transformTiming={{
                                  duration: 280,
                                  easing: "cubic-bezier(0.25, 0.1, 0.25, 1)",
                                }}
                                className="font-variant-numeric: tabular-nums leading-none"
                            />
                        </span>
                        {(plan.periods[billingCycle] !== "forever") && (
                            <span className="text-sm font-semibold leading-none mb-1 ml-1 text-muted-foreground">
                            / {plan.periods[billingCycle]}
                            </span>
                        )}
                    </div>
                  )}
                </div>


                {plan.prices[billingCycle] === "0" && (
                     <div className="mt-6 flex justify-center h-8">
                     </div>
                )}

                <ul className="mt-8 gap-4 flex flex-col flex-1 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-foreground/80">
                      <Check className={cn("h-4 w-4 shrink-0 mt-0.5", plan.isPopular ? "text-zinc-100" : "text-zinc-500")} />
                      <span className="text-left">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.href === "checkout" ? (
                    <Button 
                        variant={plan.isPopular ? "secondary" : "outline"} 
                        className={cn(
                            "w-full h-12 font-bold gap-2 text-base group/btn mt-auto",
                            plan.isPopular ? "bg-zinc-100 text-zinc-900 hover:bg-zinc-200" : "border-zinc-700 hover:bg-zinc-800"
                        )}
                        onClick={() => handleCheckout(plan.name)}
                        disabled={isCheckingOut === plan.name}
                    >
                        {isCheckingOut === plan.name ? "Processing..." : plan.buttonText} 
                        {plan.isPopular && isCheckingOut !== plan.name && <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />}
                    </Button>
                ) : (
                    <Button 
                        asChild
                        variant={plan.isPopular ? "secondary" : "outline"} 
                        className={cn(
                            "w-full h-12 font-bold gap-2 text-base group/btn mt-auto",
                            plan.isPopular ? "bg-zinc-100 text-zinc-900 hover:bg-zinc-200" : "border-zinc-700 hover:bg-zinc-800"
                        )}
                    >
                        <Link
                            href={(!mounted || !user) ? "/login?redirect=/pricing" : plan.href}
                            target="_self"
                        >
                            {plan.buttonText} 
                            {plan.isPopular && <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />}
                        </Link>
                    </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* ─── Billing Terms & Conditions / Service Continuity Policy ─── */}
        {isHome ? (
          <div className="mt-16 flex justify-center">
            <Link 
              href="/pricing#terms" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
            >
              Read Subscription & Billing Terms Conditions →
            </Link>
          </div>
        ) : (
          <div id="terms" className="mt-16 max-w-6xl mx-auto space-y-6">
            {/* Prominent Warning Callout */}
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.04] p-6 sm:p-8 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[radial-gradient(circle,rgba(245,158,11,0.12)_0%,transparent_70%)] pointer-events-none" />
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 mt-0.5">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-base sm:text-lg font-bold text-foreground">
                      Subscription & Billing Terms Notice
                    </h4>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      Important Clause
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    All recurring subscription payments are debited automatically on the <strong className="text-foreground font-semibold">1st of each calendar month</strong>. In the event that an automated debit fails or payment cannot be processed, your paid subscription tier will be <strong className="text-foreground font-semibold">revoked immediately</strong> and your account will automatically revert to the <strong className="text-foreground font-semibold">Starter Plan</strong>.
                  </p>
                  <div className="flex items-start sm:items-center gap-2 pt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 sm:mt-0" />
                    <span>
                      <strong>Uninterrupted Service Continuity:</strong> Downgrading never terminates your active pipeline. You can continue utilizing Postpipe with all features included under the Starter plan (up to 1,000 monthly submissions and 2 database connectors) without loss of data.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Clauses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-border/70 bg-card/60 p-5 backdrop-blur-sm space-y-2.5">
                <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>1st of the Month Billing</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Billing periods renew on the 1st of every calendar month. Digital VAT and GST-compliant invoices and payment receipts are issued directly to your account email upon every successful transaction.
                </p>
              </div>

              <div className="rounded-xl border border-border/70 bg-card/60 p-5 backdrop-blur-sm space-y-2.5">
                <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                  <RefreshCcw className="h-4 w-4 text-primary" />
                  <span>Debit Failure Protocol</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  If bank debiting or card collection fails, tier throughput adjusts immediately to Starter limits. Retrying payment or updating billing credentials from your profile restores Builder entitlements instantly.
                </p>
              </div>

              <div className="rounded-xl border border-border/70 bg-card/60 p-5 backdrop-blur-sm space-y-2.5">
                <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                  <CreditCard className="h-4 w-4 text-primary" />
                  <span>Cancellation & Retention</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You retain complete control to cancel anytime via your Account Profile. Paid benefits remain active through the final day of your paid cycle. All schemas and form webhook tokens remain safe.
                </p>
              </div>
            </div>

            {/* Support & Invoicing Inquiries */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 rounded-xl border border-border/60 bg-muted/20 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span>Need custom enterprise SLAs or enterprise invoicing?</span>
              </div>
              <a 
                href="mailto:support@postpipe.in" 
                className="font-medium text-foreground hover:text-primary transition-colors underline underline-offset-4"
              >
                Contact Support (support@postpipe.in) →
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
    </>
  );
}
