import React from "react";
import { Tabs } from "expo-router";
import { FontAwesome6 } from "@expo/vector-icons";
import TabBar from "@/components/TabBar";
import { theme } from "@/lib/constants";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome6>["name"];
  color: string;
}) {
  return <FontAwesome6 size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const router = useRouter();

  const { t } = useTranslation();
  const handleTabPress = (route: string) => {
    if (route === "index") {
      router.replace("/");
    } else if (route === "(profile)") {
      router.replace("/(protected)/(profile)");
    }
  };

  return (
    // @ts-expect-error - Expo Router type issue
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
      initialRouteName="index"
    >
      <Tabs.Screen
        name="index"
        // This title is used to set the title of the header
        initialParams={{}}
        options={{
          // This title is used to set the title of the bottom tab
          title: t("tab-bar.home"),
          tabBarIcon: ({ color }) => <TabBarIcon name="house" color={color} />,
        }}
      />
      <Tabs.Screen
        name="(profile)"
        // This title is used to set the title of the header
        initialParams={{
          title: t("tab-bar.profile"),
        }}
        options={{
          // This title is used to set the title of the bottom tab
          title: t("tab-bar.profile"),
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
