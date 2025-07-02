import React, { useState, useRef } from 'react';
import { View, TouchableWithoutFeedback, GestureResponderEvent, Animated } from 'react-native';
import { Text } from '@/components/ui/text';
import * as Haptics from 'expo-haptics';
import { SvgIcon } from '@/components/ui/svg-icon';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface NumericKeyboardProps {
  onNumberPress: (number: string) => void;
  onDeletePress: () => void;
  onCommaPress: () => void;
  onContinuePress: () => void;
  disabled?: boolean;
  continueDisabled?: boolean;
  continuePosition?: "top" | "bottom";
}

interface PulseProps {
  x: number;
  y: number;
  onAnimationEnd: () => void;
}

// Componente per un singolo "blob" irregolare dell'effetto pulse
const PulseBlob: React.FC<PulseProps & {
  delay?: number,
  scaleFactor?: number,
  offsetX?: number,
  offsetY?: number
}> = ({
  x,
  y,
  delay = 0,
  scaleFactor = 1,
  offsetX = 0,
  offsetY = 0,
  onAnimationEnd
}) => {
    const animation = useRef(new Animated.Value(0)).current;
    const initialSize = 60 * scaleFactor;
    const finalSize = 100 * scaleFactor;

    React.useEffect(() => {
      const animationSequence = Animated.sequence([
        Animated.delay(delay),
        Animated.timing(animation, {
          toValue: 1,
          duration: 450,
          useNativeDriver: false,
        })
      ]);

      animationSequence.start(() => {
        setTimeout(() => {
          onAnimationEnd();
        }, 50);
      });
    }, []);

    const size = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [initialSize, finalSize],
    });

    // Calcolo posizione con offset casuali per effetto irregolare
    const centerX = x - initialSize / 2 + offsetX;
    const centerY = y - initialSize / 2 + offsetY;

    const positionOffset = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, (finalSize - initialSize) / 2],
    });

    // Aggiungiamo una leggera rotazione e deformazione per rendere meno circolare
    const rotation = animation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', `${Math.random() * 20 - 10}deg`],
    });

    const scaleX = animation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 1 + Math.random() * 0.2, 1 - Math.random() * 0.1],
    });

    const scaleY = animation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 1 - Math.random() * 0.2, 1 + Math.random() * 0.1],
    });

    return (
      <Animated.View
        style={{
          position: 'absolute',
          left: Animated.subtract(centerX, positionOffset),
          top: Animated.subtract(centerY, positionOffset),
          width: size,
          height: size,
          borderRadius: Animated.divide(size, 2),
          backgroundColor: '#005EFD',
          opacity: animation.interpolate({
            inputRange: [0, 0.1, 0.4],
            outputRange: [0.15, 0.2, 0],
          }),
          transform: [
            { rotate: rotation },
            { scaleX },
            { scaleY }
          ],
          shadowColor: '#005EFD',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0.2, 0],
          }),
          shadowRadius: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [8, 20],
          }),
          zIndex: 1,
        }}
      />
    );
  };

// Componente Pulse principale che renderizza più blob sovrapposti
const Pulse: React.FC<PulseProps> = ({ x, y, onAnimationEnd }) => {
  // Generazione di offset casuali per creare un effetto irregolare
  const generateRandomOffset = () => Math.random() * 10 - 5;

  return (
    <>
      <PulseBlob
        x={x}
        y={y}
        onAnimationEnd={onAnimationEnd}
        delay={0}
        scaleFactor={1.0}
        offsetX={0}
        offsetY={0}
      />
      <PulseBlob
        x={x}
        y={y}
        onAnimationEnd={() => { }}
        delay={20}
        scaleFactor={0.9}
        offsetX={generateRandomOffset()}
        offsetY={generateRandomOffset()}
      />
      <PulseBlob
        x={x}
        y={y}
        onAnimationEnd={() => { }}
        delay={40}
        scaleFactor={0.85}
        offsetX={generateRandomOffset() * 1.5}
        offsetY={generateRandomOffset() * 1.5}
      />
    </>
  );
};

const NumericKeyboard: React.FC<NumericKeyboardProps> = ({
  onNumberPress,
  onDeletePress,
  onCommaPress,
  onContinuePress,
  disabled = false,
  continueDisabled = false,
  continuePosition = "bottom"
}) => {
  const [pulses, setPulses] = useState<{ id: number; x: number; y: number }[]>([]);
  const nextPulseId = useRef(0);
  const keypadContainerRef = useRef<View>(null);

  const createPulse = (event: GestureResponderEvent) => {
    if (disabled) return;

    // Get coordinates relative to the keypad container
    if (keypadContainerRef.current) {
      keypadContainerRef.current.measure((x, y, width, height, pageX, pageY) => {
        const touchX = event.nativeEvent.pageX - pageX;
        const touchY = event.nativeEvent.pageY - pageY;

        const newPulse = {
          id: nextPulseId.current,
          x: touchX,
          y: touchY,
        };

        nextPulseId.current += 1;
        setPulses((prev) => [...prev, newPulse]);
      });
    }
  };

  const removePulse = (id: number) => {
    setPulses((prev) => prev.filter((pulse) => pulse.id !== id));
  };

  const renderNumberKey = (value: string) => {
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onNumberPress(value);
        }}
        disabled={disabled}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <View className="h-16 w-24 items-center justify-center m-1">
          <Text className="text-3xl font-medium text-gray-700 z-10">{value}</Text>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  return (
    <View className={cn("flex-1 pb-28", continuePosition === "top" && "gap-4 p-4 pb-20")}>
      {
        continuePosition === "top" && (
          <Button onPress={onContinuePress} disabled={continueDisabled} variant="primary" size="lg" rounded="default">
            <Text className='font-sans text-lg font-bold'>Continua</Text>
          </Button>
        )
      }
      <View
        ref={keypadContainerRef}
        className="w-full bg-gray-50 p-4"
        onTouchStart={createPulse}
      >
        {/* Render all pulses in the container */}
        {pulses.map((pulse) => (
          <Pulse
            key={pulse.id}
            x={pulse.x}
            y={pulse.y}
            onAnimationEnd={() => removePulse(pulse.id)}
          />
        ))}

        <View className="flex-row justify-between mb-4">
          {renderNumberKey('1')}
          {renderNumberKey('2')}
          {renderNumberKey('3')}
        </View>
        <View className="flex-row justify-between mb-4">
          {renderNumberKey('4')}
          {renderNumberKey('5')}
          {renderNumberKey('6')}
        </View>
        <View className="flex-row justify-between mb-4">
          {renderNumberKey('7')}
          {renderNumberKey('8')}
          {renderNumberKey('9')}
        </View>
        <View className="flex-row justify-between mb-6">
          <TouchableWithoutFeedback
            onPress={onCommaPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View className="h-16 w-24 items-center justify-start m-1">
              <Text className="text-3xl font-medium text-black z-10">,</Text>
            </View>
          </TouchableWithoutFeedback>
          {renderNumberKey('0')}
          <TouchableWithoutFeedback
            onPress={onDeletePress}
            disabled={disabled}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View className="h-16 w-24 items-center justify-center m-1">
              <SvgIcon name={"delete-back"} width={24} height={24} color={"#000000"} style={{ zIndex: 10 }} />
            </View>
          </TouchableWithoutFeedback>
        </View>
        {continuePosition === "bottom" && (
          <Button onPress={onContinuePress} disabled={continueDisabled} variant="primary" size="lg" rounded="default">
            <Text className='font-sans text-lg font-bold'>Continua</Text>
          </Button>
        )}
      </View>
    </View >
  );
};

export default NumericKeyboard; 