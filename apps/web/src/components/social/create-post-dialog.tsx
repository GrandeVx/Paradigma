"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  PenSquare,
  X,
  Expand,
} from "lucide-react";
import { CreatePostForm } from "./create-post-form";
import { cn } from "@/lib/utils";

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialGroupId?: string;
}

export function CreatePostDialog({
  open,
  onOpenChange,
  initialGroupId
}: CreatePostDialogProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "linear-dialog transition-all duration-300 ease-out",
          "border-0 shadow-2xl backdrop-blur-sm",
          isExpanded
            ? "sm:max-w-4xl max-h-[95vh]"
            : "sm:max-w-2xl max-h-[90vh]"
        )}
      >
        {/* Linear-style Header */}
        <DialogHeader className="linear-dialog-header flex-row items-center justify-between space-y-0 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <PenSquare className="h-4 w-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-foreground">
                New issue
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Share your thoughts with the community
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Expand button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Expand className="h-4 w-4" />
            </Button>

            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Form Content */}
        <div className="flex-1 overflow-auto px-1">
          <CreatePostForm
            initialGroupId={initialGroupId}
            onSuccess={() => onOpenChange(false)}
            onCancel={() => onOpenChange(false)}
            isExpanded={isExpanded}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}