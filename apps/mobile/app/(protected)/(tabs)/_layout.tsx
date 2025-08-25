import React from "react";
import { router, Tabs, useSegments } from "expo-router";
import { FontAwesome6 } from "@expo/vector-icons";
import TabBar from "@/components/TabBar";
import { theme } from "@/lib/constants";
import { useTabPrefetching } from "@/hooks/use-tab-prefetching";
import { useTranslation } from "react-i18next";
import { SvgIcon } from "@/components/ui/svg-icon";
import { View, Text } from "react-native";
import { useProfileIcon } from "@/hooks/use-profile-icon";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome6>["name"];
  color: string;
}) {
  return <FontAwesome6 size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const { icon, isIconReady } = useProfileIcon();
  const segments = useSegments();
  const { t } = useTranslation();
  // Get current tab for prefetching - adjusted for new structure
  const currentTab = segments[2] || "(home)"; // segments[2] now contains the tab name

  // Enable intelligent prefetching
  useTabPrefetching(currentTab);

  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: "black",
        tabBarInactiveTintColor: theme.light.tabs_muted,
        tabBarStyle: {
          display: "flex",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="(home)"
        initialParams={{}}
        options={{
          title: t("tab-bar.home"),
          tabBarIcon: ({ color }) => <SvgIcon name="chart-vertical" color={color} />,
        }}
      />

      <Tabs.Screen
        name="(budgets)"
        initialParams={{}}
        options={{
          title: t("tab-bar.budgets"),
          tabBarIcon: ({ color }) => <SvgIcon name="target" color={color} />,
        }}
      />

      <Tabs.Screen
        name="(accounts)"
        initialParams={{}}
        options={{
          title: t("tab-bar.accounts"),
          tabBarIcon: ({ color }) => <SvgIcon name="wallet" size={30} color={color} />,
        }}
      />

      <Tabs.Screen
        name="(profile)"
        initialParams={{}}
        options={{
          title: t("tab-bar.profile"),
          tabBarIcon: ({ color }) =>
            isIconReady ? (
              <Text style={{ fontSize: 24, marginBottom: -3 }}>{icon}</Text>
            ) : (
              <TabBarIcon name="user" color={color} />
            )
        }}
      />

      {/* Virtual screen for central action button */}
      {/**
       * add-transaction is a virtual screen that is not in the routing tree but is used to trigger the modal
       */}
      <Tabs.Screen
        name="add-transaction"
        options={{
          tabBarIcon: () => {
            return (
              <View className="flex-row items-center justify-center bg-primary-700 rounded-full w-14 h-14">
                <SvgIcon name="add" color={"white"} size={20} />
              </View>
            )
          },
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push("/(protected)/(modals)/(transaction-flow)/value");
          },
        }}
      />
    </Tabs>
  );
}