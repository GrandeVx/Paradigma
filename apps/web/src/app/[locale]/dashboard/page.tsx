"use client";

import { api } from "@/trpc/react";
import { useState } from "react";
import { Loader2, User, Mail, Calendar, Users, MessageCircle, Plus, TrendingUp, Activity, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useParams } from "next/navigation";
import { SocialLayout } from "@/components/layout/social-layout";

// Updated type to match our component needs
type UserInfo = {
  id: string;
  email: string;
  username: string | null;
  firstName: string | null;
  name: string | null;
  lastName: string | null;
  phone: string | null;
  notifications: boolean;
  notificationToken: string | null;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

// Type for the API response
type ApiUserResponse = {
  id: string;
  email: string;
  username: string | null;
  phone: string | null;
  firstName?: string | null;
  lastName?: string | null;
  first_name?: string | null; // DB mapping might use snake_case
  last_name?: string | null;  // DB mapping might use snake_case
  notifications: boolean;
  notificationToken: string | null;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  // Other possible fields
  name?: string | null;
  image?: string | null;
  emailVerified?: boolean;
};

// Map API response to our UserInfo type
const mapApiResponseToUserInfo = (data: ApiUserResponse): UserInfo => {
  return {
    id: data.id,
    email: data.email,
    username: data.username,
    firstName: data.firstName || data.first_name || data.name || null,
    lastName: data.lastName || data.last_name || null,
    phone: data.phone,
    notifications: data.notifications,
    notificationToken: data.notificationToken,
    isDeleted: data.isDeleted,
    deletedAt: data.deletedAt,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    name: data.name || null,
  };
};

export default function DashboardPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use tRPC hook to fetch user info
  api.user.getUserInfo.useQuery(undefined, {
    enabled: true,
    retry: 1,
    onSuccess: (data) => {
      if (data) {
        setUserInfo(mapApiResponseToUserInfo(data as unknown as ApiUserResponse));
      }
      setIsLoading(false);
    },
    onError: (err) => {
      setError(err.message || "Failed to fetch user information");
      setIsLoading(false);
    },
  });

  // Fetch user's groups for dashboard stats
  const { data: groupsData } = api.groups.listGroups.useQuery({
    limit: 50,
    onlyPublic: false,
  });

  if (isLoading) {
    return (
      <SocialLayout>
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </SocialLayout>
    );
  }

  if (error) {
    return (
      <SocialLayout>
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="w-full max-w-md mx-auto rounded-lg bg-red-50 p-6 text-center shadow-sm">
            <h2 className="mb-2 text-xl font-semibold text-red-700">Error</h2>
            <p className="text-red-600">{error || "Failed to load user data"}</p>
          </div>
        </div>
      </SocialLayout>
    );
  }

  type Group = {
    id: string;
    owner: { id: string };
    memberCount: number;
    postCount: number;
  };

  const allGroups = groupsData?.groups || [];
  // @ts-expect-error - TODO: fix this  
  const ownedGroups = allGroups.filter((group: Group) => group.owner.id === userInfo?.id);
  // @ts-expect-error - TODO: fix this
  const totalMembers = allGroups.reduce((sum: number, group: Group) => sum + group.memberCount, 0);
  // @ts-expect-error - TODO: fix this
  const totalPosts = allGroups.reduce((sum: number, group: Group) => sum + group.postCount, 0);

  return (
    <SocialLayout>
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Header */}
          <div className="mb-12">
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                Welcome back, {userInfo?.name || userInfo?.username || "User"}
              </h1>
              <p className="text-lg text-muted-foreground">
                Here's what's happening in your communities
              </p>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="mb-12">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="transition-all duration-200 hover:shadow-md hover:shadow-primary/5 border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Your Groups
                  </CardTitle>
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {allGroups.length}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {ownedGroups.length} owned by you
                  </p>
                </CardContent>
              </Card>

              <Card className="transition-all duration-200 hover:shadow-md hover:shadow-primary/5 border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Posts
                  </CardTitle>
                  <div className="p-2 bg-success-50 rounded-full">
                    <MessageCircle className="h-4 w-4 text-success-500" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {totalPosts._count.posts}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Across all your groups
                  </p>
                </CardContent>
              </Card>

              <Card className="transition-all duration-200 hover:shadow-md hover:shadow-primary/5 border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Community Size
                  </CardTitle>
                  <div className="p-2 bg-orange-50 rounded-full">
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {totalMembers._count.members}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total members reached
                  </p>
                </CardContent>
              </Card>

              <Card className="transition-all duration-200 hover:shadow-md hover:shadow-primary/5 border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Member Since
                  </CardTitle>
                  <div className="p-2 bg-purple-50 rounded-full">
                    <Calendar className="h-4 w-4 text-purple-500" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {userInfo?.createdAt
                      ? new Date(userInfo.createdAt).toLocaleDateString("en-US", { month: "short" })
                      : "N/A"
                    }
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {userInfo?.createdAt
                      ? new Date(userInfo.createdAt).getFullYear()
                      : ""
                    }
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Quick Actions - 2/3 width */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-foreground mb-2">Quick Actions</h2>
                <p className="text-muted-foreground">Jump into your community activities</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm hover:shadow-primary/10">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                        <Plus className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Create Content</CardTitle>
                        <CardDescription className="mt-1">
                          Share your thoughts and ideas
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button
                      asChild
                      className="w-full h-11 text-base font-medium"
                    >
                      <Link href={`/${locale}/posts/create`}>
                        Create New Post
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm hover:shadow-primary/10">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-success-50 rounded-xl group-hover:bg-success-500/20 transition-colors">
                        <Users className="h-6 w-6 text-success-500" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Explore Groups</CardTitle>
                        <CardDescription className="mt-1">
                          Find new communities to join
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button asChild variant="outline" className="w-full h-11 text-base font-medium">
                      <Link href={`/${locale}/groups`}>
                        Browse Communities
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm hover:shadow-primary/10">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-orange-50 rounded-xl group-hover:bg-orange-500/20 transition-colors">
                        <Activity className="h-6 w-6 text-orange-500" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Recent Activity</CardTitle>
                        <CardDescription className="mt-1">
                          Stay updated with latest posts
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button asChild variant="outline" className="w-full h-11 text-base font-medium">
                      <Link href={`/${locale}/posts`}>
                        View Feed
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm hover:shadow-primary/10">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-purple-50 rounded-xl group-hover:bg-purple-500/20 transition-colors">
                        <Target className="h-6 w-6 text-purple-500" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Manage Groups</CardTitle>
                        <CardDescription className="mt-1">
                          Control your communities
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button asChild variant="outline" className="w-full h-11 text-base font-medium">
                      <Link href={`/${locale}/groups?filter=owned`}>
                        Your Groups
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Profile Overview - 1/3 width */}
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-foreground mb-2">Profile</h2>
                <p className="text-muted-foreground">Your account information</p>
              </div>

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Your Profile</CardTitle>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/${locale}/profile/edit`}>
                        Edit
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-6">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-muted rounded-full">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">Full Name</p>
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {userInfo?.name || userInfo?.username || "Not set"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-muted rounded-full">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">Email Address</p>
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {userInfo?.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-muted rounded-full">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">Member Since</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {userInfo?.createdAt
                          ? new Date(userInfo.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                          })
                          : "Unknown"
                        }
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Badge variant="secondary" className="text-xs">
                      Active Community Member
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Getting Started Section - Only shown for new users */}
          {allGroups.length === 0 && (
            <Card className="border border-dashed border-primary/20 bg-primary/5">
              <CardContent className="py-12 px-8 text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl mb-3">Welcome to Paradigma!</CardTitle>
                <CardDescription className="text-base mb-8 max-w-md mx-auto">
                  You haven't joined any communities yet. Discover groups that match your interests
                  or create your own to start building connections.
                </CardDescription>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="text-base font-medium px-8">
                    <Link href={`/${locale}/groups`}>
                      <Users className="mr-2 h-5 w-5" />
                      Explore Communities
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="text-base font-medium px-8">
                    <Link href={`/${locale}/groups/create`}>
                      <Plus className="mr-2 h-5 w-5" />
                      Create Your Group
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </SocialLayout>
  );
}
