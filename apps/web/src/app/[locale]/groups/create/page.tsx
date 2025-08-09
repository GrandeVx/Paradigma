"use client";

import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { ArrowLeft, Users, Globe, Lock } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";

const createGroupSchema = z.object({
  name: z.string().min(1, "Group name is required").max(50, "Group name must be 50 characters or less"),
  description: z.string().max(500, "Description must be 500 characters or less").optional(),
  isPublic: z.boolean().default(true),
});

type CreateGroupForm = z.infer<typeof createGroupSchema>;

export default function CreateGroupPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  const form = useForm<CreateGroupForm>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
      description: "",
      isPublic: true,
    },
  });

  const createGroupMutation = api.groups.createGroup.useMutation({
    onSuccess: (group) => {
      toast({
        title: "Group created",
        description: `${group.name} has been created successfully.`,
      });
      router.push(`/${locale}/groups/${group.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create group.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateGroupForm) => {
    createGroupMutation.mutate({
      name: data.name,
      description: data.description || undefined,
      isPublic: data.isPublic,
    });
  };

  return (
    <SocialLayout>
      <div className="container max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${locale}/groups`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Groups
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Create New Group</h1>
          <p className="text-muted-foreground">
            Start a new community and bring people together around shared interests
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Group Information
            </CardTitle>
            <CardDescription>
              Provide basic information about your group to help others discover it
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
                          disabled={createGroupMutation.isLoading}
                        />
                      </FormControl>
                      <FormDescription>
                        Choose a clear, descriptive name for your group
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe what your group is about..."
                          className="min-h-[100px]"
                          {...field}
                          disabled={createGroupMutation.isLoading}
                        />
                      </FormControl>
                      <FormDescription>
                        Help others understand what your group is about and what they can expect
                      </FormDescription>
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
                          disabled={createGroupMutation.isLoading}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={createGroupMutation.isLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createGroupMutation.isLoading}>
                    {createGroupMutation.isLoading ? "Creating..." : "Create Group"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Guidelines */}
        <Card className="mt-8 border-muted">
          <CardHeader>
            <CardTitle className="text-lg">Community Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Keep your group name clear and appropriate</li>
              <li>• Provide a helpful description to attract the right members</li>
              <li>• Consider starting with a public group to grow your community</li>
              <li>• You can always change these settings later in group management</li>
              <li>• Be respectful and create a welcoming environment for all members</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </SocialLayout>
  );
}