import React from "react";
import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import HeaderContainer from "@/components/layouts/_header";
import { GroupDetail } from "@/components/groups/GroupDetail";
import { useTranslation } from "react-i18next";

export default function GroupDetailScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { t } = useTranslation();

  if (!groupId) {
    return (
      <HeaderContainer variant="secondary" customTitle={t("tab-bar.groups", "Groups")} tabBarHidden={true}>
        <View className="flex-1 bg-white dark:bg-black items-center justify-center">
          {/* Error state - invalid group ID */}
        </View>
      </HeaderContainer>
    );
  }

  return (
    <HeaderContainer
      variant="secondary"
      customTitle={t("tab-bar.groups", "Groups")}
      tabBarHidden={true}
    >
      <View className="flex-1 bg-white dark:bg-black">
        <GroupDetail groupId={groupId} />
      </View>
    </HeaderContainer>
  );
}