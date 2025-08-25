"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import {
  Users,
  Globe,
  Lock,
  Crown,
  Plus,
  CheckCircle2
} from "lucide-react";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";

const createPostSchema = z.object({
  content: z.string().min(1, "Content is required").max(2000, "Content must be 2000 characters or less"),
  groupId: z.string().min(1, "Please select a group"),
});

type CreatePostForm = z.infer<typeof createPostSchema>;

interface GroupData {
  id: string;
  name: string;
  isPublic: boolean;
  memberCount: number;
  postCount: number;
  owner: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface CreatePostFormProps {
  initialGroupId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  isExpanded?: boolean;
}

export function CreatePostForm({
  initialGroupId = "",
  onSuccess,
  onCancel,
  isExpanded = false
}: CreatePostFormProps) {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  // Get current user
  const { data: userInfo, isLoading: isLoadingUser } = api.user.getUserInfo.useQuery();

  // Fetch user's groups
  const { data: groupsData, isLoading: isLoadingGroups } = api.groups.listGroups.useQuery({
    limit: 50,
    onlyPublic: false,
  });

  const form = useForm<CreatePostForm>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      content: "",
      groupId: initialGroupId,
    },
  });

  const createPostMutation = api.posts.createPost.useMutation({
    onSuccess: (post) => {
      toast({
        title: "Post created",
        description: "Your post has been published successfully.",
      });

      // Clear form and draft
      form.reset();
      localStorage.removeItem("post-draft");
      localStorage.removeItem("post-draft-group");

      // Call success callback or navigate
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/${locale}/posts/${post.id}`);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create post.",
        variant: "destructive",
      });
    },
  });

  // Auto-save draft functionality
  const content = form.watch("content");
  const groupId = form.watch("groupId");

  useEffect(() => {
    if (content.trim()) {
      localStorage.setItem("post-draft", content);
    }
  }, [content]);

  useEffect(() => {
    if (groupId) {
      localStorage.setItem("post-draft-group", groupId);
    }
  }, [groupId]);

  // Restore draft when component loads
  useEffect(() => {
    const savedDraft = localStorage.getItem("post-draft");
    const savedGroup = localStorage.getItem("post-draft-group");

    if (savedDraft) {
      form.setValue("content", savedDraft);
    }

    if (savedGroup) {
      form.setValue("groupId", savedGroup);
    }
  }, [form]);

  const onSubmit = (data: CreatePostForm) => {
    createPostMutation.mutate(data);
  };

  // Filter groups to show only those where user can post
  const allGroups = groupsData?.groups || [];
  const userGroups = allGroups.filter((group: GroupData) => {
    return group.owner.id === userInfo?.id || group.isPublic;
  });

  // Find selected group for display
  const selectedGroup = userGroups.find((group: GroupData) => group.id === groupId);

  // Loading state
  if (isLoadingUser || isLoadingGroups) {
    return (
      <div className="space-y-6 p-1">
        <div className="space-y-2">
          <div className="h-4 w-24 rounded bg-muted animate-pulse" />
          <div className="h-10 w-full rounded bg-muted animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-20 rounded bg-muted animate-pulse" />
          <div className="h-32 w-full rounded bg-muted animate-pulse" />
        </div>
        <div className="flex justify-end gap-2">
          <div className="h-9 w-16 rounded bg-muted animate-pulse" />
          <div className="h-9 w-24 rounded bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  // No user state
  if (!userInfo) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Please sign in to create posts.
        </p>
        <Button onClick={onCancel} variant="outline">
          Close
        </Button>
      </div>
    );
  }

  // No groups available state
  if (userGroups.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold mb-2">No Groups Available</h3>
        <p className="text-sm text-muted-foreground mb-6">
          You need to join or create a group to post.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={onCancel} variant="outline">
            Close
          </Button>
          <Button asChild>
            <a href={`/${locale}/groups`}>
              Browse Groups
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full space-y-6">
          {/* Issue Title Field - Linear Style */}
          <div className="space-y-1">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Issue title"
                      className={cn(
                        "border-none shadow-none resize-none p-0 text-2xl font-medium placeholder:text-muted-foreground/60",
                        "focus-visible:ring-0 focus-visible:ring-offset-0",
                        isExpanded ? "min-h-[120px]" : "min-h-[80px]"
                      )}
                      {...field}
                      disabled={createPostMutation.isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Content Description Area */}
          <div className="space-y-3 flex-1">
            <div className="text-muted-foreground text-sm">
              Add description...
            </div>

            {/* Character Count */}
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>{content.length}/2000 characters</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                Auto-saved
              </span>
            </div>
          </div>

          {/* Linear-style Bottom Toolbar */}
          <div className="border-t pt-4 mt-auto">
            <div className="flex items-center justify-between">
              {/* Left side - Selectors */}
              <div className="flex items-center gap-2">
                {/* Group Selector - Linear Style */}
                <FormField
                  control={form.control}
                  name="groupId"
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className={cn(
                            "h-8 border-none shadow-none bg-muted/50 hover:bg-muted transition-colors",
                            "focus:ring-0 focus:ring-offset-0 w-auto gap-2 px-3"
                          )}>
                            <div className="flex items-center gap-2">
                              {selectedGroup ? (
                                <>
                                  {selectedGroup.isPublic ? (
                                    <Globe className="h-3 w-3 text-green-500" />
                                  ) : (
                                    <Lock className="h-3 w-3 text-orange-500" />
                                  )}
                                  <span className="text-sm font-medium">{selectedGroup.name}</span>
                                </>
                              ) : (
                                <>
                                  <Users className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">Project</span>
                                </>
                              )}
                            </div>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent side="top">
                          {userGroups.map((group: GroupData) => (
                            <SelectItem key={group.id} value={group.id}>
                              <div className="flex items-center gap-2 w-full">
                                {group.isPublic ? (
                                  <Globe className="h-3 w-3 text-green-500" />
                                ) : (
                                  <Lock className="h-3 w-3 text-orange-500" />
                                )}
                                <span className="flex-1 truncate">{group.name}</span>
                                {group.owner.id === userInfo?.id && (
                                  <Crown className="h-3 w-3 text-yellow-500" />
                                )}
                                <span className="text-xs text-muted-foreground ml-auto">
                                  {group.memberCount}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Additional Linear-style buttons could go here */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted"
                  disabled
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Assignee
                </Button>
              </div>

              {/* Right side - Actions */}
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onCancel}
                  disabled={createPostMutation.isLoading}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createPostMutation.isLoading || !form.formState.isValid}
                  className="min-w-[100px] bg-primary hover:bg-primary/90"
                >
                  {createPostMutation.isLoading ? "Creating..." : "Create issue"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}