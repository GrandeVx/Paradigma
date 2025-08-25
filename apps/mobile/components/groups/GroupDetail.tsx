import React, { useState, useCallback } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { GroupHeader } from './GroupHeader';
import { GroupTabs } from './GroupTabs';
import { MembersList } from './MembersList';
import { Feed } from '@/components/feed';
import { Text } from '@/components/ui/text';
import { api } from '@/lib/api';
import { TRPCClientError } from '@trpc/client';
import { useTranslation } from 'react-i18next';
import { GroupAction } from './types';

interface GroupDetailProps {
  groupId: string;
}

export function GroupDetail({ groupId }: GroupDetailProps) {
  const { t } = useTranslation();
  const utils = api.useUtils();
  const [activeTab, setActiveTab] = useState<'posts' | 'members' | 'requests'>('posts');
  const [isLoading, setIsLoading] = useState(false);

  // Get current user info for permissions
  const { data: userInfo } = api.user.getUserInfo.useQuery();

  // Get group details
  const {
    data: group,
    isLoading: groupLoading,
    error: groupError,
    refetch: refetchGroup
  } = api.groups.getGroup.useQuery({ id: groupId }, { enabled: !!groupId });

  // Get group members (only when members tab is active)
  const {
    data: membersData,
    isLoading: membersLoading,
    fetchNextPage: fetchNextMembers,
    hasNextPage: hasNextMembersPage,
    isFetchingNextPage: isFetchingNextMembers
  } = api.groups.getGroupMembers.useInfiniteQuery(
    { groupId, limit: 20 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: activeTab === 'members' && !!group,
    }
  );

  // Get pending requests (only for admins/owners when requests tab is active)
  const {
    data: requestsData,
    isLoading: requestsLoading,
    fetchNextPage: fetchNextRequests,
    hasNextPage: hasNextRequestsPage,
    isFetchingNextPage: isFetchingNextRequests
  } = api.groups.getPendingRequests.useInfiniteQuery(
    { groupId, limit: 20 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: activeTab === 'requests' && !!group && (
        group.ownerId === userInfo?.id ||
        group.userMembership?.role === 'admin' ||
        group.userMembership?.role === 'moderator'
      ),
    }
  );

  // Check if user can see requests tab
  const canSeeRequests = group && (
    group.ownerId === userInfo?.id ||
    group.userMembership?.role === 'admin' ||
    group.userMembership?.role === 'moderator'
  );

  // Join/Request to join mutation
  const joinGroupMutation = api.groups.requestJoin.useMutation({
    onMutate: async () => {
      setIsLoading(true);
      await utils.groups.getGroup.cancel({ id: groupId });
      const previousData = utils.groups.getGroup.getData({ id: groupId });

      // Optimistically update group data
      utils.groups.getGroup.setData({ id: groupId }, (old) => {
        if (!old) return old;

        if (old.isPublic) {
          return {
            ...old,
            memberCount: old.memberCount + 1,
            userMembership: {
              role: 'member' as const,
              joinedAt: new Date().toISOString(),
            },
            userJoinRequest: null,
          };
        } else {
          return {
            ...old,
            userJoinRequest: {
              id: 'temp-id',
              status: 'PENDING' as const,
              createdAt: new Date().toISOString(),
            },
          };
        }
      });

      return { previousData };
    },
    onError: (error, _, context) => {
      setIsLoading(false);

      if (context?.previousData) {
        utils.groups.getGroup.setData({ id: groupId }, context.previousData);
      }

      let errorTitle = 'Error';
      let errorMessage = 'Failed to join group. Please try again.';

      if (error instanceof TRPCClientError) {
        switch (error.data?.code) {
          case 'UNAUTHORIZED':
            errorTitle = 'Authentication Required';
            errorMessage = 'Please sign in to join groups.';
            break;
          case 'FORBIDDEN':
            errorTitle = 'Access Denied';
            errorMessage = 'You do not have permission to join this group.';
            break;
          case 'CONFLICT':
            errorTitle = 'Already a Member';
            errorMessage = error.message || 'You are already a member of this group.';
            break;
          case 'NOT_FOUND':
            errorTitle = 'Group Not Found';
            errorMessage = 'This group no longer exists or has been removed.';
            break;
          default:
            errorMessage = error.message || errorMessage;
        }
      }

      Alert.alert(errorTitle, errorMessage);
    },
    onSuccess: (data) => {
      setIsLoading(false);
      if (data.joined) {
        Alert.alert('Success', 'Successfully joined the group!');
      } else {
        Alert.alert('Request Sent', 'Your join request has been sent to the group admins.');
      }
    },
    onSettled: () => {
      setIsLoading(false);
      utils.groups.getGroup.invalidate({ id: groupId });
      utils.groups.listGroups.invalidate();
    },
  });

  // Leave group mutation
  const leaveGroupMutation = api.groups.leaveGroup.useMutation({
    onMutate: async () => {
      setIsLoading(true);
      await utils.groups.getGroup.cancel({ id: groupId });
      const previousData = utils.groups.getGroup.getData({ id: groupId });

      utils.groups.getGroup.setData({ id: groupId }, (old) => {
        if (!old) return old;
        return {
          ...old,
          memberCount: Math.max(0, old.memberCount - 1),
          userMembership: null,
          userJoinRequest: null,
        };
      });

      return { previousData };
    },
    onError: (error, _, context) => {
      setIsLoading(false);

      if (context?.previousData) {
        utils.groups.getGroup.setData({ id: groupId }, context.previousData);
      }

      let errorTitle = 'Error';
      let errorMessage = 'Failed to leave group. Please try again.';

      if (error instanceof TRPCClientError) {
        switch (error.data?.code) {
          case 'FORBIDDEN':
            errorTitle = 'Cannot Leave Group';
            errorMessage = error.message || 'Group owners cannot leave their own group.';
            break;
          case 'NOT_FOUND':
            errorTitle = 'Not a Member';
            errorMessage = 'You are not a member of this group.';
            break;
          default:
            errorMessage = error.message || errorMessage;
        }
      }

      Alert.alert(errorTitle, errorMessage);
    },
    onSuccess: () => {
      setIsLoading(false);
      Alert.alert('Success', 'Successfully left the group.');
    },
    onSettled: () => {
      setIsLoading(false);
      utils.groups.getGroup.invalidate({ id: groupId });
      utils.groups.listGroups.invalidate();
    },
  });

  // Cancel join request mutation
  const cancelRequestMutation = api.groups.cancelRequest.useMutation({
    onMutate: async ({ requestId }) => {
      setIsLoading(true);
      await utils.groups.getGroup.cancel({ id: groupId });
      const previousData = utils.groups.getGroup.getData({ id: groupId });

      utils.groups.getGroup.setData({ id: groupId }, (old) => {
        if (!old) return old;
        return {
          ...old,
          userJoinRequest: null,
        };
      });

      return { previousData };
    },
    onError: (error, _, context) => {
      setIsLoading(false);

      if (context?.previousData) {
        utils.groups.getGroup.setData({ id: groupId }, context.previousData);
      }

      Alert.alert('Error', 'Failed to cancel request. Please try again.');
    },
    onSuccess: () => {
      setIsLoading(false);
      Alert.alert('Request Cancelled', 'Your join request has been cancelled.');
    },
    onSettled: () => {
      setIsLoading(false);
      utils.groups.getGroup.invalidate({ id: groupId });
      utils.groups.listGroups.invalidate();
    },
  });

  const handleGroupAction = useCallback((action: GroupAction) => {
    if (isLoading || !group) return;

    switch (action) {
      case 'join':
      case 'request':
        joinGroupMutation.mutate({ groupId });
        break;
      case 'leave':
        Alert.alert(
          'Leave Group',
          'Are you sure you want to leave this group?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Leave',
              style: 'destructive',
              onPress: () => leaveGroupMutation.mutate({ groupId })
            }
          ]
        );
        break;
      case 'cancel-request':
        if (group.userJoinRequest?.id) {
          Alert.alert(
            'Cancel Request',
            'Are you sure you want to cancel your join request?',
            [
              { text: 'No', style: 'cancel' },
              {
                text: 'Cancel Request',
                style: 'destructive',
                onPress: () => cancelRequestMutation.mutate({ requestId: group.userJoinRequest!.id })
              }
            ]
          );
        }
        break;
    }
  }, [group, isLoading, joinGroupMutation, leaveGroupMutation, cancelRequestMutation, groupId]);

  // Handle like post in group posts
  const { mutate: likePost } = api.likes.toggleLike.useMutation({
    onMutate: async ({ postId }) => {
      await utils.posts.getGroupPosts.cancel();
      const previousData = utils.posts.getGroupPosts.getInfiniteData({ groupId, limit: 10 });

      utils.posts.getGroupPosts.setInfiniteData(
        { groupId, limit: 10 },
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
      if (context?.previousData) {
        utils.posts.getGroupPosts.setInfiniteData({ groupId, limit: 10 }, context.previousData);
      }
      Alert.alert('Error', 'Failed to like post. Please try again.');
    },
    onSettled: () => {
      utils.posts.getGroupPosts.invalidate({ groupId });
    },
  });

  const handleLikePost = useCallback((postId: string) => {
    likePost({ postId });
  }, [likePost]);

  const handleCommentPost = useCallback((postId: string) => {
    // TODO: Navigate to post detail/comments screen
    console.log('Navigate to comments for post:', postId);
  }, []);

  if (groupLoading) {
    return (
      <View className="flex-1 bg-white dark:bg-black items-center justify-center">
        <Text className="text-gray-500">Loading group...</Text>
      </View>
    );
  }

  if (groupError || !group) {
    return (
      <View className="flex-1 bg-white dark:bg-black items-center justify-center px-4">
        <Text className="text-lg font-bold text-black dark:text-white mb-2">Group Not Found</Text>
        <Text className="text-gray-500 text-center">
          This group doesn't exist or you don't have permission to view it.
        </Text>
      </View>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'posts':
        return (
          <Feed
            feedType="group"
            groupId={groupId}
            onLikePost={handleLikePost}
            onCommentPost={handleCommentPost}
          />
        );
      case 'members':
        return (
          <MembersList
            membersData={membersData}
            isLoading={membersLoading}
            onLoadMore={fetchNextMembers}
            hasNextPage={hasNextMembersPage}
            isFetchingNextPage={isFetchingNextMembers}
            currentUserId={userInfo?.id}
          />
        );
      case 'requests':
        if (!canSeeRequests) {
          return (
            <View className="flex-1 items-center justify-center px-4">
              <Text className="text-gray-500 text-center">
                You don't have permission to view pending requests.
              </Text>
            </View>
          );
        }
        return (
          <View className="flex-1 p-4">
            <Text className="text-lg font-bold text-black dark:text-white mb-4">
              Pending Requests
            </Text>
            {requestsLoading ? (
              <Text className="text-gray-500">Loading requests...</Text>
            ) : (
              <Text className="text-gray-500">
                {requestsData?.pages[0]?.requests.length || 0} pending requests
              </Text>
            )}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View className="flex-1">
      <GroupHeader
        group={group}
        currentUserId={userInfo?.id}
        onAction={handleGroupAction}
        isLoading={isLoading}
      />

      <GroupTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        showRequests={canSeeRequests || false}
        group={group}
      />

      <View className="flex-1">
        {renderTabContent()}
      </View>
    </View>
  );
}