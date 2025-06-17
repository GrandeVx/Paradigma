import * as React from "react";
import { StyleSheet, View, Pressable, Text, Animated } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useTabBar } from "@/context/TabBarContext";

export default function TabBar({
  state,
  insets,
  navigation,
  descriptors,
}: BottomTabBarProps) {
  const { isTabBarVisible, tabBarAnimation } = useTabBar();

  const Flows = ["(creation-flow)", "(transaction-flow)"];
  // check if the creation flow is the active route
  const isCreationFlow = state.routes.filter((route, index) => state.index === index).some((route) => Flows.includes(route.name));
  const shouldHideTabBar = isCreationFlow || !isTabBarVisible;

  if (shouldHideTabBar) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.safe_area_container,
        {
          transform: [{
            translateY: tabBarAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [100, 0], // Slide up from below
            })
          }],
          opacity: tabBarAnimation
        }
      ]}
    >
      <View style={styles.container}>
        <View style={styles.tab_bar_container}>
          {state.routes.filter((route) => route.params?.href !== null).map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = async () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                style={styles.tab_item}
              >
                <View style={styles.tab_button}>
                  <View style={styles.icon_container}>
                    {options.tabBarIcon?.({
                      focused: isFocused,
                      color: isFocused ? "#005EFD" : "#8E8E93",
                      size: 24,
                    })}
                  </View>
                  {
                    options.title && (
                      <Text
                        style={[
                          styles.tab_label,
                          { color: isFocused ? "#005EFD" : "#8E8E93" },
                        ]}
                      >
                        {options.title}
                      </Text>
                    )
                  }
                </View>
              </Pressable>
            );
          })}
        </View>
        <View style={{ height: insets.bottom, backgroundColor: "#FFFFFF" }} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safe_area_container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
  },
  container: {
    width: "100%",
    backgroundColor: "#FFFFFF",
  },
  tab_bar_container: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopColor: "#E5E5EA",
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 15,
  },
  tab_item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tab_button: {
    alignItems: "center",
    justifyContent: "center",
  },
  icon_container: {
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  tab_label: {
    fontSize: 11,
    lineHeight: 13,
    textAlign: "center",
    fontWeight: "500",
  },
});
