import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { View, Animated, StyleSheet, PanResponder, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from './Text';
import { Icon, IconName } from './Icon';
import { useColors } from '../../theme/useColors';
import { spacing, borderRadius } from '../../theme/spacing';
import { useDirection } from '../../hooks/useDirection';
import { haptic } from '../../utils/haptics';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastMessage {
  id: number;
  message: string;
  variant: ToastVariant;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastContextType {
  show: (
    message: string,
    options?: { variant?: ToastVariant; actionLabel?: string; onAction?: () => void },
  ) => void;
}

const ToastContext = createContext<ToastContextType>({ show: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const TOAST_DURATION: Record<ToastVariant, number> = {
  info: 3500,
  success: 3000,
  warning: 4000,
  error: 5000,
};

const VARIANT_ICON: Record<ToastVariant, IconName> = {
  success: 'check',
  error: 'warning',
  warning: 'warning',
  info: 'notifications',
};

const HAPTIC_BY_VARIANT: Record<ToastVariant, () => void> = {
  success: () => haptic.success(),
  error: () => haptic.error(),
  warning: () => haptic.warning(),
  info: () => haptic.light(),
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<ToastMessage[]>([]);
  const [current, setCurrent] = useState<ToastMessage | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(60)).current;
  const dragX = useRef(new Animated.Value(0)).current;
  const timeout = useRef<ReturnType<typeof setTimeout>>();
  const idRef = useRef(0);
  const { isRTL, textAlign, writingDirection } = useDirection();
  const insets = useSafeAreaInsets();
  const colors = useColors();

  const show = useCallback<ToastContextType['show']>((message, options) => {
    const variant = options?.variant ?? 'info';
    const id = ++idRef.current;
    const item: ToastMessage = {
      id,
      message,
      variant,
      actionLabel: options?.actionLabel,
      onAction: options?.onAction,
    };
    setQueue((q) => [...q, item]);
  }, []);

  const dismiss = useCallback(() => {
    if (timeout.current) clearTimeout(timeout.current);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 60, duration: 180, useNativeDriver: true }),
    ]).start(() => {
      dragX.setValue(0);
      setCurrent(null);
    });
  }, [opacity, translateY, dragX]);

  // Pull next from queue
  useEffect(() => {
    if (current || queue.length === 0) return;
    const [next, ...rest] = queue;
    setQueue(rest);
    setCurrent(next);
    HAPTIC_BY_VARIANT[next.variant]();
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, speed: 16, bounciness: 6 }),
    ]).start();
    timeout.current = setTimeout(dismiss, TOAST_DURATION[next.variant]);
  }, [queue, current, opacity, translateY, dismiss]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 6,
      onPanResponderMove: (_, g) => dragX.setValue(g.dx),
      onPanResponderRelease: (_, g) => {
        if (Math.abs(g.dx) > 80) {
          Animated.timing(dragX, {
            toValue: g.dx > 0 ? 400 : -400,
            duration: 180,
            useNativeDriver: true,
          }).start(dismiss);
        } else {
          Animated.spring(dragX, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    }),
  ).current;

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {current && (
        <Animated.View
          {...panResponder.panHandlers}
          accessible
          accessibilityRole="alert"
          accessibilityLiveRegion={current.variant === 'error' ? 'assertive' : 'polite'}
          accessibilityLabel={current.message}
          style={[
            styles.toast,
            {
              bottom: insets.bottom + 16,
              opacity,
              transform: [{ translateY }, { translateX: dragX }],
              flexDirection: isRTL ? 'row-reverse' : 'row',
            },
          ]}
        >
          <View
            style={[styles.iconWrap, { backgroundColor: accentColor[current.variant] }]}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <Icon name={VARIANT_ICON[current.variant]} size={16} color="#FFFFFF" />
          </View>
          <Text
            variant="small"
            color="#F4F4F4"
            style={{ textAlign, writingDirection, flexShrink: 1, flex: 1 }}
          >
            {current.message}
          </Text>
          {current.actionLabel && current.onAction && (
            <Pressable
              onPress={() => {
                current.onAction?.();
                dismiss();
              }}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel={current.actionLabel}
            >
              <Text variant="caption" color={accentColor[current.variant]}>
                {current.actionLabel.toUpperCase()}
              </Text>
            </Pressable>
          )}
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

const accentColor: Record<ToastVariant, string> = {
  success: '#3EB75E',
  error: '#FF0000',
  warning: '#FF8F3C',
  info: '#76B82A',
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: spacing.base,
    right: spacing.base,
    alignItems: 'center',
    backgroundColor: '#1B1B1B',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    gap: spacing.md,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
