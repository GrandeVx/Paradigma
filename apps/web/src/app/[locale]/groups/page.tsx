"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SocialLayout } from "@/components/layout/social-layout";
import { GroupCard } from "@/components/social";
import { Search, Plus, Users, Filter } from "lucide-react";
import { api } from "@/trpc/react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function GroupsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyPublic, setShowOnlyPublic] = useState(false);

  // Get current user
  const { data: userInfo } = api.user.getUserInfo.useQuery();

  // Fetch groups with infinite scroll
  const {
    data: groupsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = api.groups.listGroups.useInfiniteQuery(
    {
      limit: 12,
      search: searchQuery || undefined,
      onlyPublic: showOnlyPublic,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchOnWindowFocus: false,
    }
  );

  const allGroups = groupsData?.pages.flatMap((page) => page.groups) ?? [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The query will automatically refetch due to the dependency
  };

  if (error) {
    return (
      <SocialLayout>
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Error Loading Groups</CardTitle>
              <CardDescription>
                {error.message || "Failed to load groups. Please try again."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.reload()} variant="outline">
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </SocialLayout>
    );
  }

  return (
    <SocialLayout>
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-12">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
                  Communities
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  Discover and join communities that match your interests. Connect with like-minded people
                  and participate in meaningful conversations.
                </p>
              </div>
              <Button asChild size="lg" className="w-fit">
                <Link href={`/${locale}/groups/create`}>
                  <Plus className="mr-2 h-5 w-5" />
                  Create Community
                </Link>
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-10">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search communities by name, description, or topics..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-12 text-base border-0 bg-muted/50 focus:bg-background transition-colors"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">Filters:</span>
                      <Button
                        type="button"
                        variant={showOnlyPublic ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowOnlyPublic(!showOnlyPublic)}
                        className="h-8"
                      >
                        Public Only
                      </Button>
                    </div>

                    <Button type="submit" size="sm" className="h-8">
                      Search
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Communities Grid */}
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-12">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="border-0 shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="h-12 w-12 animate-pulse rounded-xl bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 animate-pulse rounded-lg bg-muted" />
                        <div className="h-3 w-1/2 animate-pulse rounded-lg bg-muted" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="h-3 w-full animate-pulse rounded-lg bg-muted" />
                      <div className="h-3 w-5/6 animate-pulse rounded-lg bg-muted" />
                      <div className="flex gap-6 mt-4">
                        <div className="h-3 w-16 animate-pulse rounded-lg bg-muted" />
                        <div className="h-3 w-16 animate-pulse rounded-lg bg-muted" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : allGroups.length === 0 ? (
            <Card className="border border-dashed border-primary/20 bg-primary/5 mb-12">
              <CardContent className="py-16 px-8 text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl mb-3">
                  {searchQuery ? "No communities found" : "No communities yet"}
                </CardTitle>
                <CardDescription className="text-base mb-8 max-w-md mx-auto">
                  {searchQuery
                    ? `We couldn't find any communities matching "${searchQuery}". Try a different search term or create a new community.`
                    : "Be the first to create a community and start building connections with others who share your interests."}
                </CardDescription>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {searchQuery && (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setSearchQuery("")}
                    >
                      Clear Search
                    </Button>
                  )}
                  <Button asChild size="lg" className="px-8">
                    <Link href={`/${locale}/groups/create`}>
                      <Plus className="mr-2 h-5 w-5" />
                      Create Community
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-12">
                {allGroups.map((group) => (
                  <GroupCard
                    key={group.id}
                    // @ts-expect-error - TODO: fix this
                    group={group}
                    currentUserId={userInfo?.id}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {hasNextPage && (
                <div className="text-center mb-12">
                  <Button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    variant="outline"
                    size="lg"
                    className="px-8"
                  >
                    {isFetchingNextPage ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                        Loading...
                      </>
                    ) : (
                      "Load More Communities"
                    )}
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Community Stats */}
          {allGroups.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Community Overview</CardTitle>
                <CardDescription>
                  Explore the vibrant ecosystem of communities on Paradigma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-8 sm:grid-cols-3">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-2">
                      {allGroups.length}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                      Active Communities
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-success-50 rounded-full flex items-center justify-center">
                      <Badge className="h-8 w-8 text-success-500 bg-transparent border-0 p-0">
                        <div className="w-full h-full bg-success-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">P</span>
                        </div>
                      </Badge>
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-2">
                      {allGroups.filter(g => g.isPublic).length}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                      Public Communities
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-orange-50 rounded-full flex items-center justify-center">
                      <div className="flex -space-x-1">
                        <div className="w-6 h-6 bg-orange-500 rounded-full border-2 border-white" />
                        <div className="w-6 h-6 bg-primary rounded-full border-2 border-white" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-2">
                      {allGroups.reduce((sum, g) => sum + g._count.members, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                      Total Members
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </SocialLayout>
  );
}