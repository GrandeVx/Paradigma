"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PenSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useParams, useSearchParams } from "next/navigation";
import { CreatePostDialog } from "./create-post-dialog";

interface FloatingCreateButtonProps {
  className?: string;
}

export function FloatingCreateButton({ className }: FloatingCreateButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || "en";
  const groupId = searchParams.get("groupId") || "";

  return (
    <>
      <Button
        onClick={() => setDialogOpen(true)}
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
        <PenSquare className="h-6 w-6" />
      </Button>
      
      <CreatePostDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialGroupId={groupId}
      />
    </>
  );
}