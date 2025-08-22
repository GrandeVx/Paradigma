import React, { useState, useCallback, useMemo } from "react";
import { View, ScrollView, RefreshControl, ActivityIndicator } from "react-native";
import HeaderContainer from "@/components/layouts/_header";
import { TabBar } from "@/components/tab-navigation/tab-bar";
import { getHomeTabs, type HomeTab } from "@/types/tabs";
import { useTranslation } from 'react-i18next';
import { Text } from "@/components/ui/text";
import { useRouter } from 'expo-router';
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

// Dashboard Stats Card Component
const StatsCard = ({ title, value, icon, onPress, isLoading = false }: {
  title: string;
  value: string | number;
  icon: string;
  onPress?: () => void;
  isLoading?: boolean;
}) => (
  <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex-1 mx-1">
    <View className="flex-row items-center justify-between mb-2">
      <Text className="text-2xl">{icon}</Text>
      {onPress && (
        <View className="w-6 h-6 bg-primary-100 rounded-full items-center justify-center">
          <Text className="text-primary-700 text-xs font-bold">→</Text>
        </View>
      )}
    </View>
    <Text className="text-2xl font-bold text-gray-800 mb-1">
      {isLoading ? "-" : value}
    </Text>
    <Text className="text-gray-500 text-sm">{title}</Text>
  </View>
);

// Quick Action Button Component
const QuickActionButton = ({ title, icon, onPress, variant = "outline" }: {
  title: string;
  icon: string;
  onPress: () => void;
  variant?: "outline" | "primary";
}) => (
  <Button
    variant={variant}
    size="default"
    onPress={onPress}
    className="flex-1 mx-1"
  >
    <View className="flex-row items-center">
      <Text className="text-lg mr-2">{icon}</Text>
      <Text className={variant === "primary" ? "text-white font-semibold" : "text-primary-700 font-semibold"}>
        {title}
      </Text>
    </View>
  </Button>
);

// Recent Groups Section Component
const RecentGroupsSection = ({ groups, onViewAll, isLoading }: {
  groups: any[];
  onViewAll: () => void;
  isLoading: boolean;
}) => (
  <View className="mt-6">
    <View className="flex-row justify-between items-center mb-4">
      <Text className="text-lg font-bold text-gray-800">Your Groups</Text>
      <Button variant="ghost" size="sm" onPress={onViewAll}>
        <Text className="text-primary-700 font-semibold">View All</Text>
      </Button>
    </View>
    
    {isLoading ? (
      <View className="flex-row justify-center py-8">
        <ActivityIndicator size="small" color="#3B82F6" />
      </View>
    ) : groups.length === 0 ? (
      <View className="bg-gray-50 rounded-xl p-6 items-center">
        <Text className="text-4xl mb-2">👥</Text>
        <Text className="text-gray-600 text-center">
          You haven't joined any groups yet. Create or join one to get started!
        </Text>
      </View>
    ) : (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-3">
        {groups.slice(0, 5).map((group) => (
          <View key={group.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 w-48 mr-3">
            <View className="flex-row items-center mb-2">
              <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center mr-3">
                <Text className="text-primary-700 font-bold">
                  {group.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-800 text-sm" numberOfLines={1}>
                  {group.name}
                </Text>
                <Text className="text-gray-500 text-xs">
                  {group.memberCount} members
                </Text>
              </View>
            </View>
            <Text className="text-gray-600 text-xs" numberOfLines={2}>
              {group.description || "No description"}
            </Text>
          </View>
        ))}
      </ScrollView>
    )}
  </View>
);

// Main Dashboard Tab Content
const DashboardSection = () => {
  const router = useRouter();
  
  // API Queries
  const { 
    data: userInfo, 
    isLoading: userLoading, 
    refetch: refetchUser 
  } = api.user.getUserInfo.useQuery();
  
  const { 
    data: groupsData, 
    isLoading: groupsLoading, 
    refetch: refetchGroups 
  } = api.groups.listGroups.useQuery({ 
    limit: 10,
    onlyPublic: false 
  });

  // Calculate stats
  const groups = groupsData?.groups || [];
  const ownedGroups = groups.filter(group => group.ownerId === userInfo?.id);
  const totalMembers = groups.reduce((sum, group) => sum + group.memberCount, 0);
  const totalPosts = groups.reduce((sum, group) => sum + group.postCount, 0);

  // Refresh control
  const [isRefreshing, setIsRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchUser(), refetchGroups()]);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchUser, refetchGroups]);

  // Navigation handlers
  const handleCreatePost = () => {
    // Navigate to create post flow
    router.push('/(protected)/(transaction-flow)/value');
  };

  const handleCreateGroup = () => {
    // Navigate to create group page when implemented
    console.log('Navigate to create group');
  };

  const handleViewAllGroups = () => {
    // Navigate to groups page when implemented
    console.log('Navigate to all groups');
  };

  return (
    <ScrollView 
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
    >
      <View className="p-6">
        {/* Welcome Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-800 mb-1">
            Welcome back{userInfo?.name ? `, ${userInfo.name}` : ''}!
          </Text>
          <Text className="text-gray-600">
            Here's what's happening in your groups
          </Text>
        </View>

        {/* Stats Cards */}
        <View className="flex-row mb-6">
          <StatsCard
            title="Groups Joined"
            value={groups.length}
            icon="👥"
            isLoading={groupsLoading}
            onPress={handleViewAllGroups}
          />
          <StatsCard
            title="Groups Owned"
            value={ownedGroups.length}
            icon="👑"
            isLoading={groupsLoading}
          />
        </View>

        <View className="flex-row mb-6">
          <StatsCard
            title="Total Members"
            value={totalMembers}
            icon="👤"
            isLoading={groupsLoading}
          />
          <StatsCard
            title="Total Posts"
            value={totalPosts}
            icon="📝"
            isLoading={groupsLoading}
          />
        </View>

        {/* Quick Actions */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-800 mb-4">Quick Actions</Text>
          <View className="flex-row mb-3">
            <QuickActionButton
              title="Create Post"
              icon="✏️"
              onPress={handleCreatePost}
              variant="primary"
            />
            <QuickActionButton
              title="Create Group"
              icon="➕"
              onPress={handleCreateGroup}
            />
          </View>
        </View>

        {/* Recent Groups */}
        <RecentGroupsSection
          groups={groups}
          onViewAll={handleViewAllGroups}
          isLoading={groupsLoading}
        />
      </View>
    </ScrollView>
  );
};

