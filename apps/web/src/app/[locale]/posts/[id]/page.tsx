"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { SocialLayout } from "@/components/layout/social-layout";
import { PostCard, CommentCard } from "@/components/social";
import { ArrowLeft, MessageCircle, Send } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";

export default function PostDetailPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const postId = params?.id as string;

  const [newCommentContent, setNewCommentContent] = useState("");

  // Get current user
  const { data: userInfo } = api.user.getUserInfo.useQuery();

  // Fetch post details
  const { data: post, isLoading: isLoadingPost, error: postError } = api.posts.getPost.useQuery({
    id: postId,
  });

  // Fetch comments
  const { data: commentsData, isLoading: isLoadingComments } = api.comments.getPostComments.useQuery({
    postId,
    limit: 50,
  });

  const utils = api.useUtils();

  // Add comment mutation
  const addCommentMutation = api.comments.createComment.useMutation({
    onSuccess: () => {
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully.",
      });
      setNewCommentContent("");
      utils.comments.getPostComments.invalidate({ postId });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add comment.",
        variant: "destructive",
      });
    },
  });

  const handleAddComment = () => {
    if (!userInfo) {
      toast({
        title: "Authentication required",
        description: "Please sign in to comment on posts.",
        variant: "destructive",
      });
      return;
    }

    if (!newCommentContent.trim()) {
      toast({
        title: "Content required",
        description: "Please enter a comment.",
        variant: "destructive",
      });
      return;
    }

    addCommentMutation.mutate({
      postId,
      content: newCommentContent.trim(),
    });
  };

  const comments = commentsData?.comments || [];
  
  // Organize comments into a tree structure
  interface CommentFromAPI {
    id: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    parentId: string | null;
    author: {
      id: string;
      name: string | null;
      image: string | null;
      email: string;
    };
  }
  
  interface CommentWithReplies extends CommentFromAPI {
    post: {
      id: string;
    };
    replies: CommentWithReplies[];
  }
  
  const organizeComments = (comments: CommentFromAPI[]) => {
    const commentMap = new Map<string, CommentWithReplies>();
    const rootComments: CommentWithReplies[] = [];

    // First pass: create a map of all comments
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, post: { id: postId }, replies: [] });
    });

    // Second pass: organize into tree structure
    comments.forEach(comment => {
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        const childComment = commentMap.get(comment.id);
        if (parent && childComment) {
          parent.replies.push(childComment);
        }
      } else {
        const childComment = commentMap.get(comment.id);
        if (childComment) {
          rootComments.push(childComment);
        }
      }
    });

    return rootComments;
  };

  const organizedComments = organizeComments(comments);

  if (postError) {
    return (
      <SocialLayout>
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Error Loading Post</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {postError.message || "Failed to load post. Please try again."}
              </p>
              <Button asChild variant="outline">
                <Link href={`/${locale}/posts`}>Back to Posts</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </SocialLayout>
    );
  }

  if (isLoadingPost) {
    return (
      <SocialLayout>
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 rounded bg-muted" />
            <div className="h-48 w-full rounded-lg bg-muted" />
            <div className="h-32 w-full rounded-lg bg-muted" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 w-full rounded-lg bg-muted ml-8" />
            ))}
          </div>
        </div>
      </SocialLayout>
    );
  }

  if (!post) {
    return (
      <SocialLayout>
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Post Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                The post you're looking for doesn't exist or you don't have permission to view it.
              </p>
              <Button asChild>
                <Link href={`/${locale}/posts`}>Browse Posts</Link>
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
            href={`/${locale}/posts`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Posts
          </Link>
        </div>

        {/* Post */}
        <div className="mb-8">
          <PostCard
            post={post}
            currentUserId={userInfo?.id}
            showGroupName={true}
          />
        </div>

        {/* Comments Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="mr-2 h-5 w-5" />
              Comments ({comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add Comment Form */}
            {userInfo && (
              <div className="space-y-4 border-b pb-6">
                <h3 className="font-semibold">Add a comment</h3>
                <Textarea
                  placeholder="Share your thoughts..."
                  value={newCommentContent}
                  onChange={(e) => setNewCommentContent(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {newCommentContent.length}/1000 characters
                  </span>
                  <Button
                    onClick={handleAddComment}
                    disabled={addCommentMutation.isLoading || !newCommentContent.trim()}
                    size="sm"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {addCommentMutation.isLoading ? "Posting..." : "Post Comment"}
                  </Button>
                </div>
              </div>
            )}

            {/* Comments List */}
            {isLoadingComments ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-start space-x-3">
                      <div className="h-8 w-8 rounded-full bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="h-4 w-24 rounded bg-muted" />
                          <div className="h-3 w-16 rounded bg-muted" />
                        </div>
                        <div className="space-y-1">
                          <div className="h-4 w-full rounded bg-muted" />
                          <div className="h-4 w-3/4 rounded bg-muted" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : organizedComments.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No comments yet</h3>
                <p className="text-muted-foreground">
                  {userInfo 
                    ? "Be the first to share your thoughts on this post!"
                    : "Sign in to be the first to comment on this post."}
                </p>
              </div>
            ) : (
              <div className="space-y-0">
                {organizedComments.map((comment) => (
                  <CommentCard
                    key={comment.id}
                    comment={comment}
                    currentUserId={userInfo?.id}
                    postId={postId}
                    depth={0}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Related Posts */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">More from {post.group.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href={`/${locale}/groups/${post.group.id}`}>
                View Group
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </SocialLayout>
  );
}