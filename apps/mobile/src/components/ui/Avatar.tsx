import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Text } from './Text';
import { useColors } from '../../theme/useColors';

interface AvatarProps {
  uri?: string;
  name?: string;
  size?: number;
  online?: boolean;
}

export function Avatar({ uri, name, size = 40, online }: AvatarProps) {
  const colors = useColors();
  const initials = name
    ? name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : '?';

  const fontSize = Math.round(size * 0.35);
  const onlineDotSize = Math.round(size * 0.22);

  return (
    <View style={{ width: size, height: size }}>
      {uri ? (
        <Image
          source={{ uri }}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.surfaceVariant,
          }}
        />
      ) : (
        <View
          style={{
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            width: size,
            height: size,
            borderRadius: size / 2,
          }}
        >
          <Text
            variant="caption"
            color={colors.textInverse}
            style={{ fontSize, fontFamily: 'Almarai_700Bold', lineHeight: size }}
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
    backgroundColor: '#3AA36B',
    borderWidth: 2,
  },
});
