import { useSafeAreaInsets } from "react-native-safe-area-context";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSegments, useLocalSearchParams } from "expo-router";
import { getTitle } from "@/lib/utils";
import React, { ReactNode, useEffect } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { Href, Router, useRouter } from "expo-router";
import { Dimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
  withSequence,
} from "react-native-reanimated";

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
}) => {
  const segments = useSegments();
  const searchParams = useLocalSearchParams<{
    title?: string;
  }>();

  // Derive route name from the last segment of the path
  const currentRouteName = segments[segments.length - 1] ?? "";

  const insets = useSafeAreaInsets();
  const windowHeight = Dimensions.get("window").height;

  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);
  const rightComponentsOpacity = useSharedValue(0);
  const rightComponentsTranslateX = useSharedValue(20);
  const leftComponentOpacity = useSharedValue(0);
  const leftComponentTranslateX = useSharedValue(-20);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(20);

  const headerHeight = Math.max(insets.top + 44, 0.16 * windowHeight);

  // Get user data

  const animateElements = () => {
    titleOpacity.value = withSequence(
      withTiming(0, { duration: 0 }),
      withTiming(1, { duration: 300 })
    );

    titleTranslateY.value = withSequence(
      withTiming(20, { duration: 0 }),
      withSpring(0, {
        damping: 15,
        stiffness: 150,
      })
    );

    rightComponentsOpacity.value = withSequence(
      withTiming(0, { duration: 0 }),
      withTiming(1, { duration: 300 })
    );

    rightComponentsTranslateX.value = withSequence(
      withTiming(20, { duration: 0 }),
      withSpring(0, {
        damping: 15,
        stiffness: 150,
      })
    );

    leftComponentOpacity.value = withSequence(
      withTiming(0, { duration: 0 }),
      withTiming(1, { duration: 300 })
    );

    leftComponentTranslateX.value = withSequence(
      withTiming(-20, { duration: 0 }),
      withSpring(0, {
        damping: 15,
        stiffness: 150,
      })
    );

    contentOpacity.value = withSequence(
      withTiming(0, { duration: 0 }),
      withTiming(1, { duration: 300 })
    );

    contentTranslateY.value = withSequence(
      withTiming(20, { duration: 0 }),
      withSpring(0, {
        damping: 15,
        stiffness: 150,
      })
    );
  };

  useEffect(() => {
    animateElements();
  }, [currentRouteName]);

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    fontSize: 16,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const rightComponentsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: rightComponentsOpacity.value,
    transform: [{ translateX: rightComponentsTranslateX.value }],
  }));

  const leftComponentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: leftComponentOpacity.value,
    transform: [{ translateX: leftComponentTranslateX.value }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const renderLeftComponent = () => {
    if (variant === "secondary" && router?.canGoBack() && !modal && router && !hideBackButton) {
      return (
        <View>
          <Animated.View style={[leftComponentAnimatedStyle]}>
            <Pressable
              onPress={() => {
                backRoute ? router.navigate(backRoute) : router.back();
              }}
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
          </Animated.View>
        </View>
      );
    }

    if (variant === "main") {
      return (
        <View>
          <Animated.View style={[leftComponentAnimatedStyle]}>
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
          </Animated.View>
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
              <Animated.Text
                className="text-black font-sans font-medium"
                style={[
                  titleAnimatedStyle,
                ]}
              >
                {customTitle ||
                  getTitle({
                    name: searchParams.title ?? (currentRouteName as string),
                  })}
              </Animated.Text>
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
                    <Animated.View
                      style={[
                        {
                          opacity: 0,
                          transform: [{ translateX: 20 }],
                        },
                        rightComponentsAnimatedStyle,
                      ]}
                    >
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
                    </Animated.View>
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
          <Animated.View
            style={[
              {
                flex: 1,
              },
              contentAnimatedStyle,
            ]}
          >
            {children}
          </Animated.View>
        </View>
      </View>
    </View>
  );
};

export default HeaderContainer;