const FeedSection = () => {
  return (
    <View className="flex-1 justify-center items-center px-8">
      <View
        className="w-20 h-20 rounded-full items-center justify-center mb-6"
        style={{ backgroundColor: `#10B98120` }}
      >
        <Text className="text-4xl">📰</Text>
      </View>
      <Text className="text-2xl font-bold text-gray-800 text-center mb-3">
        Activity Feed
      </Text>
      <Text className="text-gray-600 text-center text-base mb-6">
        Your personalized feed will appear here
      </Text>
      <View className="bg-gray-100 rounded-lg px-4 py-3">
        <Text className="text-gray-500 text-sm text-center">
          Feed functionality coming soon
        </Text>
      </View>
    </View>
  );
};

const ExploreSection = () => {
  return (
    <View className="flex-1 justify-center items-center px-8">
      <View
        className="w-20 h-20 rounded-full items-center justify-center mb-6"
        style={{ backgroundColor: `#F59E0B20` }}
      >
        <Text className="text-4xl">🔍</Text>
      </View>
      <Text className="text-2xl font-bold text-gray-800 text-center mb-3">
        Explore Groups
      </Text>
      <Text className="text-gray-600 text-center text-base mb-6">
        Discover new groups and communities
      </Text>
      <View className="bg-gray-100 rounded-lg px-4 py-3">
        <Text className="text-gray-500 text-sm text-center">
          Group exploration coming soon
        </Text>
      </View>
    </View>
  );
};

export default function SocialDashboard() {
  const { t } = useTranslation();
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  // Get tabs with translations
  const homeTabs = getHomeTabs(t);

  // Simple tab press handler
  const handleTabPress = useCallback((tab: HomeTab, index: number) => {
    setActiveTabIndex(index);
    console.log(`[Social Dashboard] Switched to tab: ${tab.title}`);
  }, []);

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTabIndex) {
      case 0:
        return <DashboardSection />;
      case 1:
        return <FeedSection />;
      case 2:
        return <ExploreSection />;
      default:
        return <DashboardSection />;
    }
  };

  return (
    <HeaderContainer variant="secondary" customTitle="Social Dashboard">
      <View className="flex-1">
        {/* Tab Navigation */}
        <TabBar
          tabs={homeTabs}
          activeIndex={activeTabIndex}
          onTabPress={handleTabPress}
        />

        {/* Active Tab Content */}
        <View className="flex-1">
          {renderTabContent()}
        </View>
      </View>
    </HeaderContainer>
  );
}