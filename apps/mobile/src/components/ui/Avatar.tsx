import React, { useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Text } from './Text';
import { useColors } from '../../theme/useColors';

interface AvatarProps {
  uri?: string;
  name?: string;
  size?: number;
  online?: boolean;
  /** Visible accent ring, e.g. for "active" or branded identity. */
  ring?: boolean | string;
  /** Solid background tint when no image is present. Defaults to brand green. */
  tint?: string;
}

export function Avatar({
  uri,
  name,
  size = 40,
  online,
  ring,
  tint,
}: AvatarProps) {
  const colors = useColors();
  const [imageOk, setImageOk] = useState(!!uri);
  const initials = name
    ? name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : '?';

  const fontSize = Math.round(size * 0.36);
  const onlineDotSize = Math.max(10, Math.round(size * 0.22));
  const showImage = !!uri && imageOk;
  const ringColor = typeof ring === 'string' ? ring : colors.primary;
  const ringWidth = ring ? Math.max(2, Math.round(size * 0.05)) : 0;
  const inner = size - ringWidth * 2;
  const fillTint = tint ?? colors.primary;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={name}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        padding: ringWidth,
        backgroundColor: ring ? ringColor : 'transparent',
      }}
    >
      {showImage ? (
        <Image
          source={{ uri }}
          onError={() => setImageOk(false)}
          style={{
            width: inner,
            height: inner,
            borderRadius: inner / 2,
            backgroundColor: colors.surfaceVariant,
          }}
        />
      ) : (
        <View
          style={{
            backgroundColor: fillTint,
            alignItems: 'center',
            justifyContent: 'center',
            width: inner,
            height: inner,
            borderRadius: inner / 2,
          }}
        >
          <Text
            color={colors.textInverse}
            style={{
              fontSize,
              fontFamily: 'Almarai_800ExtraBold',
              includeFontPadding: false,
            }}
          >
            {initials}
          </Text>
        </View>
      )}
      {online && (
        <View
          style={[
            styles.onlineDot,
            {
              width: onlineDotSize,
              height: onlineDotSize,
              borderRadius: onlineDotSize / 2,
              borderColor: colors.surface,
              backgroundColor: colors.success,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
  },
});
