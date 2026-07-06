import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle, DimensionValue, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../../theme/useColors';
import { borderRadius, spacing } from '../../theme/spacing';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius: radius = borderRadius.md,
  style,
}: SkeletonProps) {
  const colors = useColors();
  const x = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(x, {
        toValue: 1,
        duration: 1300,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [x]);

  const translate = x.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 400],
  });

  return (
    <View
      importantForAccessibility="no-hide-descendants"
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: colors.surfaceVariant,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          height: '100%',
          width: 200,
          transform: [{ translateX: translate }],
        }}
      >
        <LinearGradient
          colors={['transparent', colors.surface, 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

export function ScreenSkeleton() {
  return (
    <View style={styles.container} accessible accessibilityLabel="Loading" accessibilityRole="progressbar">
      <Skeleton height={32} width="60%" style={styles.mb} />
      <Skeleton height={120} style={styles.mb} />
      <Skeleton height={80} style={styles.mb} />
      <Skeleton height={80} style={styles.mb} />
      <Skeleton height={80} />
    </View>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <View style={styles.container} accessible accessibilityLabel="Loading" accessibilityRole="progressbar">
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.row}>
          <Skeleton height={48} width={48} borderRadius={24} />
          <View style={styles.rowText}>
            <Skeleton height={16} width="70%" style={styles.smallMb} />
            <Skeleton height={12} width="40%" />
          </View>
        </View>
      ))}
    </View>
  );
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.container} accessible accessibilityLabel="Loading" accessibilityRole="progressbar">
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.card}>
          <Skeleton height={20} width="50%" style={styles.smallMb} />
          <Skeleton height={14} width="80%" style={styles.smallMb} />
          <Skeleton height={14} width="60%" />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.base },
  mb: { marginBottom: spacing.md },
  smallMb: { marginBottom: spacing.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  rowText: {
    flex: 1,
    marginStart: spacing.md,
  },
  card: {
    padding: spacing.base,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
  },
});
