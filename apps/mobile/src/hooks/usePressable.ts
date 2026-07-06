import { useRef } from 'react';
import { Animated } from 'react-native';
import { haptic } from '../utils/haptics';

type HapticKind = 'selection' | 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'none';

interface Options {
  scale?: number;
  hapticOnPress?: HapticKind;
}

/**
 * Spring-scale press animation + haptic. Returns animated style and the
 * onPressIn/onPressOut handlers to spread onto a Pressable.
 */
export function usePressable({ scale = 0.97, hapticOnPress = 'selection' }: Options = {}) {
  const v = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(v, {
      toValue: scale,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(v, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 6,
    }).start();
  };

  const onPress = () => {
    if (hapticOnPress !== 'none') haptic[hapticOnPress]();
  };

  return {
    animatedStyle: { transform: [{ scale: v }] },
    pressHandlers: { onPressIn, onPressOut },
    onPress,
  };
}
