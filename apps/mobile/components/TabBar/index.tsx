import * as React from "react";
import { StyleSheet, View, Pressable, Text } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";

export default function TabBar({
  state,
  insets,
  navigation,
  descriptors,
}: BottomTabBarProps) {
  const shouldHideTabBar = false;

  if (shouldHideTabBar) {
    return null;
  }

  return (
    <View style={styles.safe_area_container}>
      <View style={styles.container}>
        <View style={styles.tab_bar_container}>
          {state.routes.map((route, index) => {
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
                      color: isFocused ? "#000000" : "#8E8E93",
                      size: 24,
                    })}
                  </View>
                  <Text
                    style={[
                      styles.tab_label,
                      { color: isFocused ? "#000000" : "#8E8E93" },
                    ]}
                  >
                    {options.title}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
        <View style={{ height: insets.bottom, backgroundColor: "#FFFFFF" }} />
      </View>
    </View>
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
