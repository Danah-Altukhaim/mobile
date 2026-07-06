import React, { useState } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text, Icon } from '../../../components/ui';
import { colors } from '../../../theme/colors';
import { spacing, borderRadius } from '../../../theme/spacing';
import { useDirection } from '../../../hooks/useDirection';
import { toLatnDigits } from '../../../i18n/helpers';

interface Props {
  label: string;
  required?: boolean;
  helper?: string;
  onPick?: (file: { name: string; size_kb: number }) => void;
}

// Lightweight picker stub — no native file-picker dependency yet.
// On press it simulates a successful pick so form/UI flows can be exercised end-to-end.
export function FilePicker({ label, required, helper, onPick }: Props) {
  const { t } = useTranslation();
  const { isRTL, textAlign, writingDirection } = useDirection();
  const [picked, setPicked] = useState<{ name: string; size_kb: number } | null>(null);

  const handlePick = () => {
    const fake = { name: `${label.replace(/\s+/g, '_').toLowerCase()}.pdf`, size_kb: 240 };
    setPicked(fake);
    onPick?.(fake);
  };

  return (
    <View style={styles.wrapper}>
      <View style={[styles.labelRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Text variant="caption" color={colors.textSecondary} style={{ textAlign, writingDirection }}>
          {label}
          {required ? (
            <Text variant="caption" color={colors.brandRed}>
              {' *'}
            </Text>
          ) : null}
        </Text>
      </View>
      <Pressable onPress={handlePick}>
        {({ pressed }) => (
          <View
            style={[
              styles.box,
              {
                backgroundColor: picked ? colors.primaryWash : colors.surface,
                borderColor: picked ? colors.primary : colors.borderStrong,
                opacity: pressed ? 0.85 : 1,
                flexDirection: isRTL ? 'row-reverse' : 'row',
              },
            ]}
          >
            <View
              style={[
                styles.iconWedge,
                { backgroundColor: picked ? colors.primary : colors.surfaceMuted },
              ]}
            >
              <Icon
                name={picked ? 'check' : 'document'}
                size={16}
                color={picked ? colors.textInverse : colors.textSecondary}
              />
            </View>
            <View style={{ flex: 1, paddingHorizontal: spacing.sm, minWidth: 0 }}>
              <Text variant="bodyBold" style={{ textAlign, writingDirection }} numberOfLines={1}>
                {picked ? picked.name : t('services.pickFile')}
              </Text>
              {!picked ? (
                <Text
                  variant="caption"
                  color={colors.textTertiary}
                  style={{ textAlign, writingDirection, marginTop: 2 }}
                >
                  {helper || t('services.pdfOnly')}
                </Text>
              ) : (
                <Text
                  variant="caption"
                  color={colors.primary}
                  style={{ textAlign, writingDirection, marginTop: 2 }}
                >
                  {t('services.uploaded')} · {toLatnDigits(String(picked.size_kb))} KB
                </Text>
              )}
            </View>
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.base },
  labelRow: { marginBottom: 6 },
  box: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
    minHeight: 60,
    gap: spacing.sm,
  },
  iconWedge: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
