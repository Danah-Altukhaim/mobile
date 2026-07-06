import React from 'react';
import { Pressable, View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from './Text';
import { Triangle } from './Triangle';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { useDirection } from '../../hooks/useDirection';
import { haptic } from '../../utils/haptics';

interface ListItemProps {
  title: string;
  subtitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  destructive?: boolean;
  /** Removes the bottom hairline divider (use on the last row). */
  isLast?: boolean;
  style?: ViewStyle;
}

export function ListItem({
  title,
  subtitle,
  left,
  right,
  onPress,
  showChevron,
  destructive,
  isLast,
  style,
}: ListItemProps) {
  const colors = useColors();
  const { isRTL, textAlign, writingDirection } = useDirection();

  const wantChevron = onPress && !right && showChevron !== false;
  const titleColor = destructive ? colors.brandRed : colors.textPrimary;
  const subtitleColor = destructive ? colors.brandRedDark : colors.textSecondary;

  const content = (
    <>
      {left && <View style={[styles.left, { marginEnd: spacing.md }]}>{left}</View>}
      <View style={styles.content}>
        <Text
          variant="bodyBold"
          color={titleColor}
          style={{ textAlign, writingDirection }}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            variant="small"
            color={subtitleColor}
            style={{ textAlign, writingDirection, marginTop: 2 }}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {right ? (
        <View style={[styles.right, { marginStart: spacing.md }]}>{right}</View>
      ) : wantChevron ? (
        <View style={[styles.right, { marginStart: spacing.sm }]}>
          <Triangle size={7} color={colors.chevron} />
        </View>
      ) : null}
    </>
  );

  const baseStyle: ViewStyle = {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.base,
    minHeight: 56,
    borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  };

  if (!onPress) {
    return (
      <View
        style={[baseStyle, style]}
        accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
      >
        {content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={() => {
        haptic.selection();
        onPress();
      }}
      android_ripple={{ color: colors.primarySoft, foreground: false }}
      style={({ pressed }) => [
        baseStyle,
        { backgroundColor: pressed ? colors.primarySoft : 'transparent' },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  left: {},
  content: { flex: 1, minWidth: 0 },
  right: {},
});
