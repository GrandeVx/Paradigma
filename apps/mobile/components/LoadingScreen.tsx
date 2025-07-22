import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing, runOnJS } from "react-native-reanimated";

interface NetworkState {
  isConnected: boolean;
  isLoading: boolean;
  isReconnecting: boolean;
  hasInitialConnection: boolean;
}

// Loading Screen Component with network-aware messaging
interface LoadingScreenProps {
  isVisible: boolean;
  networkState?: NetworkState;
}

export const LoadingScreen = React.memo<LoadingScreenProps>(({ isVisible, networkState }) => {
  // Animation values for currency symbols
  const dollarOpacity = useSharedValue(0);
  const euroOpacity = useSharedValue(0);
  const poundOpacity = useSharedValue(0);
  const yenOpacity = useSharedValue(0);

  // Container visibility and scaling for exit animation
  const containerOpacity = useSharedValue(1);
  const containerScale = useSharedValue(1);
  const logoScale = useSharedValue(1);

  // Internal state management for smooth exit animation
  const [shouldRender, setShouldRender] = useState(true);
  const [hasStartedAnimation, setHasStartedAnimation] = useState(false);
  const [animationInterval, setAnimationInterval] = useState<NodeJS.Timeout | null>(null);

  // Determine status message based on network state
  const getStatusMessage = () => {
    if (!networkState) {
      return "Caricamento...";
    }

    if (networkState.isLoading && !networkState.hasInitialConnection) {
      return "Inizializzazione...";
    }

    if (networkState.isReconnecting) {
      return "Riconnessione in corso...";
    }

    if (!networkState.isConnected && networkState.hasInitialConnection) {
      return "Nessuna connessione internet";
    }

    return "Caricamento...";
  };

  const statusMessage = getStatusMessage();

  // Smooth easing configuration
  const easeInOut = Easing.bezier(0.4, 0, 0.2, 1);
  const animationConfig = {
    duration: 1200,
    easing: easeInOut,
  };

  // Animation function
  const animateSymbols = useCallback(() => {
    // Reset all symbols to 0 opacity
    dollarOpacity.value = 0;
    euroOpacity.value = 0;
    poundOpacity.value = 0;
    yenOpacity.value = 0;

    // Staggered smooth fade-in animations with longer visibility
    dollarOpacity.value = withDelay(
      0,
      withTiming(1, animationConfig, () => {
        // Stay visible for 2.5 seconds, then fade out
        dollarOpacity.value = withDelay(
          2500,
          withTiming(0, { duration: 800, easing: easeInOut })
        );
      })
    );

    euroOpacity.value = withDelay(
      400,
      withTiming(1, animationConfig, () => {
        euroOpacity.value = withDelay(
          2500,
          withTiming(0, { duration: 800, easing: easeInOut })
        );
      })
    );

    poundOpacity.value = withDelay(
      800,
      withTiming(1, animationConfig, () => {
        poundOpacity.value = withDelay(
          2500,
          withTiming(0, { duration: 800, easing: easeInOut })
        );
      })
    );

    yenOpacity.value = withDelay(
      1200,
      withTiming(1, animationConfig, () => {
        yenOpacity.value = withDelay(
          2500,
          withTiming(0, { duration: 800, easing: easeInOut })
        );
      })
    );
  }, [dollarOpacity, euroOpacity, poundOpacity, yenOpacity, animationConfig, easeInOut]);

  // Start animation only once when component first mounts
  useEffect(() => {
    if (!hasStartedAnimation) {
      setHasStartedAnimation(true);

      // Start initial animation immediately
      animateSymbols();

      // Set up interval for repeated animations (only if needed)
      const interval = setInterval(animateSymbols, 7000);
      setAnimationInterval(interval as unknown as NodeJS.Timeout);
    }

    // Cleanup on unmount
    return () => {
      if (animationInterval) {
        clearInterval(animationInterval);
      }
    };
  }, [hasStartedAnimation, animateSymbols]);

  // Handle container visibility changes with exit animation
  useEffect(() => {
    if (isVisible) {
      // Show animation
      setShouldRender(true);
      containerOpacity.value = withTiming(1, {
        duration: 300,
        easing: easeInOut,
      });
      containerScale.value = withTiming(1, {
        duration: 300,
        easing: easeInOut,
      });
      logoScale.value = withTiming(1, {
        duration: 300,
        easing: easeInOut,
      });
    } else {
      // Exit animation sequence
      // 1. Fade out currency symbols quickly
      dollarOpacity.value = withTiming(0, { duration: 200, easing: easeInOut });
      euroOpacity.value = withTiming(0, { duration: 200, easing: easeInOut });
      poundOpacity.value = withTiming(0, { duration: 200, easing: easeInOut });
      yenOpacity.value = withTiming(0, { duration: 200, easing: easeInOut });

      // 2. Scale up logo slightly for "bloom" effect
      logoScale.value = withTiming(1.05, {
        duration: 300,
        easing: easeInOut,
      });

      // 3. Scale down and fade out container
      containerScale.value = withTiming(0.95, {
        duration: 500,
        easing: easeInOut,
      });

      containerOpacity.value = withTiming(0, {
        duration: 500,
        easing: easeInOut,
      }, () => {
        // 4. Unmount component after animation completes
        runOnJS(setShouldRender)(false);
      });
    }
  }, [isVisible, containerOpacity, containerScale, logoScale, dollarOpacity, euroOpacity, poundOpacity, yenOpacity, easeInOut]);

  // Animated styles for currency symbols
  const dollarStyle = useAnimatedStyle(() => ({
    opacity: dollarOpacity.value,
  }));

  const euroStyle = useAnimatedStyle(() => ({
    opacity: euroOpacity.value,
  }));

  const poundStyle = useAnimatedStyle(() => ({
    opacity: poundOpacity.value,
  }));

  const yenStyle = useAnimatedStyle(() => ({
    opacity: yenOpacity.value,
  }));

  // Container animated style with scaling
  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ scale: containerScale.value }],
  }));

  // Logo animated style with scaling
  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  if (!shouldRender) {
    return null; // Don't render anything when animation is complete
  }

  return (
    <Animated.View style={[styles.overlay, containerStyle]}>
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          {/* Logo in the center */}
          <Animated.View style={[styles.logoContainer, logoStyle]}>
            <Image
              source={require('@/assets/images/logo_light.png')}
              className="w-full z-10"
              //style={styles.logoImage}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Animated currency symbols with smooth transitions */}
          <Animated.Text style={[styles.currencySymbol, styles.dollarSymbol, dollarStyle]}>
            $
          </Animated.Text>
          <Animated.Text style={[styles.currencySymbol, styles.euroSymbol, euroStyle]}>
            €
          </Animated.Text>
          <Animated.Text style={[styles.currencySymbol, styles.poundSymbol, poundStyle]}>
            £
          </Animated.Text>
          <Animated.Text style={[styles.currencySymbol, styles.yenSymbol, yenStyle]}>
            ¥
          </Animated.Text>

          {/* Status Message */}
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>
              {statusMessage}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
});

LoadingScreen.displayName = 'LoadingScreen';

// Styles for the loading screen
const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#005EFD", // Blue background to match Figma
  },
  loadingContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  logoContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  logoImage: {
    height: 100,
  },
  currencySymbol: {
    position: "absolute",
    fontSize: 146,
    zIndex: 30,
    fontWeight: "700",
    color: "#359AF8", // Blue color for symbols
    fontFamily: "System", // Will fallback to system font
    textAlign: "center",
  },
  dollarSymbol: {
    top: "18%",
    left: "15%",
  },
  euroSymbol: {
    top: "26%",
    right: "10%",
  },
  poundSymbol: {
    bottom: "35%",
    left: "-6%",
  },
  yenSymbol: {
    bottom: "20%",
    right: "20%",
  },
  statusContainer: {
    position: "absolute",
    bottom: "10%",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    opacity: 0.9,
    letterSpacing: 0.5,
  },
});