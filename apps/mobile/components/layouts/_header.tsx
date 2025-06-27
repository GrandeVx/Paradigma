import { useSafeAreaInsets } from "react-native-safe-area-context";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSegments, useLocalSearchParams, useFocusEffect } from "expo-router";
import { getTitle } from "@/lib/utils";
import React, { ReactNode, useCallback } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { Href, Router, useRouter } from "expo-router";
import { Dimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useTabBar } from "@/context/TabBarContext";

interface HeaderAction {
  icon: ReactNode;
  onPress: () => void;
}

interface ContainerWithChildrenProps {
  children: ReactNode;
  router?: Router;
  modal?: boolean;
  backRoute?: Href;
  rightActions?: HeaderAction[];
  customTitle?: string;
  variant?: "main" | "secondary";
  hideBackButton?: boolean;
  onBackPress?: () => void;
  tabBarHidden?: boolean;
}

const HeaderContainer: React.FC<ContainerWithChildrenProps> = ({
  children,
  router = useRouter(),
  modal = false,
  backRoute,
  rightActions,
  customTitle,
  variant = "main",
  hideBackButton = false,
  onBackPress,
  tabBarHidden = false,
}) => {
  const segments = useSegments();
  const searchParams = useLocalSearchParams<{
    title?: string;
    referrer?: string;
  }>();

  const { hideTabBar, showTabBar } = useTabBar();

  // Use useFocusEffect to manage tab bar visibility only when screen is focused
  useFocusEffect(
    useCallback(() => {
      // When screen comes into focus, apply tab bar visibility
      if (tabBarHidden) {
        hideTabBar();
      } else {
        showTabBar();
      }

      // Cleanup: only show tab bar when leaving this screen if it was hidden
      return () => {
        if (tabBarHidden) {
          // Shorter delay to reduce flash during navigation
          setTimeout(() => {
            showTabBar();
          }, 50); // 50ms delay to allow next screen to take control
        }
      };
    }, [tabBarHidden]) // Remove hideTabBar and showTabBar from dependencies to prevent infinite loop
  );

  // Derive route name from the last segment of the path
  const currentRouteName = segments[segments.length - 1] ?? "";

  const insets = useSafeAreaInsets();
  const windowHeight = Dimensions.get("window").height;

  const headerHeight = Math.max(insets.top + 44, 0.16 * windowHeight);

  // Improved back navigation logic - tab bar is now managed automatically via focus
  const handleBackNavigation = () => {
    // Execute custom onBackPress if provided
    onBackPress?.();

    if (router.canGoBack()) {
      router.back();
      return;
    }

    // If a specific backRoute is provided, use it
    if (backRoute) {
      router.navigate(backRoute as Href);
      return;
    }

    // Intelligent back navigation based on current route context
    const currentPath = segments.join('/');

    // Special handling for cross-tab navigation issues
    if (currentPath.includes('(home)/(category-transactions)')) {
      const referrer = searchParams.referrer;

      if (referrer === 'budgets') {
        // Navigate back to budgets instead of home
        router.navigate('/(protected)/(budgets)/' as Href);
        return;
      }
    }

    if (currentPath.includes('(home)/(daily-transactions)')) {
      // Use normal back navigation for daily transactions
      router.back();
      return;
    }

    // For transaction edit, use normal back navigation instead of forcing home
    // This allows proper stack navigation in flows
    if (currentPath.includes('transaction-edit')) {
      router.back();
      return;
    }

    // Try standard back navigation first
    if (router.canGoBack()) {
      router.back();
    } else {
      // Fallback: navigate to appropriate tab home based on current context
      const currentTab = segments.find(segment =>
        ['(home)', '(budgets)', '(accounts)', '(profile)'].includes(segment)
      );

      if (currentTab) {
        router.navigate(`/(protected)/${currentTab}/` as Href);
      } else {
        // Ultimate fallback: go to home
        router.navigate('/(protected)/(home)/' as Href);
      }
    }
  };

  const renderLeftComponent = () => {
    if (variant === "secondary" && (router?.canGoBack() || backRoute || onBackPress) && !modal && router && !hideBackButton) {
      return (
        <View>
          <View>
            <Pressable
              onPress={handleBackNavigation}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "transparent",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <FontAwesome name="angle-left" size={24} color="black" />
            </Pressable>
          </View>
        </View>
      );
    }

    if (variant === "main") {
      return (
        <View>
          <View>
            <View
              style={{
                width: 30,
                height: 30,
                borderRadius: 20,
                overflow: "hidden",
                justifyContent: "center",
                alignItems: "center",
              }}
              className="bg-primary-400"
            >
              <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
                JD
              </Text>
            </View>
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={{ flex: 1 }} className="bg-white">
      <View
        style={{
          height: headerHeight,
          paddingTop: insets.top - 40,
          paddingHorizontal: 15,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 8,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              flex: 1,
              justifyContent: variant === "secondary" ? "center" : "flex-start",
              position: variant === "secondary" ? "relative" : "relative",
            }}
          >
            {variant === "secondary" && (
              <View
                style={{
                  position: "absolute",
                  left: 0,
                  zIndex: 1,
                }}
              >
                {renderLeftComponent()}
              </View>
            )}

            {variant !== "secondary" && (
              <View style={{ width: 30 }}>{renderLeftComponent()}</View>
            )}

            <View
              style={{
                flex: variant === "secondary" ? 1 : 0,
                alignItems: variant === "secondary" ? "center" : "flex-start",
                paddingHorizontal: variant === "secondary" ? 40 : 0,
              }}
            >
              <Text
                className="text-black font-sans font-medium uppercase text-center"
                style={{ fontSize: 16 }}
              >
                {customTitle ||
                  getTitle({
                    name: searchParams.title ?? (currentRouteName as string),
                  })}
              </Text>
            </View>
          </View>

          {rightActions && (
            <View
              style={{
                flexDirection: "row",
                gap: 4,
                marginLeft: "auto",
                position: variant === "secondary" ? "absolute" : "relative",
                right: variant === "secondary" ? 15 : 0,
              }}
            >
              {rightActions?.map((action, index) => (
                <View key={index}>
                  <View>
                    <View>
                      <Pressable
                        onPress={action.onPress}
                        style={{
                          width: 40,
                          height: 40,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {action.icon}
                      </Pressable>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      <StatusBar style={Platform.OS === "ios" ? "auto" : "auto"} />
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1 }}>
            {children}
          </View>
        </View>
      </View>
    </View>
  );
};

export default HeaderContainer;
