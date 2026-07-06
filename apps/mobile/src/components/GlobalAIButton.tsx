import React, { useEffect, useRef } from 'react';
import { Pressable, View, StyleSheet, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from './ui/Icon';
import { colors } from '../theme/colors';
import { borderRadius } from '../theme/spacing';
import { useDirection } from '../hooks/useDirection';
import { haptic } from '../utils/haptics';

const TAB_BAR_HEIGHT = 56;

export function GlobalAIButton() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { isRTL } = useDirection();
  const insets = useSafeAreaInsets();
  const scale = useRef(new Animated.Value(1)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(6000),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const openAI = () => {
    haptic.medium();
    const parent = navigation.getParent();
    if (parent) parent.navigate('AIAdvisor');
    else navigation.navigate('AIAdvisor');
  };

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.92, useNativeDriver: true, speed: 30, bounciness: 0 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }).start();

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0] });

  const bottom = insets.bottom + TAB_BAR_HEIGHT + 12;

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        { bottom },
        isRTL ? { left: 16 } : { right: 16 },
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.pulseRing,
          {
            backgroundColor: colors.secondary,
            opacity: ringOpacity,
            transform: [{ scale: ringScale }],
          },
        ]}
      />
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          style={styles.fab}
          onPress={openAI}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          accessibilityRole="button"
          accessibilityLabel={t('home.aiAdvisor')}
        >
          <Icon name="ai" size={24} color={colors.textInverse} />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1E1E1E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  pulseRing: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: borderRadius.xl,
  },
});
