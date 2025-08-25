"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SocialLayout } from "@/components/layout/social-layout";
import { UserAvatar } from "@/components/social";
import {
  Settings,
  UserCheck,
  UserX,
  Crown,
  Trash2,
  ArrowLeft,
  Globe,
  Lock,
} from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";

const updateGroupSchema = z.object({
  name: z.string().min(1, "Group name is required").max(50, "Group name must be 50 characters or less"),
  description: z.string().max(500, "Description must be 500 characters or less").optional(),
  isPublic: z.boolean(),
});

type UpdateGroupForm = z.infer<typeof updateGroupSchema>;

export default function ManageGroupPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const groupId = params?.id as string;

  // Get current user
  const { data: userInfo } = api.user.getUserInfo.useQuery();

  // Fetch group details
  const { data: group, isLoading: isLoadingGroup } = api.groups.getGroup.useQuery({
    id: groupId,
  }, { enabled: !!groupId });

  // Fetch group members
  const { data: membersData, isLoading: isLoadingMembers } = api.groups.getGroupMembers.useQuery({
    groupId,
    limit: 50,
  });

  // Fetch pending requests
  const { data: requestsData, isLoading: isLoadingRequests } = api.groups.getPendingRequests.useQuery({
    groupId,
    limit: 20,
  });

  const utils = api.useUtils();

  const form = useForm<UpdateGroupForm>({
    resolver: zodResolver(updateGroupSchema),
    values: group ? {
      name: group.name,
      description: group.description || "",
      isPublic: group.isPublic,
    } : undefined,
  });

  // Mutations
  const updateGroupMutation = api.groups.updateGroup.useMutation({
    onSuccess: () => {
      toast({
        title: "Group updated",
        description: "Group settings have been updated successfully.",
      });
      utils.groups.getGroup.invalidate({ id: groupId });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update group.",
        variant: "destructive",
      });
    },
  });

  const respondToRequestMutation = api.groups.respondToRequest.useMutation({
    onSuccess: () => {
      toast({
        title: "Request processed",
        description: "The request has been processed successfully.",
      });
      utils.groups.getPendingRequests.invalidate({ groupId });
      utils.groups.getGroupMembers.invalidate({ groupId });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process request.",
        variant: "destructive",
      });
    },
  });

  const deleteGroupMutation = api.groups.deleteGroup.useMutation({
    onSuccess: () => {
      toast({
        title: "Group deleted",
        description: "The group has been deleted successfully.",
      });
      router.push(`/${locale}/groups`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete group.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UpdateGroupForm) => {
    updateGroupMutation.mutate({
      id: groupId,
      ...data,
      description: data.description || undefined,
    });
  };

  const handleApproveRequest = (requestId: string) => {
    respondToRequestMutation.mutate({
      requestId,
      action: "approve",
    });
  };

  const handleRejectRequest = (requestId: string) => {
    respondToRequestMutation.mutate({
      requestId,
      action: "reject",
    });
  };

  const handleDeleteGroup = () => {
    deleteGroupMutation.mutate({ id: groupId });
  };

  const members = membersData?.members ?? [];
  const requests = requestsData?.requests ?? [];

  // Check if user is authorized to manage this group
  const isOwner = userInfo?.id === group?.owner.id;

  if (!isOwner && !isLoadingGroup) {
    return (
      <SocialLayout>
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Access Denied</CardTitle>
              <CardDescription>
                You don't have permission to manage this group.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href={`/${locale}/groups/${groupId}`}>Back to Group</Link>
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
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 rounded bg-muted" />
            <div className="h-96 w-full rounded-lg bg-muted" />
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
                The group you're looking for doesn't exist.
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
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${locale}/groups/${groupId}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Group
          </Link>
          <div className="flex items-center space-x-2">
            <Settings className="h-6 w-6" />
            <h1 className="text-3xl font-bold tracking-tight">Manage Group</h1>
          </div>
          <p className="text-muted-foreground">
            Manage settings, members, and join requests for {group.name}
          </p>
        </div>

        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="members">
              Members ({members.length})
            </TabsTrigger>
            <TabsTrigger value="requests">
              Requests ({requests.length})
            </TabsTrigger>
          </TabsList>

          {/* Group Settings */}
          <TabsContent value="settings" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Group Information</CardTitle>
                <CardDescription>
                  Update your group's basic information and privacy settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Group Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter group name..."
                              {...field}
                              disabled={updateGroupMutation.isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your group..."
                              className="min-h-[100px]"
                              {...field}
                              disabled={updateGroupMutation.isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isPublic"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              {field.value ? "Public Group" : "Private Group"}
                            </FormLabel>
                            <FormDescription className="flex items-center">
                              {field.value ? (
                                <>
                                  <Globe className="mr-1 h-3 w-3" />
                                  Anyone can find and join this group
                                </>
                              ) : (
                                <>
                                  <Lock className="mr-1 h-3 w-3" />
                                  People must request to join this group
                                </>
                              )}
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={updateGroupMutation.isLoading}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={updateGroupMutation.isLoading}>
                      {updateGroupMutation.isLoading ? "Updating..." : "Update Group"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible and destructive actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Group
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Group</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this group? This action cannot be undone.
                        All posts, comments, and members will be permanently removed.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteGroup}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Group
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Group Members</CardTitle>
                <CardDescription>
                  Manage group members and their roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingMembers ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
                        <div className="space-y-1 flex-1">
                          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : members.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No members found.</p>
                ) : (
                  <div className="space-y-4">
                    {members.map((member: typeof members[number]) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <UserAvatar user={member.user} size="md" />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">
                                {member.user.name || "User"}
                              </span>
                              {member.user.id === group.owner.id && (
                                <Crown className="h-4 w-4 text-yellow-500" />
                              )}
                              {member.role !== "MEMBER" && (
                                <Badge variant="outline">
                                  {member.role.toLowerCase()}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {member.user.email}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Joined {new Date(member.joinedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {member.user.id !== group.owner.id && (
                          <div className="flex items-center space-x-2">
                            {/* Role management buttons would go here */}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Join Requests Tab */}
          <TabsContent value="requests" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Join Requests</CardTitle>
                <CardDescription>
                  Review and manage pending join requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingRequests ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
                        <div className="space-y-1 flex-1">
                          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                        </div>
                        <div className="flex space-x-2">
                          <div className="h-8 w-20 animate-pulse rounded bg-muted" />
                          <div className="h-8 w-20 animate-pulse rounded bg-muted" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : requests.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No pending requests.</p>
                ) : (
                  <div className="space-y-4">
                    {requests.map((request: typeof requests[number]) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <UserAvatar user={request.user} size="md" />
                          <div>
                            <span className="font-medium">
                              {request.user.name || "User"}
                            </span>
                            <p className="text-sm text-muted-foreground">
                              {request.user.email}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Requested {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproveRequest(request.id)}
                            disabled={respondToRequestMutation.isLoading}
                          >
                            <UserCheck className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectRequest(request.id)}
                            disabled={respondToRequestMutation.isLoading}
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SocialLayout>
  );
}