"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ShinyButton } from "@/components/ui/shiny-button";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";

interface AuthButtonProps {
  onClick?: () => void;
  className?: string;
}

export function AuthButton({ onClick, className }: AuthButtonProps = {}) {
  const [mounted, setMounted] = React.useState(false);
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) {
    return <Skeleton className="h-10 w-24" />;
  }

  return isAuthenticated ? (
    <ShinyButton className={className} onClick={() => {
      onClick?.();
      router.push("/dashboard");
    }}>
      Dashboard
    </ShinyButton>
  ) : (
    <Button className={className} asChild variant="outline" onClick={onClick}>
      <Link href="/login">Login</Link>
    </Button>
  );
}
