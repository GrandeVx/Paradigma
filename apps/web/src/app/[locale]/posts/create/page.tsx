"use client";

import { useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { SocialLayout } from "@/components/layout/social-layout";
import { ArrowLeft, PenSquare } from "lucide-react";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";
import Link from "next/link";

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

export default function CreatePostPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || "en";
  const initialGroupId = searchParams.get("groupId") || "";

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
      
      // Navigate to post
      router.push(`/${locale}/posts/${post.id}`);
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

  // Restore draft when page loads
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

  // Loading state
  if (isLoadingUser || isLoadingGroups) {
    return (
      <SocialLayout>
        <div className="container max-w-2xl mx-auto px-4 py-8">
          <div className="space-y-4">
            <div className="h-6 w-32 rounded bg-muted animate-pulse" />
            <div className="h-32 w-full rounded bg-muted animate-pulse" />
            <div className="flex justify-end gap-2">
              <div className="h-10 w-20 rounded bg-muted animate-pulse" />
              <div className="h-10 w-32 rounded bg-muted animate-pulse" />
            </div>
          </div>
        </div>
      </SocialLayout>
    );
  }

  // No user state
  if (!userInfo) {
    return (
      <SocialLayout>
        <div className="container max-w-2xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-8">
              <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Please sign in to create posts.
              </p>
              <Button asChild>
                <Link href={`/${locale}/sign-in`}>
                  Sign In
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </SocialLayout>
    );
  }

  // No groups available state
  if (userGroups.length === 0) {
    return (
      <SocialLayout>
        <div className="container max-w-2xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-8">
              <h3 className="text-lg font-semibold mb-2">No Groups Available</h3>
              <p className="text-sm text-muted-foreground mb-6">
                You need to join or create a group to post.
              </p>
              <div className="flex gap-3 justify-center">
                <Button asChild variant="outline">
                  <Link href={`/${locale}/groups`}>
                    Browse Groups
                  </Link>
                </Button>
                <Button asChild>
                  <Link href={`/${locale}/groups/create`}>
                    Create Group
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </SocialLayout>
    );
  }

  return (
    <SocialLayout>
      <div className="container max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button asChild variant="outline" size="sm">
            <Link href={`/${locale}/posts`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Posts
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <PenSquare className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold">Create New Post</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Share your thoughts</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Group Selection */}
                <FormField
                  control={form.control}
                  name="groupId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Group</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a group to post in..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {userGroups.map((group: GroupData) => (
                            <SelectItem key={group.id} value={group.id}>
                              <div className="flex items-center justify-between w-full">
                                <span className="truncate">{group.name}</span>
                                <span className="text-xs text-muted-foreground ml-2">
                                  {group.memberCount} members
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Content */}
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What's on your mind?"
                          className={cn(
                            "min-h-[200px] resize-none text-base",
                            "placeholder:text-muted-foreground"
                          )}
                          {...field}
                          disabled={createPostMutation.isLoading}
                        />
                      </FormControl>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{content.length}/2000 characters</span>
                        <span>Auto-saved</span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    asChild
                  >
                    <Link href={`/${locale}/posts`}>
                      Cancel
                    </Link>
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createPostMutation.isLoading || !form.formState.isValid}
                    className="min-w-[120px]"
                  >
                    {createPostMutation.isLoading ? "Publishing..." : "Create Post"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </SocialLayout>
  );
}