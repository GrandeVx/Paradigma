"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "./user-avatar";
import { MessageCircle, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/trpc/react";
import { toast } from "@/components/ui/use-toast";

interface Comment {
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
  post: {
    id: string;
  };
  replies?: Comment[];
}

interface CommentCardProps {
  comment: Comment;
  currentUserId?: string;
  postId: string;
  depth?: number;
}

export function CommentCard({ comment, currentUserId, postId, depth = 0 }: CommentCardProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const utils = api.useUtils();

  const addReplyMutation = api.comments.createComment.useMutation({
    onSuccess: () => {
      toast({
        title: "Reply added",
        description: "Your reply has been posted successfully.",
      });
      setReplyContent("");
      setIsReplying(false);
      utils.comments.getPostComments.invalidate({ postId });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to post reply.",
        variant: "destructive",
      });
    },
  });

  const updateCommentMutation = api.comments.updateComment.useMutation({
    onSuccess: () => {
      toast({
        title: "Comment updated",
        description: "Your comment has been updated successfully.",
      });
      setIsEditing(false);
      utils.comments.getPostComments.invalidate({ postId });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update comment.",
        variant: "destructive",
      });
    },
  });

  const deleteCommentMutation = api.comments.deleteComment.useMutation({
    onSuccess: () => {
      toast({
        title: "Comment deleted",
        description: "Your comment has been deleted successfully.",
      });
      utils.comments.getPostComments.invalidate({ postId });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete comment.",
        variant: "destructive",
      });
    },
  });

  const handleReply = () => {
    if (!currentUserId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to reply to comments.",
        variant: "destructive",
      });
      return;
    }

    if (!replyContent.trim()) {
      toast({
        title: "Content required",
        description: "Please enter a reply.",
        variant: "destructive",
      });
      return;
    }

    addReplyMutation.mutate({
      postId,
      content: replyContent.trim(),
      parentId: comment.id,
    });
  };

  const handleUpdate = () => {
    if (!editContent.trim()) {
      toast({
        title: "Content required",
        description: "Comment content cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    updateCommentMutation.mutate({
      id: comment.id,
      content: editContent.trim(),
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this comment?")) {
      deleteCommentMutation.mutate({ id: comment.id });
    }
  };

  const isOwner = currentUserId === comment.author.id;
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(comment.createdAt));

  const maxDepth = 3; // Limit nesting depth

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l pl-4' : ''}`}>
      <Card className="w-full mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <UserAvatar user={comment.author} size="sm" />
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-sm">
                    {comment.author.name || "User"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formattedDate}
                  </span>
                  {comment.updatedAt > comment.createdAt && (
                    <span className="text-xs text-muted-foreground italic">
                      (edited)
                    </span>
                  )}
                </div>
              </div>
            </div>
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    Edit Comment
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={handleDelete}
                    disabled={deleteCommentMutation.isLoading}
                  >
                    {deleteCommentMutation.isLoading ? "Deleting..." : "Delete Comment"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Update your comment..."
                className="min-h-[80px]"
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleUpdate}
                  disabled={updateCommentMutation.isLoading}
                >
                  {updateCommentMutation.isLoading ? "Updating..." : "Update"}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          )}
        </CardContent>

        {!isEditing && (
          <CardFooter className="pt-0">
            <div className="flex items-center space-x-4">
              {depth < maxDepth && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => setIsReplying(!isReplying)}
                >
                  <MessageCircle className="h-3 w-3 mr-1" />
                  <span className="text-xs">Reply</span>
                </Button>
              )}
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Reply form */}
      {isReplying && (
        <div className="ml-8 mb-4 space-y-3">
          <Textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
            className="min-h-[80px]"
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsReplying(false);
                setReplyContent("");
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleReply}
              disabled={addReplyMutation.isLoading || !replyContent.trim()}
            >
              {addReplyMutation.isLoading ? "Posting..." : "Reply"}
            </Button>
          </div>
        </div>
      )}

      {/* Nested replies */}
      {comment.replies && comment.replies.map((reply) => (
        <CommentCard
          key={reply.id}
          comment={reply}
          currentUserId={currentUserId}
          postId={postId}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}