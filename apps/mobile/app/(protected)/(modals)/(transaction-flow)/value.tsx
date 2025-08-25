import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Pressable,
  ActivityIndicator,
  Dimensions
} from "react-native";
import { Text } from "@/components/ui/text";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/api";
import { SvgIcon } from "@/components/ui/svg-icon";
import { ScrollView } from "react-native-gesture-handler";

const { height: screenHeight } = Dimensions.get('window');

// Group selector component for Linear style
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
      <View className="flex-row items-center px-4 py-3 bg-gray-50 rounded-lg">
        <ActivityIndicator size="small" color="#8B5CF6" />
        <Text className="text-gray-600 ml-2 text-sm">Loading...</Text>
      </View>
    );
  }

  const selectedGroupData = groups.find(group => group.id === selectedGroup);

  return (
    <View>
      <Pressable
        className={`flex-row items-center px-4 py-3 bg-gray-50 rounded-lg ${isOpen ? 'bg-gray-100' : ''}`}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text className="text-gray-500 text-sm mr-2">📝</Text>
        <Text className="text-gray-700 text-sm flex-1">
          {selectedGroupData ? selectedGroupData.name : 'Select group...'}
        </Text>
        <Text className={`text-gray-400 text-xs transform ${isOpen ? 'rotate-180' : ''}`}>▼</Text>
      </Pressable>

      {isOpen && (
        <View className="mt-2 bg-white border border-gray-200 rounded-lg shadow-sm max-h-40">
          {groups.map((group) => (
            <Pressable
              key={group.id}
              className={`flex-row items-center px-4 py-3 border-b border-gray-100 ${selectedGroup === group.id ? 'bg-purple-50' : ''
                }`}
              onPress={() => {
                onSelectGroup(group.id);
                setIsOpen(false);
              }}
            >
              <View className="w-6 h-6 bg-purple-100 rounded-full items-center justify-center mr-3">
                <Text className="text-purple-700 text-xs font-bold">
                  {group.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-800 text-sm font-medium">{group.name}</Text>
                <Text className="text-gray-500 text-xs">
                  {group.memberCount} members
                </Text>
              </View>
              {selectedGroup === group.id && (
                <SvgIcon name="checks" size={16} color="#8B5CF6" />
              )}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
};

export default function CreatePostScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const textInputRef = useRef<TextInput>(null);
  const [content, setContent] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // API queries
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
            onPress: () => router.push("/(protected)/(tabs)/(dashboard)/")
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

  // Auto-focus on text input when modal opens
  useEffect(() => {
    const timer = setTimeout(() => {
      textInputRef.current?.focus();
    }, 300); // Small delay to allow modal animation

    return () => clearTimeout(timer);
  }, []);

  const handleClose = useCallback(() => {
    if (content.trim()) {
      Alert.alert(
        "Discard post?",
        "Your post will be lost if you close now.",
        [
          { text: "Keep editing", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => router.back()
          }
        ]
      );
    } else {
      router.back();
    }
  }, [content, router]);

  const handleCreate = async () => {
    if (!content.trim()) {
      Alert.alert("Error", "Please write something for your post.");
      return;
    }

    if (!selectedGroupId) {
      Alert.alert("Error", "Please select a group for your post.");
      return;
    }

    setIsLoading(true);

    try {
      await createPostMutation.mutateAsync({
        content: content.trim(),
        groupId: selectedGroupId,
        isPublic: true,
      });
    } catch (error) {
      // Error is handled in mutation onError
    } finally {
      setIsLoading(false);
    }
  };

  const canCreate = content.trim() && selectedGroupId && !isLoading && !createPostMutation.isLoading;
  const isSubmitting = isLoading || createPostMutation.isLoading;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={80}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
          <Pressable
            onPress={handleClose}
            className="flex-row items-center"
          >
            <Text className="text-gray-600 text-base font-medium">Cancel</Text>
          </Pressable>

          <View className="flex-row items-center">
            <SvgIcon name="activity" size={20} color="#8B5CF6" />
            <Text className="text-gray-800 text-base font-semibold ml-2">Metrica</Text>
          </View>

          <Pressable
            onPress={handleCreate}
            disabled={!canCreate}
            className={`px-4 py-2 rounded-lg ${canCreate
              ? 'bg-purple-600'
              : 'bg-gray-200'
              }`}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className={`text-sm font-semibold ${canCreate ? 'text-white' : 'text-gray-400'
                }`}>
                Create
              </Text>
            )}
          </Pressable>
        </View>

        {/* Main Content */}
        <View className="flex-1 px-4 py-4">
          {/* Title Input */}
          <TextInput
            ref={textInputRef}
            className="text-2xl text-gray-800 font-bold mb-4"
            placeholder="Issue title"
            placeholderTextColor="#9CA3AF"
            value={content}
            onChangeText={setContent}
            multiline
            autoFocus
            style={{
              minHeight: 28,
              maxHeight: screenHeight * 0.3,
              textAlignVertical: 'top'
            }}
          />

          {/* Description placeholder */}
          <TextInput
            className="text-base text-gray-800 font-medium mb-6"
            placeholder="Description..."
            multiline
            style={{
              minHeight: 200,
              maxHeight: screenHeight * 0.2,
              textAlignVertical: 'top'
            }}
          />

          {/* Metadata Section */}
          <ScrollView className="space-y-1 " horizontal={true} style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10,

            padding: 10,
          }}>

            {/* Group Selection */}
            <GroupSelector
              groups={groups}
              selectedGroup={selectedGroupId}
              onSelectGroup={setSelectedGroupId}
              isLoading={groupsLoading}
            />

            {groupsError && (
              <Text className="text-red-500 text-xs px-4">
                Failed to load groups
              </Text>
            )}
          </ScrollView>
        </View>

        {/* Bottom Action Bar */}
        <View className="flex-row items-center px-4 py-3 gap-5 border-t border-gray-100 bg-gray-100">
          <SvgIcon name="message-circle" size={18} color="#6B7280" />
          <SvgIcon name="link" size={18} color="#6B7280" className="ml-4" />
          <SvgIcon name="at" size={18} color="#6B7280" className="ml-4" />
          <SvgIcon name="document" size={18} color="#6B7280" className="ml-4" />
          <SvgIcon name="checks" size={18} color="#6B7280" className="ml-4" />
          <SvgIcon name="close" size={18} color="#6B7280" className="ml-4" />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}