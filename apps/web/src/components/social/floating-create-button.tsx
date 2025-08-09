"use client";

import { Button } from "@/components/ui/button";
import { PenSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";

interface FloatingCreateButtonProps {
  className?: string;
}

export function FloatingCreateButton({ className }: FloatingCreateButtonProps) {
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  return (
    <Button
      asChild
      size="lg"
      className={cn(
        "fixed bottom-6 right-6 z-50 rounded-full h-14 w-14 p-0 shadow-lg hover:shadow-xl transition-all duration-200",
        "md:hidden", // Only show on mobile
        "bg-primary hover:bg-primary/90 text-primary-foreground",
        "hover:scale-110 active:scale-95",
        className
      )}
      aria-label="Create new post"
    >
      <Link href={`/${locale}/posts/create`}>
        <PenSquare className="h-6 w-6" />
      </Link>
    </Button>
  );
}