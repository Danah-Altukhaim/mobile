import React, { useState, useEffect, useRef } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
  View,
  LayoutChangeEvent,
} from 'react-native';
import { Text } from './Text';
import { Icon, IconName } from './Icon';
import { useColors } from '../../theme/useColors';
import { spacing, borderRadius } from '../../theme/spacing';
import { useDirection } from '../../hooks/useDirection';
import { haptic } from '../../utils/haptics';

interface Tab {
  key: string;
  label: string;
  icon?: IconName;
  badge?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeKey: string;
  onChange: (key: string) => void;
  /** `pill` → segmented track; `underline` → editorial; `chip` → free-floating. */
  variant?: 'pill' | 'underline' | 'chip';
}

export function Tabs({ tabs, activeKey, onChange, variant = 'pill' }: TabsProps) {
  const colors = useColors();
  const { isRTL } = useDirection();
  const [layouts, setLayouts] = useState<Record<string, { x: number; w: number }>>({});
  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorW = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const layout = layouts[activeKey];
    if (!layout) return;
    Animated.parallel([
      Animated.spring(indicatorX, {
        toValue: layout.x,
        useNativeDriver: false,
        speed: 24,
        bounciness: 4,
      }),
      Animated.spring(indicatorW, {
        toValue: layout.w,
        useNativeDriver: false,
        speed: 24,
        bounciness: 4,
      }),
    ]).start();
  }, [activeKey, layouts, indicatorX, indicatorW]);

  const trackStyle =
    variant === 'pill'
      ? {
          backgroundColor: colors.surfaceMuted,
          borderRadius: borderRadius.md,
          padding: 4,
        }
      : undefined;

  return (
    <View style={styles.outer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.container,
          { flexDirection: isRTL ? 'row-reverse' : 'row' },
        ]}
      >
        <View
          style={[
            styles.row,
            trackStyle,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
        >
          {variant === 'pill' && (
            <Animated.View
              style={[
                styles.pillIndicator,
                {
                  backgroundColor: colors.surface,
                  left: indicatorX,
                  width: indicatorW,
                },
              ]}
            />
          )}
          {tabs.map((tab) => {
            const isActive = tab.key === activeKey;
            const activeColor =
              variant === 'pill' ? colors.primary : colors.primary;
            const inactiveColor = colors.textTertiary;
            return (
              <Pressable
                key={tab.key}
                onLayout={(e: LayoutChangeEvent) => {
                  const { x, width } = e.nativeEvent.layout;
                  setLayouts((prev) =>
                    prev[tab.key]?.x === x && prev[tab.key]?.w === width
                      ? prev
                      : { ...prev, [tab.key]: { x, w: width } },
                  );
                }}
                style={[
                  styles.tab,
                  variant === 'underline' && styles.tabUnderline,
                  variant === 'chip' && {
                    backgroundColor: isActive ? colors.primaryWash : colors.surfaceMuted,
                    borderRadius: borderRadius.sm,
                    marginEnd: 6,
                  },
                ]}
                onPress={() => {
                  if (isActive) return;
                  haptic.selection();
                  onChange(tab.key);
                }}
                accessibilityRole="tab"
                accessibilityLabel={tab.label}
                accessibilityState={{ selected: isActive }}
              >
                <View
                  style={[
                    styles.tabContent,
                    { flexDirection: isRTL ? 'row-reverse' : 'row' },
                  ]}
                >
                  {tab.icon && (
                    <Icon
                      name={tab.icon}
                      size={15}
                      color={isActive ? activeColor : inactiveColor}
                    />
                  )}
                  <Text
                    variant="smallBold"
                    color={isActive ? activeColor : inactiveColor}
                  >
                    {tab.label}
                  </Text>
                  {tab.badge != null && tab.badge > 0 && (
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: colors.brandRed },
                      ]}
                    >
                      <Text
                        variant="caption"
                        color={colors.textInverse}
                        style={styles.badgeText}
                      >
                        {tab.badge > 99 ? '99+' : String(tab.badge)}
                      </Text>
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })}
          {variant === 'underline' && (
            <Animated.View
              style={[
                styles.underlineIndicator,
                {
                  backgroundColor: colors.primary,
                  left: indicatorX,
                  width: indicatorW,
                },
              ]}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {},
  container: {
    paddingVertical: spacing.xs,
  },
  row: {
    position: 'relative',
    alignItems: 'center',
    gap: 2,
  },
  tab: {
    paddingVertical: 11,
    paddingHorizontal: spacing.base,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  tabUnderline: {
    paddingHorizontal: spacing.md,
    paddingBottom: 12,
  },
  tabContent: {
    alignItems: 'center',
    gap: 6,
  },
  pillIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    zIndex: 0,
    shadowColor: '#0E2A1B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  underlineIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 2,
  },
  badge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    lineHeight: 12,
  },
});
