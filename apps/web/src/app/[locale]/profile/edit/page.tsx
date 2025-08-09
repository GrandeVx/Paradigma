"use client";

import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { SocialLayout } from "@/components/layout/social-layout";
import { UserAvatar } from "@/components/social";
import {
  ArrowLeft,
  User,
  Bell,
  Shield,
  Save,
} from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";

const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be 50 characters or less"),
  username: z.string().min(3, "Username must be at least 3 characters").max(30, "Username must be 30 characters or less").optional().or(z.literal("")),
  email: z.string().email("Please enter a valid email address"),
  notifications: z.boolean(),
});

type UpdateProfileForm = z.infer<typeof updateProfileSchema>;

export default function EditProfilePage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  // Get current user
  const { data: userInfo, isLoading: isLoadingUser } = api.user.getUserInfo.useQuery();

  const form = useForm<UpdateProfileForm>({
    resolver: zodResolver(updateProfileSchema),
    values: userInfo ? {
      name: userInfo.name || "",
      username: userInfo.username || "",
      email: userInfo.email,
      notifications: userInfo.notifications,
    } : undefined,
  });

  const utils = api.useUtils();

  // Update user mutation
  const updateUserMutation = api.user.updateProfile.useMutation({
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      utils.user.getUserInfo.invalidate();
      router.push(`/${locale}/profile`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UpdateProfileForm) => {
    updateUserMutation.mutate({
      name: data.name,
      username: data.username || undefined,
      notifications: data.notifications,
    });
  };

  if (isLoadingUser) {
    return (
      <SocialLayout>
        <div className="container max-w-2xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 rounded bg-muted" />
            <div className="h-96 w-full rounded-lg bg-muted" />
          </div>
        </div>
      </SocialLayout>
    );
  }

  if (!userInfo) {
    return (
      <SocialLayout>
        <div className="container max-w-2xl mx-auto px-4 py-8">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Authentication Required</CardTitle>
              <CardDescription>
                Please sign in to edit your profile.
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

  return (
    <SocialLayout>
      <div className="container max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${locale}/profile`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>
          <p className="text-muted-foreground">
            Update your profile information and preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your basic profile information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Current Avatar Display */}
              <div className="flex items-center space-x-4 mb-6">
                <UserAvatar user={userInfo} size="xl" />
                <div>
                  <p className="font-medium">Profile Picture</p>
                  <p className="text-sm text-muted-foreground">
                    Avatar is generated from your name initials
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Custom profile pictures coming soon
                  </p>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your name..."
                            {...field}
                            disabled={updateUserMutation.isLoading}
                          />
                        </FormControl>
                        <FormDescription>
                          This is the name that will be displayed to other users
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter a username..."
                            {...field}
                            disabled={updateUserMutation.isLoading}
                          />
                        </FormControl>
                        <FormDescription>
                          A unique username that others can use to find you
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your email..."
                            {...field}
                            disabled={true}
                          />
                        </FormControl>
                        <FormDescription>
                          Your email address for account notifications and login. This field is read-only.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={updateUserMutation.isLoading}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={updateUserMutation.isLoading}>
                      <Save className="mr-2 h-4 w-4" />
                      {updateUserMutation.isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Manage how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <FormField
                  control={form.control}
                  name="notifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Email Notifications
                        </FormLabel>
                        <FormDescription>
                          Receive email notifications for posts, comments, and group activity
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={updateUserMutation.isLoading}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </Form>
            </CardContent>
          </Card>

          {/* Account Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Account Security
              </CardTitle>
              <CardDescription>
                Manage your account security settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Password</p>
                    <p className="text-sm text-muted-foreground">
                      Last updated {new Date(userInfo.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Change Password
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Enable 2FA
                  </Button>
                </div>
              </div>

              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 inline mr-1" />
                  Advanced security features are coming soon. Your account is currently protected
                  by BetterAuth's secure authentication system.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Read-only information about your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Created:</span>
                  <span>{new Date(userInfo.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span>{new Date(userInfo.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account ID:</span>
                  <span className="font-mono text-xs">{userInfo.id}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SocialLayout>
  );
}