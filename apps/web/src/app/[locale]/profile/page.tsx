"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SocialLayout } from "@/components/layout/social-layout";
import { UserAvatar, GroupCard } from "@/components/social";
import {
  Calendar,
  Users,
  MessageCircle,
  Settings,
  Crown,
  Edit,
} from "lucide-react";
import { api } from "@/trpc/react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ProfilePage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  // Get current user
  const { data: userInfo, isLoading: isLoadingUser } = api.user.getUserInfo.useQuery();

  // Get user's groups
  const { data: groupsData, isLoading: isLoadingGroups } = api.groups.listGroups.useQuery({
    limit: 50,
    onlyPublic: false,
  });

  // Get user's recent posts from all their groups
  // Note: In a real app, you'd want a dedicated API endpoint for user posts
  const allGroups = groupsData?.groups || [];
  const ownedGroups = allGroups.filter(group => group.owner.id === userInfo?.id);
  const memberGroups = allGroups.filter(group =>
    group.owner.id !== userInfo?.id && !group.isPublic
  );

  if (isLoadingUser) {
    return (
      <SocialLayout>
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-48 w-full rounded-lg bg-muted" />
            <div className="h-64 w-full rounded-lg bg-muted" />
          </div>
        </div>
      </SocialLayout>
    );
  }

  if (!userInfo) {
    return (
      <SocialLayout>
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Authentication Required</CardTitle>
              <CardDescription>
                Please sign in to view your profile.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href={`/${locale}/sign-in`}>Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </SocialLayout>
    );
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <SocialLayout>
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col space-y-4 lg:flex-row lg:items-start lg:justify-between lg:space-y-0">
              <div className="flex items-start space-x-6">
                <UserAvatar user={userInfo} size="xl" className="flex-shrink-0" />
                <div className="space-y-3">
                  <div>
                    <h1 className="text-3xl font-bold">
                      {userInfo.name || userInfo.username || "User"}
                    </h1>
                    <p className="text-muted-foreground">{userInfo.email}</p>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {formatDate(userInfo.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>{ownedGroups.length + memberGroups.length} groups</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Crown className="h-4 w-4 text-yellow-500" />
                      <span>{ownedGroups.length} owned</span>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex space-x-6">
                    <div className="text-center">
                      <div className="text-xl font-bold text-primary">
                        {allGroups.reduce((sum, group) => sum + group.postCount, 0)}
                      </div>
                      <div className="text-xs text-muted-foreground">Posts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-primary">
                        {allGroups.reduce((sum, group) => sum + group.memberCount, 0)}
                      </div>
                      <div className="text-xs text-muted-foreground">Community Size</div>
                    </div>
                  </div>
                </div>
              </div>

              <Button asChild>
                <Link href={`/${locale}/profile/edit`}>
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Profile
                </Link>
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Profile Content */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="groups">My Groups</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Groups Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Groups</CardTitle>
                  <CardDescription>
                    Groups you own and participate in
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingGroups ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center space-x-3">
                          <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
                          <div className="space-y-1 flex-1">
                            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Owned Groups */}
                      {ownedGroups.slice(0, 3).map((group) => (
                        <div key={group.id} className="flex items-center space-x-3">
                          <div className="h-10 w-10 overflow-hidden rounded-lg bg-muted">
                            {group.image ? (
                              <img src={group.image} alt={group.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-primary/10">
                                <Users className="h-5 w-5 text-primary" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <Link
                                href={`/${locale}/groups/${group.id}`}
                                className="font-medium hover:underline truncate"
                              >
                                {group.name}
                              </Link>
                              <Crown className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {group.memberCount} members • {group.postCount} posts
                            </p>
                          </div>
                        </div>
                      ))}

                      {/* Member Groups */}
                      {memberGroups.slice(0, 2).map((group) => (
                        <div key={group.id} className="flex items-center space-x-3">
                          <div className="h-10 w-10 overflow-hidden rounded-lg bg-muted">
                            {group.image ? (
                              <img src={group.image} alt={group.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-primary/10">
                                <Users className="h-5 w-5 text-primary" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/${locale}/groups/${group.id}`}
                              className="font-medium hover:underline truncate block"
                            >
                              {group.name}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              {group.memberCount} members • {group.postCount} posts
                            </p>
                          </div>
                        </div>
                      ))}

                      {allGroups.length > 5 && (
                        <Button variant="ghost" size="sm" asChild className="w-full">
                          <Link href={`/${locale}/profile?tab=groups`}>
                            View All Groups ({allGroups.length})
                          </Link>
                        </Button>
                      )}

                      {allGroups.length === 0 && (
                        <div className="text-center py-6">
                          <Users className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground mb-3">
                            You haven't joined any groups yet
                          </p>
                          <Button asChild size="sm">
                            <Link href={`/${locale}/groups`}>Browse Groups</Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                  <CardDescription>
                    Your latest posts and interactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6">
                    <MessageCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-3">
                      Activity feed coming soon
                    </p>
                    <p className="text-xs text-muted-foreground">
                      We're working on showing your recent posts, comments, and group activity here.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Groups Tab */}
          <TabsContent value="groups" className="space-y-6 mt-6">
            {isLoadingGroups ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="h-48">
                    <CardHeader>
                      <div className="flex items-center space-x-2">
                        <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
                        <div className="space-y-2">
                          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 w-full animate-pulse rounded bg-muted" />
                        <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : allGroups.length === 0 ? (
              <Card>
                <CardHeader className="text-center">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                  <CardTitle>No Groups Yet</CardTitle>
                  <CardDescription>
                    You haven't joined or created any groups yet. Start building your community!
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-x-4">
                  <Button asChild variant="outline">
                    <Link href={`/${locale}/groups`}>Browse Groups</Link>
                  </Button>
                  <Button asChild>
                    <Link href={`/${locale}/groups/create`}>Create Group</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Owned Groups */}
                {ownedGroups.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold mb-4 flex items-center">
                      <Crown className="mr-2 h-5 w-5 text-yellow-500" />
                      Groups You Own ({ownedGroups.length})
                    </h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {ownedGroups.map((group) => (
                        <GroupCard
                          key={group.id}
                          group={group}
                          currentUserId={userInfo.id}
                          showJoinButton={false}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Member Groups */}
                {memberGroups.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold mb-4">
                      Groups You're In ({memberGroups.length})
                    </h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {memberGroups.map((group) => (
                        <GroupCard
                          key={group.id}
                          group={group}
                          currentUserId={userInfo.id}
                          showJoinButton={false}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Activity Feed</CardTitle>
                <CardDescription>
                  Your posts, comments, and group interactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MessageCircle className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Activity Feed Coming Soon</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    We're working on a comprehensive activity feed that will show your recent posts,
                    comments, group joins, and other social interactions.
                  </p>
                  <Button asChild>
                    <Link href={`/${locale}/posts/create`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Create Your First Post
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SocialLayout>
  );
}