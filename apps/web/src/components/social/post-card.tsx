"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "./user-avatar";
import { Heart, MessageCircle, Share, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/trpc/react";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";

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

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  showGroupName?: boolean;
}

export function PostCard({ post, currentUserId, showGroupName = true }: PostCardProps) {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post._count?.likes || 0);
  
  const utils = api.useUtils();
  
  // Check if current user has liked this post
  api.likes.getLikeStatus.useQuery(
    { postId: post.id },
    { 
      enabled: !!currentUserId,
      onSuccess: (data) => {
        setIsLiked(!!data?.isLiked);
      }
    }
  );

  const toggleLikeMutation = api.likes.toggleLike.useMutation({
    onMutate: () => {
      // Optimistic update
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    },
    onError: (error) => {
      // Revert optimistic update on error
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
      toast({
        title: "Error",
        description: error.message || "Failed to update like.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      // Invalidate relevant queries
      utils.likes.getLikeStatus.invalidate({ postId: post.id });
    },
  });

  const deletePostMutation = api.posts.deletePost.useMutation({
    onSuccess: () => {
      toast({
        title: "Post deleted",
        description: "Your post has been deleted successfully.",
      });
      // Invalidate posts list
      utils.posts.getGroupPosts.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete post.",
        variant: "destructive",
      });
    },
  });

  const handleLike = () => {
    if (!currentUserId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like posts.",
        variant: "destructive",
      });
      return;
    }

    toggleLikeMutation.mutate({ postId: post.id });
  };

  const handleDeletePost = () => {
    if (confirm("Are you sure you want to delete this post?")) {
      deletePostMutation.mutate({ id: post.id });
    }
  };

  const isOwner = currentUserId === post.author.id;
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(post.createdAt));

  return (
    <Card className="w-full transition-all duration-200 hover:shadow-md hover:shadow-primary/5 border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <UserAvatar user={post.author} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-semibold text-sm text-foreground truncate">
                  {post.author.name || "User"}
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  {formattedDate}
                </span>
              </div>
              {showGroupName && (
                <Link href={`/${locale}/groups/${post.group.id}`} className="inline-block">
                  <Badge 
                    variant="secondary" 
                    className="text-xs font-medium hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    in {post.group.name}
                  </Badge>
                </Link>
              )}
            </div>
          </div>
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/posts/${post.id}/edit`}>
                    Edit Post
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={handleDeletePost}
                  disabled={deletePostMutation.isLoading}
                >
                  {deletePostMutation.isLoading ? "Deleting..." : "Delete Post"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-6">
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">
          {post.content}
        </p>
      </CardContent>

      <CardFooter className="pt-0 border-t">
        <div className="flex items-center justify-between w-full pt-3">
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className={`h-9 px-3 transition-all duration-200 ${
                isLiked 
                  ? 'text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100' 
                  : 'text-muted-foreground hover:text-red-500 hover:bg-red-50'
              }`}
              onClick={handleLike}
              disabled={toggleLikeMutation.isLoading}
            >
              <Heart className={`h-4 w-4 mr-2 transition-all ${isLiked ? 'fill-current scale-110' : ''}`} />
              <span className="text-sm font-medium">{likeCount}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-9 px-3 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200" 
              asChild
            >
              <Link href={`/${locale}/posts/${post.id}`}>
                <MessageCircle className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">{post._count?.comments || 0}</span>
              </Link>
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-9 px-3 text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
          >
            <Share className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}