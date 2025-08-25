import React, { useCallback } from "react";
import { View, Alert } from "react-native";
import HeaderContainer from "@/components/layouts/_header";
import { Feed, FeedProps } from "@/components/feed";
import { api } from "@/lib/api";

export default function HomeScreen() {
  // Temporary: hardcode strings to fix useTranslation error
  const t = (key: string, fallback: string) => fallback;
  const utils = api.useContext();

  // Like post mutation
  const { mutate: likePost } = api.likes.toggleLike.useMutation({
    onMutate: async ({ postId }) => {
      // Cancel outgoing refetches
      await utils.posts.getFeedPosts.cancel();

      // Snapshot the previous value
      const previousData = utils.posts.getFeedPosts.getInfiniteData();

      // Optimistically update
      utils.posts.getFeedPosts.setInfiniteData(
        { limit: 10 },
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map(page => ({
              ...page,
              posts: page.posts.map(post =>
                post.id === postId
                  ? {
                      ...post,
                      isLiked: !post.isLiked,
                      likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1,
                    }
                  : post
              ),
            })),
          };
        }
      );

      return { previousData };
    },
    onError: (err, newData, context) => {
      // Rollback on error
      if (context?.previousData) {
        utils.posts.getFeedPosts.setInfiniteData({ limit: 10 }, context.previousData);
      }
      Alert.alert(
        t('common.error', 'Error'),
        t('feed.errorLiking', 'Failed to like post. Please try again.'),
        [{ text: t('common.ok', 'OK') }]
      );
    },
    onSettled: () => {
      // Always refetch after error or success
      void utils.posts.getFeedPosts.invalidate();
    },
  });

  const handleLikePost = useCallback((postId: string) => {
    likePost({ postId });
  }, [likePost]);

  const handleCommentPost = useCallback((postId: string) => {
    // TODO: Navigate to post detail/comments screen
    console.log('Navigate to comments for post:', postId);
  }, []);

  return (
    <HeaderContainer variant="secondary" hideBackButton={true} customTitle={t("tab-bar.home", "Home")}>
      <View className="flex-1 bg-white dark:bg-black">
        <Feed 
          onLikePost={handleLikePost}
          onCommentPost={handleCommentPost}
        />
      </View>
    </HeaderContainer>
  );
}