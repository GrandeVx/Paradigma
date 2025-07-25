import * as React from "react";
import { StyleSheet, View, Pressable, Text, Animated } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useTabBar } from "@/context/TabBarContext";
import { useRouter } from "expo-router";
import * as Haptics from 'expo-haptics';



// Memoized TabBar component for better performance
const TabBar = React.memo<BottomTabBarProps>(({
  state,
  insets,
  navigation,
  descriptors,
}) => {
  // ALWAYS call hooks in the same order - move all hooks to the top
  const { isTabBarVisible, tabBarAnimation } = useTabBar();
  const router = useRouter();

  // Memoize filtered routes to avoid recalculating on every render
  const filteredRoutes = React.useMemo(() =>
    state.routes.filter((route) => (route?.params as { href?: string })?.href !== null || false),
    [state.routes]
  );

  // Calculate visibility after all hooks are called
  const Flows = ["(creation-flow)", "(transaction-flow)"];
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
          opacity: tabBarAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          })
        }
      ]}
    >
      <View style={styles.container}>
        <View style={styles.tab_bar_container}>
          {/* Questo strano filtraggio permette di nascondere le tab settando href a null */}
          {filteredRoutes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            // Regular function instead of useCallback (hooks can't be called in loops)
            const onPress = async () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                // Special handling for transaction-flow to always reset to value screen
                if (route.name === "(transaction-flow)") {
                  // Force complete reset to value screen, clearing navigation stack
                  router.replace("/(protected)/(transaction-flow)/value");
                } else {
                  navigation.navigate(route.name);
                }
              }
            };

            // Regular function call instead of useMemo (hooks can't be called in loops)
            const tabIcon = options.tabBarIcon?.({
              focused: isFocused,
              color: isFocused ? "#005EFD" : "#8E8E93",
              size: 24,
            });

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                style={styles.tab_item}
              >
                <View style={styles.tab_button}>
                  <View style={styles.icon_container}>
                    {tabIcon}
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
});

TabBar.displayName = 'TabBar';

export default TabBar;

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
