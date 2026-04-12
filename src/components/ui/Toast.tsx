import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Text } from './Text';
import { spacing, borderRadius } from '../../theme/spacing';
import { useDirection } from '../../hooks/useDirection';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastMessage {
  message: string;
  variant: ToastVariant;
}

interface ToastContextType {
  show: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextType>({ show: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

// Per design system: bottom center, neutral-900 bg, pearl white text
const TOAST_DURATION: Record<ToastVariant, number> = {
  info: 4000,
  success: 4000,
  warning: 4000,
  error: 6000,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timeout = useRef<ReturnType<typeof setTimeout>>();
  const { isRTL, textAlign, writingDirection } = useDirection();

  const show = useCallback(
    (message: string, variant: ToastVariant = 'info') => {
      if (timeout.current) clearTimeout(timeout.current);
      setToast({ message, variant });
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      timeout.current = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => setToast(null));
      }, TOAST_DURATION[variant]);
    },
    [opacity],
  );

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast && (
        <Animated.View style={[styles.toast, { opacity, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[styles.accent, { backgroundColor: accentColor[toast.variant] }]} />
          <Text variant="small" color="#F9FAF8" style={{ textAlign, writingDirection, flexShrink: 1 }}>
            {toast.message}
          </Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

const accentColor: Record<ToastVariant, string> = {
  success: '#3EB75E',
  error: '#E20613',
  warning: '#FF8F3C',
  info: '#1BA2DB',
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: '#181818',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.md,
    maxWidth: 320,
    shadowColor: '#1E1E1E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.20,
    shadowRadius: 12,
    elevation: 6,
    gap: spacing.sm,
  },
  accent: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    minHeight: 20,
  },
});
