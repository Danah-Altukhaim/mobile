import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View, Animated, LayoutChangeEvent } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '../ui';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { changeLanguage } from '../../i18n';
import { haptic } from '../../utils/haptics';

export function LanguageToggle() {
  const { i18n } = useTranslation();
  const colors = useColors();
  const isAr = i18n.language === 'ar';
  const [layouts, setLayouts] = useState<{ en: number; ar: number }>({ en: 0, ar: 0 });
  const indicatorX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(indicatorX, {
      toValue: isAr ? layouts.en : 0,
      useNativeDriver: false,
      speed: 22,
      bounciness: 4,
    }).start();
  }, [isAr, layouts, indicatorX]);

  const onLayout = (key: 'en' | 'ar') => (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setLayouts((p) => (p[key] === w ? p : { ...p, [key]: w }));
  };

  const switchTo = (lang: 'en' | 'ar') => {
    if (i18n.language === lang) return;
    haptic.selection();
    changeLanguage(lang);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceVariant }]}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.indicator,
          {
            backgroundColor: colors.primary,
            left: indicatorX,
            width: isAr ? layouts.ar : layouts.en,
          },
        ]}
      />
      <Pressable onPress={() => switchTo('en')} style={styles.option} onLayout={onLayout('en')}>
        <Text variant="caption" color={!isAr ? colors.textInverse : colors.textSecondary}>
          EN
        </Text>
      </Pressable>
      <Pressable onPress={() => switchTo('ar')} style={styles.option} onLayout={onLayout('ar')}>
        <Text variant="caption" color={isAr ? colors.textInverse : colors.textSecondary}>
          عربي
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 4,
    padding: 2,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    borderRadius: 3,
  },
  option: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minHeight: 32,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
});
