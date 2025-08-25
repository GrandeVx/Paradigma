import React, { useState, useCallback, useMemo } from "react";
import { View, ScrollView, Pressable, SafeAreaView, ActivityIndicator, Alert } from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import HeaderContainer from "@/components/layouts/_header";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from 'react-i18next';
import { api } from "@/lib/api";

// Simple dropdown component for group selection
const GroupSelector = ({ 
  groups, 
  selectedGroup, 
  onSelectGroup, 
  isLoading 
}: {
  groups: any[];
  selectedGroup: string | null;
  onSelectGroup: (groupId: string) => void;
  isLoading: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading) {
    return (
      <View className="bg-white border border-gray-200 rounded-xl p-4">
        <View className="flex-row items-center">
          <ActivityIndicator size="small" color="#3B82F6" />
          <Text className="text-gray-600 ml-2">Loading groups...</Text>
        </View>
      </View>
    );
  }

  const selectedGroupData = groups.find(group => group.id === selectedGroup);

  return (
    <View>
      <Pressable
        className={`bg-white border border-gray-200 rounded-xl p-4 ${isOpen ? 'border-primary-500' : ''}`}
        onPress={() => setIsOpen(!isOpen)}
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-gray-600 text-sm mb-1">Select Group</Text>
            <Text className="text-gray-800 font-medium">
              {selectedGroupData ? selectedGroupData.name : 'Choose a group...'}
            </Text>
          </View>
          <Text className={`text-lg ${isOpen ? 'rotate-180' : ''}`}>▼</Text>
        </View>
      </Pressable>

      {isOpen && (
        <View className="bg-white border border-gray-200 rounded-xl mt-2 overflow-hidden">
          {groups.map((group) => (
            <Pressable
              key={group.id}
              className={`p-4 border-b border-gray-100 ${
                selectedGroup === group.id ? 'bg-primary-50' : ''
              }`}
              onPress={() => {
                onSelectGroup(group.id);
                setIsOpen(false);
              }}
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center mr-3">
                  <Text className="text-primary-700 font-bold">
                    {group.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="font-medium text-gray-800">{group.name}</Text>
                  <Text className="text-gray-500 text-sm">
                    {group.memberCount} members • {group.isPublic ? 'Public' : 'Private'}
                  </Text>
                </View>
                {selectedGroup === group.id && (
                  <Text className="text-primary-500 text-lg">✓</Text>
                )}
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
};

export default function PostPublishScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(true);

  const params = useLocalSearchParams<{ 
    content?: string
  }>();

  // API queries and mutations
  const { 
    data: groupsData, 
    isLoading: groupsLoading, 
    error: groupsError 
  } = api.groups.listGroups.useQuery({ 
    limit: 50,
    onlyPublic: false 
  });

  const createPostMutation = api.posts.createPost.useMutation({
    onSuccess: () => {
      Alert.alert(
        "Success!",
        "Your post has been published successfully.",
        [
          {
            text: "OK",
            onPress: () => router.push("/(protected)/(dashboard)/")
          }
        ]
      );
    },
    onError: (error) => {
      Alert.alert(
        "Error",
        error.message || "Failed to publish your post. Please try again.",
        [{ text: "OK" }]
      );
    }
  });

  const groups = groupsData?.groups || [];
  const selectedGroup = useMemo(() => 
    groups.find(group => group.id === selectedGroupId), 
    [groups, selectedGroupId]
  );

  const handleSubmit = async () => {
    if (!params.content?.trim()) {
      Alert.alert("Error", "Post content is required.");
      return;
    }

    if (!selectedGroupId) {
      Alert.alert("Error", "Please select a group for your post.");
      return;
    }

    createPostMutation.mutate({
      content: params.content.trim(),
      groupId: selectedGroupId,
      isPublic: isPublic,
    });
  };

  const handleBack = () => {
    router.back();
  };

  const canPublish = params.content?.trim() && selectedGroupId && !createPostMutation.isPending;
  const isLoading = createPostMutation.isPending;

  return (
    <HeaderContainer 
      variant="secondary" 
      customTitle="Publish Post"
      onBackPress={handleBack}
    >
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
          
          {/* Post Preview */}
          <View className="bg-gray-50 rounded-2xl p-6 mb-6">
            <Text className="text-gray-600 text-sm mb-3">Post Preview</Text>
            <Text className="text-gray-800 text-base leading-6">
              {params.content || 'No content'}
            </Text>
            <Text className="text-gray-500 text-sm mt-3">
              {params.content?.length || 0} characters
            </Text>
          </View>

          {/* Group Selection */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              Choose Group
            </Text>
            <GroupSelector
              groups={groups}
              selectedGroup={selectedGroupId}
              onSelectGroup={setSelectedGroupId}
              isLoading={groupsLoading}
            />
            {groupsError && (
              <Text className="text-red-500 text-sm mt-2">
                Failed to load groups. Please check your connection.
              </Text>
            )}
          </View>

          {/* Privacy Settings */}
          {selectedGroup && (
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-800 mb-4">
                Privacy Settings
              </Text>
              <View className="bg-white border border-gray-200 rounded-xl p-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-gray-800 font-medium mb-1">
                      Public Post
                    </Text>
                    <Text className="text-gray-600 text-sm">
                      {selectedGroup.isPublic 
                        ? "Visible to all group members and public"
                        : "Visible to group members only"
                      }
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => setIsPublic(!isPublic)}
                    className={`w-12 h-6 rounded-full p-1 ${
                      isPublic ? 'bg-primary-500' : 'bg-gray-300'
                    }`}
                  >
                    <View 
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        isPublic ? 'translate-x-6' : 'translate-x-0'
                      }`} 
                    />
                  </Pressable>
                </View>
              </View>
            </View>
          )}

          {/* Post Details */}
          <View className="mb-8">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              Post Details
            </Text>
            
            <View className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600">Group:</Text>
                <Text className="font-medium text-gray-800">
                  {selectedGroup?.name || 'None selected'}
                </Text>
              </View>
            </View>

            <View className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600">Visibility:</Text>
                <Text className="font-medium text-gray-800">
                  {isPublic ? 'Public' : 'Private'}
                </Text>
              </View>
            </View>

            <View className="bg-white border border-gray-200 rounded-xl p-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600">Date:</Text>
                <Text className="font-medium text-gray-800">
                  {new Date().toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>

          {/* Publish Button */}
          <Button
            variant="primary"
            size="lg"
            onPress={handleSubmit}
            disabled={!canPublish}
          >
            {isLoading ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white font-semibold text-base ml-2">
                  Publishing...
                </Text>
              </View>
            ) : (
              <Text className="text-white font-semibold text-base">
                Publish Post
              </Text>
            )}
          </Button>
        </ScrollView>
      </SafeAreaView>
    </HeaderContainer>
  );
}