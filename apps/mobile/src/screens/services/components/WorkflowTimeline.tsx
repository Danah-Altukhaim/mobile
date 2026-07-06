import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../../../components/ui';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { useUIStore } from '../../../store/ui.store';
import { useDirection } from '../../../hooks/useDirection';
import type { ServiceRequestStep } from '@masari/shared';

interface Props {
  steps: ServiceRequestStep[];
}

export function WorkflowTimeline({ steps }: Props) {
  const locale = useUIStore((s) => s.locale);
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDir = isRTL ? 'row-reverse' : 'row';

  return (
    <View>
      {steps.map((step, idx) => {
        const isDone = step.state === 'done';
        const isCurrent = step.state === 'current';
        const isRejected = step.state === 'rejected';
        const dotColor = isRejected
          ? colors.error
          : isDone
            ? colors.success
            : isCurrent
              ? colors.primary
              : colors.borderStrong;
        const labelColor = isDone || isCurrent || isRejected ? colors.textPrimary : colors.textTertiary;
        const label = locale === 'ar' ? step.label_ar : step.label_en;
        const comment = locale === 'ar' ? step.comment_ar : step.comment_en;

        return (
          <View key={step.key} style={[styles.row, { flexDirection: rowDir }]}>
            <View style={styles.indicator}>
              <View
                style={[
                  styles.square,
                  { backgroundColor: dotColor },
                ]}
              />
              {idx < steps.length - 1 && (
                <View
                  style={[
                    styles.line,
                    {
                      backgroundColor: isRejected
                        ? colors.error
                        : isDone
                          ? colors.success
                          : colors.divider,
                    },
                  ]}
                />
              )}
            </View>
            <View style={styles.content}>
              <Text variant="bodyBold" color={labelColor} style={{ textAlign, writingDirection }}>
                {label}
              </Text>
              {comment && (
                <Text
                  variant="caption"
                  color={isRejected ? colors.error : colors.textSecondary}
                  style={{ textAlign, writingDirection, marginTop: 2 }}
                >
                  {comment}
                </Text>
              )}
              {step.timestamp && (
                <Text variant="caption" color={colors.textTertiary} style={{ textAlign, writingDirection }}>
                  {new Date(step.timestamp).toLocaleString(locale === 'ar' ? 'ar-KW' : 'en-KW')}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'flex-start', paddingVertical: 4 },
  indicator: { alignItems: 'center', width: 18 },
  square: { width: 10, height: 10 },
  line: { width: 2, flex: 1, marginTop: 2, minHeight: 22 },
  content: { flex: 1, paddingHorizontal: spacing.sm, paddingBottom: spacing.sm },
});
