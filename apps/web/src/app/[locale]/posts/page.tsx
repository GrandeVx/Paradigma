"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SocialLayout } from "@/components/layout/social-layout";
import { PostCard } from "@/components/social";
import { Plus, MessageCircle, TrendingUp, Clock } from "lucide-react";
import { api } from "@/trpc/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CreatePostDialog } from "@/components/social/create-post-dialog";

export default function PostsPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  // Get current user
  const { data: userInfo } = api.user.getUserInfo.useQuery();

  // Get all groups the user can see posts from
  const { data: groupsData } = api.groups.listGroups.useQuery({
    limit: 50,
    onlyPublic: false,
  });

  interface Group {
    isPublic: boolean;
    owner: {
      id: string;
    };
    memberCount: number;
  }

  const allGroups = groupsData?.groups || [];
  const visibleGroups = allGroups.filter((group: Group) => 
    group.isPublic || group.owner.id === userInfo?.id
  );

  // Get posts from all visible groups
  interface Post {
    id: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    author: {
      id: string;
      name: string | null;
      image: string | null;
      email: string;
    };
    group: {
      id: string;
      name: string;
      isPublic: boolean;
    };
    _count?: {
      likes: number;
      comments: number;
    };
  }
  
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);

  // This is a simplified approach. In a real app, you'd want to implement
  // server-side aggregation or use a more sophisticated data fetching strategy
  React.useEffect(() => {
    const fetchAllPosts = async () => {
      if (visibleGroups.length === 0) {
        setIsLoadingPosts(false);
        return;
      }

      try {
        setIsLoadingPosts(true);
        const postsPromises = visibleGroups.slice(0, 10).map(group => 
          fetch(`/api/trpc/posts.getGroupPosts?input=${encodeURIComponent(JSON.stringify({ groupId: group.id, limit: 5 }))}`)
            .then(res => res.json())
            .then(data => data.result.data.posts || [])
            .catch(() => [])
        );

        const groupPosts = await Promise.all(postsPromises);
        const flatPosts = groupPosts.flat();
        
        // Sort by creation date (newest first)
        flatPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        setAllPosts(flatPosts.slice(0, 20)); // Limit to 20 most recent posts
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setIsLoadingPosts(false);
      }
    };

    fetchAllPosts();
  }, [visibleGroups.length]);

  return (
    <SocialLayout>
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Recent Posts</h1>
            <p className="text-muted-foreground">
              Discover the latest posts from your communities
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Post
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Groups</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{visibleGroups.length}</div>
              <p className="text-xs text-muted-foreground">
                Active communities
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Posts</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allPosts.length}</div>
              <p className="text-xs text-muted-foreground">
                From your communities
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {visibleGroups.reduce((sum, group) => sum + group.memberCount, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all groups
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Posts Feed */}
        {isLoadingPosts ? (
          <div className="space-y-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="h-48">
                <CardHeader>
                  <div className="flex items-start space-x-3">
                    <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 w-full animate-pulse rounded bg-muted" />
                    <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : allPosts.length === 0 ? (
          <Card>
            <CardHeader className="text-center">
              <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground" />
              <CardTitle>No Posts Found</CardTitle>
              <CardDescription>
                {visibleGroups.length === 0
                  ? "Join some groups to see posts in your feed"
                  : "No recent posts from your communities. Be the first to post!"}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex justify-center space-x-4">
                <Button asChild variant="outline">
                  <Link href={`/${locale}/groups`}>
                    Browse Groups
                  </Link>
                </Button>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Post
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {allPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={userInfo?.id}
                showGroupName={true}
              />
            ))}
          </div>
        )}

        {/* Browse Groups CTA */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Discover More Communities</CardTitle>
            <CardDescription>
              Join more groups to see more posts in your feed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={`/${locale}/groups`}>
                Browse All Groups
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Create Post Dialog */}
        <CreatePostDialog 
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />
      </div>
    </SocialLayout>
  );
}