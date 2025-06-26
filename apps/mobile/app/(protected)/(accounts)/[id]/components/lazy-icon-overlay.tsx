import React, { useState, useEffect } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { SvgIcon } from '@/components/ui/svg-icon';
import { IconName } from '@/components/ui/icons';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

// Lazy load icons in chunks to prevent memory bloat
const ICON_CHUNKS = {
  finance: ['bank', 'bank-card', 'cash', 'wallet', 'pig-money'] as IconName[],
  general: ['box', 'target', 'calendar', 'document'] as IconName[],
  actions: ['add', 'edit', 'delete', 'link'] as IconName[],
} as const;

interface LazyIconOverlayProps {
  visible: boolean;
  selectedIcon: string;
  onIconSelect: (icon: string) => void;
  onClose: () => void;
  backdropOpacity: Animated.SharedValue<number>;
  contentOpacity: Animated.SharedValue<number>;
  panelScale: Animated.SharedValue<number>;
  panelTranslateY: Animated.SharedValue<number>;
}

export const LazyIconOverlay = React.memo<LazyIconOverlayProps>(({
  visible,
  selectedIcon,
  onIconSelect,
  onClose,
  backdropOpacity,
  contentOpacity,
  panelScale,
  panelTranslateY
}) => {
  const [loadedChunks, setLoadedChunks] = useState<Set<keyof typeof ICON_CHUNKS>>(new Set());
  const [activeChunk, setActiveChunk] = useState<keyof typeof ICON_CHUNKS>('finance');

  // Only load icons when overlay becomes visible
  useEffect(() => {
    if (visible && loadedChunks.size === 0) {
      // Load first chunk immediately
      setLoadedChunks(new Set(['finance']));

      // Load other chunks progressively
      const timeouts = [
        setTimeout(() => setLoadedChunks(prev => new Set([...prev, 'general'])), 300),
        setTimeout(() => setLoadedChunks(prev => new Set([...prev, 'actions'])), 600),
      ];

      return () => timeouts.forEach(clearTimeout);
    }
  }, [visible, loadedChunks.size]);

  // Reset loaded chunks when overlay closes to free memory
  useEffect(() => {
    if (!visible) {
      const timeout = setTimeout(() => {
        setLoadedChunks(new Set());
      }, 1000); // Delay to allow closing animation

      return () => clearTimeout(timeout);
    }
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const overlayContentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const panelStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: panelScale.value },
      { translateY: panelTranslateY.value },
    ],
  }));

  // Memoized icon button component
  const IconButton = React.memo<{ icon: IconName; isSelected: boolean }>(({ icon, isSelected }) => (
    <Pressable
      className={`w-16 h-16 rounded-xl items-center justify-center mx-2 mb-4 ${isSelected ? 'bg-blue-500' : 'bg-gray-100'
        }`}
      onPress={() => onIconSelect(icon)}
    >
      <SvgIcon
        name={icon}
        width={24}
        height={24}
        color={isSelected ? '#FFFFFF' : '#6B7280'}
      />
    </Pressable>
  ));

  // Memoized chunk content
  const ChunkContent = React.memo<{ chunkName: keyof typeof ICON_CHUNKS }>(({ chunkName }) => {
    if (!loadedChunks.has(chunkName)) {
      return (
        <View className="flex-row flex-wrap justify-center py-4">
          {Array.from({ length: ICON_CHUNKS[chunkName].length }, (_, i) => (
            <View key={i} className="w-16 h-16 rounded-xl bg-gray-200 mx-2 mb-4 animate-pulse" />
          ))}
        </View>
      );
    }

    return (
      <View className="flex-row flex-wrap justify-center">
        {ICON_CHUNKS[chunkName].map((icon) => (
          <IconButton
            key={icon}
            icon={icon}
            isSelected={selectedIcon === icon}
          />
        ))}
      </View>
    );
  });

  if (!visible) return null;

  return (
    <View className="absolute inset-0 z-50">
      {/* Backdrop */}
      <Animated.View
        style={[backdropStyle]}
        className="absolute inset-0 bg-black bg-opacity-50"
      >
        <Pressable
          className="flex-1"
          onPress={onClose}
        />
      </Animated.View>

      {/* Content */}
      <Animated.View
        style={[overlayContentStyle]}
        className="flex-1 items-center justify-center px-4"
      >
        <Animated.View
          style={[panelStyle]}
          className="bg-white rounded-3xl p-6 w-full max-w-sm max-h-96"
        >
          <Text className="text-xl font-semibold text-center mb-6">
            Scegli un'icona
          </Text>

          {/* Category Tabs */}
          <View className="flex-row justify-center mb-4">
            {Object.keys(ICON_CHUNKS).map((chunk) => (
              <Pressable
                key={chunk}
                className={`px-4 py-2 mx-1 rounded-lg ${activeChunk === chunk ? 'bg-blue-500' : 'bg-gray-100'
                  }`}
                onPress={() => setActiveChunk(chunk as keyof typeof ICON_CHUNKS)}
              >
                <Text className={`text-sm font-medium capitalize ${activeChunk === chunk ? 'text-white' : 'text-gray-700'
                  }`}>
                  {chunk}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Icons Grid - Only show active chunk */}
          <ScrollView
            className="max-h-48"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 8 }}
          >
            <ChunkContent chunkName={activeChunk} />
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </View>
  );
}); 