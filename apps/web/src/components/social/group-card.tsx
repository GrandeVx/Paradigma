"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "./user-avatar";
import { Users, Lock, Globe, MessageCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/trpc/react";
import { toast } from "@/components/ui/use-toast";

interface Group {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  isPublic: boolean;
  createdAt: Date;
  owner: {
    id: string;
    name: string | null;
    image: string | null;
    email: string;
  };
  memberCount: number;
  postCount: number;
}

interface GroupCardProps {
  group: Group;
  currentUserId?: string;
  showJoinButton?: boolean;
}

export function GroupCard({ group, currentUserId, showJoinButton = true }: GroupCardProps) {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  
  const utils = api.useUtils();
  const joinGroupMutation = api.groups.requestJoin.useMutation({
    onSuccess: () => {
      toast({
        title: "Join request sent",
        description: "Your request to join the group has been sent to the group administrators.",
      });
      // Invalidate and refetch groups list
      utils.groups.listGroups.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send join request.",
        variant: "destructive",
      });
    },
  });

  const handleJoinGroup = () => {
    if (!currentUserId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to join groups.",
        variant: "destructive",
      });
      return;
    }

    joinGroupMutation.mutate({ groupId: group.id });
  };

  const isOwner = currentUserId === group.owner.id;

  return (
    <Card className="group h-full transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
              {group.image ? (
                <img 
                  src={group.image} 
                  alt={group.name} 
                  className="h-full w-full object-cover transition-transform group-hover:scale-105" 
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold text-foreground truncate mb-2">
                {group.name}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <UserAvatar user={group.owner} size="sm" />
                <span className="text-sm text-muted-foreground truncate">
                  by {group.owner.name || "User"}
                </span>
              </div>
            </div>
          </div>
          
          <Badge 
            variant={group.isPublic ? "secondary" : "outline"} 
            className="text-xs font-medium shrink-0 ml-3"
          >
            {group.isPublic ? (
              <>
                <Globe className="mr-1.5 h-3 w-3" />
                Public
              </>
            ) : (
              <>
                <Lock className="mr-1.5 h-3 w-3" />
                Private
              </>
            )}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-6">
        <CardDescription className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4">
          {group.description || "No description provided for this community."}
        </CardDescription>
        
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-primary/10 rounded-full">
              <Users className="h-3 w-3 text-primary" />
            </div>
            <span className="font-medium">
              {group.memberCount} {group.memberCount === 1 ? "member" : "members"}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-success-50 rounded-full">
              <MessageCircle className="h-3 w-3 text-success-500" />
            </div>
            <span className="font-medium">
              {group.postCount} {group.postCount === 1 ? "post" : "posts"}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 flex items-center justify-between gap-3">
        <Button 
          asChild 
          variant="outline" 
          size="sm" 
          className="flex-1 h-9 text-sm font-medium transition-all duration-200"
        >
          <Link href={`/${locale}/groups/${group.id}`}>
            View Details
          </Link>
        </Button>
        
        {showJoinButton && !isOwner && (
          <Button
            size="sm"
            onClick={handleJoinGroup}
            disabled={joinGroupMutation.isLoading}
            className="flex-1 h-9 text-sm font-medium"
          >
            {joinGroupMutation.isLoading ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Joining...
              </>
            ) : (
              "Join Group"
            )}
          </Button>
        )}
        
        {isOwner && (
          <Button asChild variant="outline" size="sm" className="flex-1 h-9 text-sm font-medium">
            <Link href={`/${locale}/groups/${group.id}/manage`}>
              Manage
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}