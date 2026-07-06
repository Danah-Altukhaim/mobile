import React, { useEffect, useRef } from 'react';
import {
  View,
  Modal,
  Pressable,
  StyleSheet,
  Animated,
  ViewStyle,
  Easing,
  Dimensions,
} from 'react-native';
import { useColors } from '../../theme/useColors';
import { spacing, borderRadius } from '../../theme/spacing';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  /** Announced to screen readers when the sheet opens. */
  accessibilityLabel?: string;
}

const { height: SCREEN_H } = Dimensions.get('window');

export function BottomSheet({
  visible,
  onClose,
  children,
  style,
  accessibilityLabel,
}: BottomSheetProps) {
  const colors = useColors();
  const translate = useRef(new Animated.Value(SCREEN_H)).current;
  const overlay = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(overlay, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(translate, {
          toValue: 0,
          useNativeDriver: true,
          speed: 18,
          bounciness: 4,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(overlay, {
          toValue: 0,
          duration: 180,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translate, {
          toValue: SCREEN_H,
          duration: 220,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, overlay, translate]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Animated.View
          style={[styles.overlay, { opacity: overlay }]}
          pointerEvents={visible ? 'auto' : 'none'}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
          />
        </Animated.View>
        <Animated.View
          accessibilityViewIsModal
          accessibilityLabel={accessibilityLabel}
          style={[
            styles.sheet,
            { backgroundColor: colors.surface, transform: [{ translateY: translate }] },
            style,
          ]}
        >
          <View
            style={[styles.handle, { backgroundColor: colors.borderStrong }]}
            importantForAccessibility="no"
          />
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 14, 11, 0.45)',
  },
  sheet: {
    borderTopStartRadius: borderRadius.xl,
    borderTopEndRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: 10,
    maxHeight: '88%',
    shadowColor: '#0E2A1B',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.16,
    shadowRadius: 30,
    elevation: 20,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.base,
  },
});
