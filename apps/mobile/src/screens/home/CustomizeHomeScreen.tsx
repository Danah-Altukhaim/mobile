import React from 'react';
import { ScrollView, StyleSheet, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text, Icon, Switch as UISwitch, type IconName } from '../../components/ui';
import { InnerScreenHeader } from '../../components/InnerScreenHeader';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useDirection } from '../../hooks/useDirection';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { haptic } from '../../utils/haptics';
import { useHomeWidgets, type WidgetId } from '../../store/home-widgets.store';
import { toLatnDigits } from '../../i18n/helpers';

export function CustomizeHomeScreen() {
  const { t, i18n } = useTranslation();
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const bottomInset = useContentBottomInset();
  const isAr = i18n.language === 'ar';

  const widgets = useHomeWidgets((s) => s.widgets);
  const showGpa = useHomeWidgets((s) => s.showGpa);
  const showBalance = useHomeWidgets((s) => s.showBalance);
  const toggle = useHomeWidgets((s) => s.toggle);
  const toggleSub = useHomeWidgets((s) => s.toggleSub);
  const move = useHomeWidgets((s) => s.move);
  const reset = useHomeWidgets((s) => s.reset);

  return (
    <View style={styles.container}>
      <InnerScreenHeader
        eyebrow={isAr ? 'مخصّص' : 'Personalize'}
        title={t('customizeHome.title')}
        subtitle={t('customizeHome.subtitle')}
      />

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: bottomInset }]} showsVerticalScrollIndicator={false}>
        <View style={styles.list}>
          {widgets.map((w, i) => {
            const meta = WIDGET_META[w.id];
            const isFirst = i === 0;
            const isLast = i === widgets.length - 1;
            return (
              <View key={w.id} style={styles.item}>
                <View style={[styles.itemRow, { flexDirection: rowDirection }]}>
                  <View style={[styles.itemLeft, { flexDirection: rowDirection }]}>
                    <View style={styles.itemIconWedge}>
                      <Icon name={meta.icon} size={18} color={colors.primary} />
                    </View>
                    <View style={styles.itemBody}>
                      <Text
                        variant="bodyBold"
                        style={[styles.itemTitle, { textAlign, writingDirection }]}
                      >
                        {t(meta.label)}
                      </Text>
                      <Text
                        variant="caption"
                        color={colors.textTertiary}
                        style={{ textAlign, writingDirection }}
                      >
                        {t(meta.description)}
                      </Text>
                    </View>
                  </View>
                  <UISwitch label="" value={w.enabled} onValueChange={() => toggle(w.id)} />
                </View>

                <View style={[styles.reorderRow, { flexDirection: rowDirection }]}>
                  <Pressable
                    onPress={() => {
                      haptic.selection();
                      move(w.id, 'up');
                    }}
                    disabled={isFirst}
                    style={[styles.reorderBtn, isFirst && styles.reorderBtnDisabled]}
                    hitSlop={8}
                    accessibilityLabel={t('customizeHome.moveUp')}
                  >
                    <Icon name="arrow-up" size={14} color={isFirst ? colors.textPlaceholder : colors.primary} />
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      haptic.selection();
                      move(w.id, 'down');
                    }}
                    disabled={isLast}
                    style={[styles.reorderBtn, isLast && styles.reorderBtnDisabled]}
                    hitSlop={8}
                    accessibilityLabel={t('customizeHome.moveDown')}
                  >
                    <Icon name="arrow-down" size={14} color={isLast ? colors.textPlaceholder : colors.primary} />
                  </Pressable>
                  <Text variant="caption" color={colors.textTertiary}>
                    {toLatnDigits(String(i + 1))} / {toLatnDigits(String(widgets.length))}
                  </Text>
                </View>

                {w.id === 'stats' && w.enabled && (
                  <View style={[styles.subSection, { borderTopColor: colors.divider }]}>
                    <SubRow
                      label={t('customizeHome.subShowGpa')}
                      value={showGpa}
                      onValueChange={() => toggleSub('showGpa')}
                    />
                    <SubRow
                      label={t('customizeHome.subShowBalance')}
                      value={showBalance}
                      onValueChange={() => toggleSub('showBalance')}
                    />
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.resetBtn,
            { opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={() => {
            haptic.warning();
            reset();
          }}
        >
          <Icon name="refresh" size={14} color={colors.brandRed} />
          <Text variant="bodyBold" color={colors.brandRed}>
            {t('customizeHome.reset')}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function SubRow({
  label, value, onValueChange,
}: { label: string; value: boolean; onValueChange: () => void }) {
  const { isRTL, textAlign, writingDirection } = useDirection();
  return (
    <View style={[styles.subRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      <Text
        variant="small"
        color={colors.textSecondary}
        style={{ flex: 1, textAlign, writingDirection }}
      >
        {label}
      </Text>
      <UISwitch label="" value={value} onValueChange={onValueChange} />
    </View>
  );
}

const WIDGET_META: Record<WidgetId, { icon: IconName; label: string; description: string }> = {
  stats: {
    icon: 'grades',
    label: 'customizeHome.widgets.stats.label',
    description: 'customizeHome.widgets.stats.description',
  },
  quickActions: {
    icon: 'target',
    label: 'customizeHome.widgets.quickActions.label',
    description: 'customizeHome.widgets.quickActions.description',
  },
  todayClasses: {
    icon: 'schedule',
    label: 'customizeHome.widgets.todayClasses.label',
    description: 'customizeHome.widgets.todayClasses.description',
  },
  deadlines: {
    icon: 'deadline',
    label: 'customizeHome.widgets.deadlines.label',
    description: 'customizeHome.widgets.deadlines.description',
  },
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.base },

  list: { gap: spacing.sm },
  item: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  itemRow: { alignItems: 'center', gap: spacing.md },
  itemLeft: { flex: 1, alignItems: 'center', gap: spacing.md },
  itemIconWedge: {
    width: 36,
    height: 36,
    backgroundColor: colors.primaryWash,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemBody: { flex: 1, minWidth: 0 },
  itemTitle: { marginBottom: 1 },

  reorderRow: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: 6,
    paddingBottom: 4,
  },
  reorderBtn: {
    width: 30,
    height: 30,
    backgroundColor: colors.primaryWash,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reorderBtnDisabled: {
    backgroundColor: colors.surfaceMuted,
    opacity: 0.5,
  },

  subSection: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  subRow: {
    alignItems: 'center',
    paddingVertical: 4,
    gap: spacing.md,
  },

  resetBtn: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.brandRedWash,
    backgroundColor: colors.brandRedTint,
  },
});
