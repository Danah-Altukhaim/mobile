import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { Text } from './Text';
import { useColors } from '../../theme/useColors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  /** 0..1 */
  progress: number;
  size?: number;
  strokeWidth?: number;
  /** Hex from / to for the gradient stroke */
  from?: string;
  to?: string;
  trackColor?: string;
  /** Big number rendered inside the ring */
  value?: string;
  /** Small label above value */
  label?: string;
  /** Small caption below value */
  caption?: string;
  /** Tone of inner text */
  tone?: 'default' | 'inverse';
}

export function ProgressRing({
  progress,
  size = 140,
  strokeWidth = 10,
  from,
  to,
  trackColor,
  value,
  label,
  caption,
  tone = 'default',
}: ProgressRingProps) {
  const colors = useColors();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const animated = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animated, {
      toValue: Math.max(0, Math.min(1, progress)),
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress, animated]);

  const dashoffset = animated.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const labelColor = tone === 'inverse' ? colors.textInverse : colors.textTertiary;
  const valueColor = tone === 'inverse' ? colors.textInverse : colors.textPrimary;
  const captionColor = tone === 'inverse' ? colors.textInverse : colors.textTertiary;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Defs>
          <SvgGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={from || colors.secondary} />
            <Stop offset="1" stopColor={to || colors.primary} />
          </SvgGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor || (tone === 'inverse' ? 'rgba(255,255,255,0.18)' : colors.surfaceVariant)}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#ring-grad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashoffset as any}
        />
      </Svg>
      <View
        style={{
          position: 'absolute',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {label && (
          <Text variant="overline" color={labelColor} style={{ opacity: 0.75 }}>
            {label}
          </Text>
        )}
        {value && (
          <Text
            color={valueColor}
            style={{
              fontFamily: 'Almarai_800ExtraBold',
              fontSize: Math.round(size * 0.26),
              lineHeight: Math.round(size * 0.30),
            }}
          >
            {value}
          </Text>
        )}
        {caption && (
          <Text variant="caption" color={captionColor} style={{ opacity: 0.85, marginTop: 2 }}>
            {caption}
          </Text>
        )}
      </View>
    </View>
  );
}
