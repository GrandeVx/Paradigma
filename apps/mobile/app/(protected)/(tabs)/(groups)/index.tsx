import React, { useCallback } from "react";
import { View, Alert } from "react-native";
import { useRouter } from "expo-router";
import HeaderContainer from "@/components/layouts/_header";
import { GroupsList } from "@/components/groups";
import { GroupAction } from "@/components/groups/types";
import { api } from "@/lib/api";
import { useTranslation } from "react-i18next";
import { TRPCClientError } from "@trpc/client";

export default function GroupsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const utils = api.useUtils();
  const [loadingGroups, setLoadingGroups] = React.useState<Record<string, boolean>>({});
  
  // Get current user info for membership checking
  const { data: userInfo } = api.user.getUserInfo.useQuery();

  // Helper to set loading state
  const setLoadingState = React.useCallback((groupId: string, isLoading: boolean) => {
    setLoadingGroups(prev => ({
      ...prev,
      [groupId]: isLoading
    }));
  }, []);

  // Helper to clear loading state
  const clearLoadingState = React.useCallback((groupId: string) => {
    setLoadingGroups(prev => {
      const newState = { ...prev };
      delete newState[groupId];
      return newState;
    });
  }, []);

  // Join/Request to join mutations
  const joinGroupMutation = api.groups.requestJoin.useMutation({
    onMutate: async ({ groupId }) => {
      // Cancel any outgoing refetches
      await utils.groups.listGroups.cancel();

      // Snapshot the previous value
      const previousData = utils.groups.listGroups.getInfiniteData();

      // Optimistically update the cache
      utils.groups.listGroups.setInfiniteData(
        { limit: 20, onlyPublic: false },
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map(page => ({
              ...page,
              groups: page.groups.map(group => {
                if (group.id === groupId) {
                  if (group.isPublic) {
                    // For public groups, mark as member immediately
                    return {
                      ...group,
                      memberCount: group.memberCount + 1,
                      userMembership: {
                        role: 'member' as const,
                        joinedAt: new Date().toISOString(),
                      },
                    };
                  } else {
                    // For private groups, mark as requested
                    return {
                      ...group,
                      userJoinRequest: {
                        id: 'temp-id',
                        status: 'PENDING' as const,
                        createdAt: new Date().toISOString(),
                      },
                    };
                  }
                }
                return group;
              }),
            })),
          };
        }
      );

      return { previousData };
    },
    onError: (error, { groupId }, context) => {
      // Clear loading state
      clearLoadingState(groupId);

      // Revert optimistic update on error
      if (context?.previousData) {
        utils.groups.listGroups.setInfiniteData(
          { limit: 20, onlyPublic: false },
          context.previousData
        );
      }

      // Show error message with specific handling for different error codes
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
          case 'TOO_MANY_REQUESTS':
            errorTitle = 'Rate Limited';
            errorMessage = 'Please wait before trying again.';
            break;
          default:
            errorMessage = error.message || errorMessage;
        }
      }
      
      Alert.alert(errorTitle, errorMessage);
    },
    onSuccess: (data, { groupId }) => {
      // Clear loading state
      clearLoadingState(groupId);

      // Show success message
      if (data.joined) {
        Alert.alert('Success', 'Successfully joined the group!');
      } else {
        Alert.alert('Request Sent', 'Your join request has been sent to the group admins.');
      }
    },
    onSettled: (data, error, { groupId }) => {
      // Clear loading state
      clearLoadingState(groupId);

      // Invalidate and refetch
      utils.groups.listGroups.invalidate();
    },
  });

  // Leave group mutation
  const leaveGroupMutation = api.groups.leaveGroup.useMutation({
    onMutate: async ({ groupId }) => {
      // Cancel any outgoing refetches
      await utils.groups.listGroups.cancel();

      // Snapshot the previous value
      const previousData = utils.groups.listGroups.getInfiniteData();

      // Optimistically update the cache
      utils.groups.listGroups.setInfiniteData(
        { limit: 20, onlyPublic: false },
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map(page => ({
              ...page,
              groups: page.groups.map(group => {
                if (group.id === groupId) {
                  return {
                    ...group,
                    memberCount: Math.max(0, group.memberCount - 1),
                    userMembership: null,
                    userJoinRequest: null,
                  };
                }
                return group;
              }),
            })),
          };
        }
      );

      return { previousData };
    },
    onError: (error, { groupId }, context) => {
      // Clear loading state
      clearLoadingState(groupId);

      // Revert optimistic update on error
      if (context?.previousData) {
        utils.groups.listGroups.setInfiniteData(
          { limit: 20, onlyPublic: false },
          context.previousData
        );
      }

      // Show error message with specific handling for different error codes
      let errorTitle = 'Error';
      let errorMessage = 'Failed to leave group. Please try again.';
      
      if (error instanceof TRPCClientError) {
        switch (error.data?.code) {
          case 'UNAUTHORIZED':
            errorTitle = 'Authentication Required';
            errorMessage = 'Please sign in to manage your group memberships.';
            break;
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
    onSuccess: (data, { groupId }) => {
      // Clear loading state
      clearLoadingState(groupId);
      Alert.alert('Success', 'Successfully left the group.');
    },
    onSettled: (data, error, { groupId }) => {
      // Clear loading state
      clearLoadingState(groupId);

      // Invalidate and refetch
      utils.groups.listGroups.invalidate();
    },
  });

  // Cancel join request mutation
  const cancelRequestMutation = api.groups.cancelRequest.useMutation({
    onMutate: async ({ requestId }) => {
      // Find the group ID first
      const currentData = utils.groups.listGroups.getInfiniteData({ limit: 20, onlyPublic: false });
      let targetGroupId = '';

      currentData?.pages.forEach(page => {
        page.groups.forEach(group => {
          if (group.userJoinRequest?.id === requestId) {
            targetGroupId = group.id;
          }
        });
      });

      if (!targetGroupId) return;

      // Cancel any outgoing refetches
      await utils.groups.listGroups.cancel();

      // Snapshot the previous value
      const previousData = utils.groups.listGroups.getInfiniteData();

      // Optimistically update the cache
      utils.groups.listGroups.setInfiniteData(
        { limit: 20, onlyPublic: false },
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map(page => ({
              ...page,
              groups: page.groups.map(group => {
                if (group.id === targetGroupId) {
                  return {
                    ...group,
                    userJoinRequest: null,
                  };
                }
                return group;
              }),
            })),
          };
        }
      );

      return { previousData };
    },
    onError: (error, { requestId }, context) => {
      // Find the group ID to clear loading state
      const currentData = utils.groups.listGroups.getInfiniteData({ limit: 20, onlyPublic: false });
      let targetGroupId = '';

      currentData?.pages.forEach(page => {
        page.groups.forEach(group => {
          if (group.userJoinRequest?.id === requestId) {
            targetGroupId = group.id;
          }
        });
      });

      if (targetGroupId) {
        clearLoadingState(targetGroupId);
      }

      // Revert optimistic update on error
      if (context?.previousData) {
        utils.groups.listGroups.setInfiniteData(
          { limit: 20, onlyPublic: false },
          context.previousData
        );
      }

      // Show error message with specific handling for different error codes
      let errorTitle = 'Error';
      let errorMessage = 'Failed to cancel request. Please try again.';
      
      if (error instanceof TRPCClientError) {
        switch (error.data?.code) {
          case 'UNAUTHORIZED':
            errorTitle = 'Authentication Required';
            errorMessage = 'Please sign in to manage your join requests.';
            break;
          case 'NOT_FOUND':
            errorTitle = 'Request Not Found';
            errorMessage = 'This join request no longer exists.';
            break;
          case 'FORBIDDEN':
            errorTitle = 'Access Denied';
            errorMessage = 'You can only cancel your own join requests.';
            break;
          default:
            errorMessage = error.message || errorMessage;
        }
      }
      
      Alert.alert(errorTitle, errorMessage);
    },
    onSuccess: (data, { requestId }) => {
      // Find the group ID to clear loading state
      const currentData = utils.groups.listGroups.getInfiniteData({ limit: 20, onlyPublic: false });
      let targetGroupId = '';

      currentData?.pages.forEach(page => {
        page.groups.forEach(group => {
          if (group.userJoinRequest?.id === requestId) {
            targetGroupId = group.id;
          }
        });
      });

      if (targetGroupId) {
        clearLoadingState(targetGroupId);
      }

      Alert.alert('Request Cancelled', 'Your join request has been cancelled.');
    },
    onSettled: (data, error, { requestId }) => {
      // Find the group ID to clear loading state
      const currentData = utils.groups.listGroups.getInfiniteData({ limit: 20, onlyPublic: false });
      let targetGroupId = '';

      currentData?.pages.forEach(page => {
        page.groups.forEach(group => {
          if (group.userJoinRequest?.id === requestId) {
            targetGroupId = group.id;
          }
        });
      });

      if (targetGroupId) {
        clearLoadingState(targetGroupId);
      }

      // Invalidate and refetch
      utils.groups.listGroups.invalidate();
    },
  });

  const handleGroupPress = useCallback((groupId: string) => {
    router.navigate(`/(protected)/(tabs)/(groups)/${groupId}` as any);
  }, [router]);

  const handleGroupJoin = useCallback((groupId: string, action: GroupAction) => {
    if (action === 'join' || action === 'request') {
      // Set loading state
      setLoadingState(groupId, true);
      joinGroupMutation.mutate({ groupId });
    }
  }, [joinGroupMutation, setLoadingState]);

  const handleGroupLeave = useCallback((groupId: string, action: GroupAction) => {
    if (action === 'leave') {
      Alert.alert(
        'Unfollow Community',
        'Are you sure you want to unfollow this community?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Unfollow',
            style: 'destructive',
            onPress: () => {
              // Set loading state
              setLoadingState(groupId, true);
              leaveGroupMutation.mutate({ groupId });
            }
          }
        ]
      );
    } else if (action === 'cancel-request') {
      // Find the request ID from the cache
      const currentData = utils.groups.listGroups.getInfiniteData({ limit: 20, onlyPublic: false });
      let requestId = '';

      currentData?.pages.forEach(page => {
        page.groups.forEach(group => {
          if (group.id === groupId && group.userJoinRequest) {
            requestId = group.userJoinRequest.id;
          }
        });
      });

      if (requestId) {
        Alert.alert(
          'Cancel Request',
          'Are you sure you want to cancel your join request?',
          [
            { text: 'No', style: 'cancel' },
            {
              text: 'Cancel Request',
              style: 'destructive',
              onPress: () => {
                // Set loading state
                setLoadingState(groupId, true);
                cancelRequestMutation.mutate({ requestId });
              }
            }
          ]
        );
      }
    }
  }, [leaveGroupMutation, cancelRequestMutation, utils.groups.listGroups, clearLoadingState]);

  return (
    <HeaderContainer
      variant="secondary"
      hideBackButton={true}
      customTitle={t("tab-bar.groups", "Communities")}
    >
      <View className="flex-1 bg-white dark:bg-black">
        <GroupsList
          onGroupPress={handleGroupPress}
          onGroupJoin={handleGroupJoin}
          onGroupLeave={handleGroupLeave}
          showSearch={true}
          onlyPublic={false}
          loadingStates={loadingGroups}
          currentUserId={userInfo?.id}
        />
      </View>
    </HeaderContainer>
  );
}