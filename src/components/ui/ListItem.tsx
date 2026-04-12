import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from './Text';
import { useColors } from '../../theme/useColors';
import { spacing, borderRadius } from '../../theme/spacing';
import { useDirection } from '../../hooks/useDirection';

interface ListItemProps {
  title: string;
  subtitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export function ListItem({
  title,
  subtitle,
  left,
  right,
  onPress,
  style,
}: ListItemProps) {
  const colors = useColors();
  const { isRTL, textAlign, writingDirection } = useDirection();
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderRadius: borderRadius.md, flexDirection: isRTL ? 'row-reverse' : 'row' },
        style,
      ]}
      {...(onPress ? { onPress, activeOpacity: 0.7 } : {})}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
    >
      {left && <View style={isRTL ? styles.leftRTL : styles.left}>{left}</View>}
      <View style={styles.content}>
        <Text variant="body" color={colors.textPrimary} style={{ textAlign, writingDirection }}>
          {title}
        </Text>
        {subtitle && (
          <Text variant="caption" color={colors.textSecondary} style={{ textAlign, writingDirection }}>
            {subtitle}
          </Text>
        )}
      </View>
      {right && <View style={isRTL ? styles.rightRTL : styles.right}>{right}</View>}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    minHeight: 48,
  },
  left: {
    marginRight: spacing.md,
  },
  leftRTL: {
    marginLeft: spacing.md,
  },
  content: {
    flex: 1,
  },
  right: {
    marginLeft: spacing.md,
  },
  rightRTL: {
    marginRight: spacing.md,
  },
});
