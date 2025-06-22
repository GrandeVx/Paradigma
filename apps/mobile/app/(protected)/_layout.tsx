import React from "react";
import { Tabs } from "expo-router";
import { FontAwesome6 } from "@expo/vector-icons";
import TabBar from "@/components/TabBar";
import { theme } from "@/lib/constants";

import { useTranslation } from "react-i18next";
import { SvgIcon } from "@/components/ui/svg-icon";
import { View } from "react-native";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome6>["name"];
  color: string;
}) {
  return <FontAwesome6 size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {

  const { t } = useTranslation();


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
      initialRouteName="(home)"
    >
      <Tabs.Screen
        name="(home)"
        // This title is used to set the title of the header
        initialParams={{}}
        options={{
          // This title is used to set the title of the bottom tab
          title: t("tab-bar.home"),
          tabBarIcon: ({ color }) => <SvgIcon name="chart-vertical" color={color} />,
        }}
      />

      <Tabs.Screen
        name="(budgets)"
        initialParams={{
          title: t("tab-bar.budgets"),
        }}
        options={{
          // This title is used to set the title of the bottom tab
          title: t("tab-bar.budgets"),
          tabBarIcon: ({ color }) => <SvgIcon name="document" color={color} />,
        }}
      />


      <Tabs.Screen
        name="(transaction-flow)"
        options={{
          // This title is used to set the title of the bottom tab
          // title: t("tab-bar.transactions"),
          tabBarIcon: () => {
            return (
              <View className="flex-row items-center justify-center bg-primary-700 rounded-full w-14 h-14">
                <SvgIcon name="add" color={"white"} size={20} />
              </View>
            )
          },
        }}
      />

      <Tabs.Screen
        name="(accounts)"
        initialParams={{
          title: t("tab-bar.accounts"),
        }}
        options={{
          // This title is used to set the title of the bottom tab
          title: t("tab-bar.accounts"),
          tabBarIcon: ({ color }) => <SvgIcon name="pig-money" color={color} />,
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
      <Tabs.Screen
        name="(creation-flow)"
        initialParams={{
          href: null,
        }}
      />

    </Tabs>
  );
}
