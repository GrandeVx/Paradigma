"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SocialLayout } from "@/components/layout/social-layout";
import { PostCard, UserAvatar } from "@/components/social";
import {
  Users,
  Globe,
  Lock,
  Settings,
  Plus,
  MessageCircle,
  ArrowLeft,
  UserPlus,
  Crown,
} from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";
import { type RouterOutputs } from "@paradigma/api";

export default function GroupDetailPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const groupId = params?.id as string;

  // Get current user
  const { data: userInfo } = api.user.getUserInfo.useQuery();

  // Fetch group details
  const { data: group, isLoading: isLoadingGroup, error: groupError } = api.groups.getGroup.useQuery(
    { id: groupId },
    { enabled: !!groupId }
  );

  // Fetch group posts
  const { data: postsData, isLoading: isLoadingPosts } = api.posts.getGroupPosts.useInfiniteQuery(
    { groupId, limit: 10 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: !!groupId,
    }
  );

  // Fetch group members
  const { data: membersData, isLoading: isLoadingMembers } = api.groups.getGroupMembers.useQuery(
    { groupId, limit: 20 },
    { enabled: !!groupId }
  );

  const utils = api.useUtils();

  // Join group mutation
  const joinGroupMutation = api.groups.requestJoin.useMutation({
    onSuccess: () => {
      toast({
        title: group?.isPublic ? "Joined group" : "Join request sent",
        description: group?.isPublic
          ? "You have successfully joined the group."
          : "Your request to join has been sent to the group administrators.",
      });
      utils.groups.getGroup.invalidate({ id: groupId });
      utils.groups.getGroupMembers.invalidate({ groupId });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to join group.",
        variant: "destructive",
      });
    },
  });

  const handleCreatePost = () => {
    if (!userInfo) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create posts.",
        variant: "destructive",
      });
      return;
    }

    // Navigate to create post page with the group pre-selected
    router.push(`/${locale}/posts/create?groupId=${groupId}`);
  };

  const handleJoinGroup = () => {
    if (!userInfo) {
      toast({
        title: "Authentication required",
        description: "Please sign in to join groups.",
        variant: "destructive",
      });
      return;
    }

    joinGroupMutation.mutate({ groupId });
  };

  const allPosts = postsData?.pages.flatMap((page) => page.posts) ?? [];
  const members = membersData?.members ?? [];

  const isOwner = userInfo?.id === group?.owner.id;
  const isMember = members.some((member: RouterOutputs['groups']['getGroupMembers']['members'][number]) => member.user.id === userInfo?.id);

  if (groupError) {
    return (
      <SocialLayout>
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Error Loading Group</CardTitle>
              <CardDescription>
                {groupError.message || "Failed to load group. Please try again."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.back()} variant="outline">
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </SocialLayout>
    );
  }

  if (isLoadingGroup) {
    return (
      <SocialLayout>
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 rounded bg-muted" />
            <div className="h-48 w-full rounded-lg bg-muted" />
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-48 rounded-lg bg-muted" />
                ))}
              </div>
              <div className="space-y-4">
                <div className="h-64 rounded-lg bg-muted" />
              </div>
            </div>
          </div>
        </div>
      </SocialLayout>
    );
  }

  if (!group) {
    return (
      <SocialLayout>
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Group Not Found</CardTitle>
              <CardDescription>
                The group you're looking for doesn't exist or you don't have permission to view it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href={`/${locale}/groups`}>Browse Groups</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </SocialLayout>
    );
  }

  return (
    <SocialLayout>
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${locale}/groups`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Groups
          </Link>

          <Card>
            <CardHeader>
              <div className="flex flex-col space-y-4 lg:flex-row lg:items-start lg:justify-between lg:space-y-0">
                <div className="flex items-start space-x-4">
                  <div className="h-16 w-16 overflow-hidden rounded-lg bg-muted flex-shrink-0">
                    {group.image ? (
                      <img src={group.image} alt={group.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary/10">
                        <Users className="h-8 w-8 text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-2xl">{group.name}</CardTitle>
                      <Badge variant={group.isPublic ? "secondary" : "outline"}>
                        {group.isPublic ? (
                          <>
                            <Globe className="mr-1 h-3 w-3" />
                            Public
                          </>
                        ) : (
                          <>
                            <Lock className="mr-1 h-3 w-3" />
                            Private
                          </>
                        )}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{group.memberCount} members</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{group.postCount} posts</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <UserAvatar user={group.owner} size="sm" />
                      <span className="text-sm text-muted-foreground">
                        Created by <span className="font-medium">{group.owner.name || "User"}</span>
                      </span>
                      {isOwner && <Crown className="h-4 w-4 text-yellow-500" />}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {isOwner && (
                    <Button asChild variant="outline">
                      <Link href={`/${locale}/groups/${group.id}/manage`}>
                        <Settings className="mr-2 h-4 w-4" />
                        Manage
                      </Link>
                    </Button>
                  )}
                  {!isOwner && !isMember && (
                    <Button onClick={handleJoinGroup} disabled={joinGroupMutation.isLoading}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      {joinGroupMutation.isLoading ? "Joining..." : "Join Group"}
                    </Button>
                  )}
                </div>
              </div>
              {group.description && (
                <CardDescription className="mt-4 text-base">
                  {group.description}
                </CardDescription>
              )}
            </CardHeader>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Posts Feed */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="posts" className="w-full">
              <TabsList>
                <TabsTrigger value="posts">Posts</TabsTrigger>
              </TabsList>

              <TabsContent value="posts" className="mt-6 space-y-6">
                {/* Create Post (only for members) */}
                {isMember && (
                  <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
                    <CardContent className="flex items-center justify-center py-8">
                      <Button
                        onClick={handleCreatePost}
                        size="lg"
                        className="h-12 px-8"
                      >
                        <Plus className="mr-2 h-5 w-5" />
                        Create New Post
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Posts List */}
                {isLoadingPosts ? (
                  <div className="space-y-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i} className="h-48 animate-pulse" />
                    ))}
                  </div>
                ) : allPosts.length === 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>No Posts Yet</CardTitle>
                      <CardDescription>
                        {isMember
                          ? "Be the first to create a post in this group!"
                          : "This group doesn't have any posts yet."}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {allPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        currentUserId={userInfo?.id}
                        showGroupName={false}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Members */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Members ({group.memberCount})</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingMembers ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {members.slice(0, 10).map((member: RouterOutputs['groups']['getGroupMembers']['members'][number]) => (
                      <div key={member.id} className="flex items-center space-x-3">
                        <UserAvatar user={member.user} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium truncate">
                              {member.user.name || "User"}
                            </span>
                            {member.user.id === group.owner.id && (
                              <Crown className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                            )}
                            {member.role !== "MEMBER" && (
                              <Badge variant="outline" className="text-xs">
                                {member.role.toLowerCase()}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {members.length > 10 && (
                      <div className="text-center pt-2">
                        <Button variant="ghost" size="sm">
                          View All Members
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SocialLayout>
  );
}