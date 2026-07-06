import React, { useMemo, useState } from 'react';
import { ScrollView, View, Pressable, Linking, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Text, Icon, ScreenSkeleton, SearchBar, Badge, EmptyState } from '../../components/ui';
import { InnerScreenHeader } from '../../components/InnerScreenHeader';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useDirection } from '../../hooks/useDirection';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { useUIStore } from '../../store/ui.store';
import { servicesApi } from '../../services/api';
import { haptic } from '../../utils/haptics';

export function ContactDirectoryScreen() {
  const { t, i18n } = useTranslation();
  const locale = useUIStore((s) => s.locale);
  const isAr = i18n.language === 'ar';
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDir = isRTL ? 'row-reverse' : 'row';
  const [query, setQuery] = useState('');
  const bottomInset = useContentBottomInset();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['service', 'contact-directory'],
    queryFn: () => servicesApi.contactDirectory(),
  });

  const filtered = useMemo(() => {
    const list = data?.data || [];
    if (!query) return list;
    const q = query.toLowerCase();
    return list.filter(
      (d) =>
        d.department_en.toLowerCase().includes(q) ||
        d.department_ar.includes(query) ||
        d.email.toLowerCase().includes(q),
    );
  }, [data, query]);

  if (isLoading) return <ScreenSkeleton />;

  return (
    <View style={styles.container}>
      <InnerScreenHeader
        eyebrow={isAr ? 'تواصل مع' : 'Reach out'}
        title={t('services.directory.title')}
        subtitle={t('services.directory.subtitle')}
      />
      <View style={styles.searchWrap}>
        <SearchBar value={query} onChangeText={setQuery} placeholder={t('common.search')} />
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]} showsVerticalScrollIndicator={false}>
        {isError ? (
          <EmptyState icon="people" title={t('common.error')} tone="error" />
        ) : filtered.length === 0 ? (
          <EmptyState icon="people" title={t('common.noData')} tone="neutral" />
        ) : (
          filtered.map((entry) => (
            <View
              key={entry.id}
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={[styles.row, { flexDirection: rowDir }]}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text variant="bodyBold" style={{ textAlign, writingDirection }}>
                    {locale === 'ar' ? entry.department_ar : entry.department_en}
                  </Text>
                  <Text
                    variant="caption"
                    color={colors.textSecondary}
                    style={{ textAlign, writingDirection, marginTop: 2 }}
                  >
                    {entry.email}
                  </Text>
                  {entry.phone && (
                    <Text
                      variant="caption"
                      color={colors.textSecondary}
                      style={{ textAlign, writingDirection }}
                    >
                      {entry.phone}
                    </Text>
                  )}
                </View>
                <Badge
                  label={t(`services.category.${entry.category === 'academic' ? 'admissions' : entry.category}`)}
                  variant="primary"
                  size="sm"
                />
              </View>
              <View style={[styles.actions, { flexDirection: rowDir, borderTopColor: colors.divider }]}>
                <Pressable
                  style={({ pressed }) => [
                    styles.actionBtn,
                    { backgroundColor: pressed ? colors.primary : colors.primaryWash },
                  ]}
                  onPress={() => {
                    haptic.selection();
                    Linking.openURL(`mailto:${entry.email}`);
                  }}
                >
                  {({ pressed }) => (
                    <>
                      <Icon name="mail" size={14} color={pressed ? colors.textInverse : colors.primary} />
                      <Text variant="smallBold" color={pressed ? colors.textInverse : colors.primary}>
                        {t('services.directory.emailDept')}
                      </Text>
                    </>
                  )}
                </Pressable>
                {entry.phone && (
                  <Pressable
                    style={({ pressed }) => [
                      styles.actionBtn,
                      { backgroundColor: pressed ? colors.primary : colors.primaryWash },
                    ]}
                    onPress={() => {
                      haptic.selection();
                      Linking.openURL(`tel:${entry.phone!.replace(/\s+/g, '')}`);
                    }}
                  >
                    {({ pressed }) => (
                      <>
                        <Icon name="phone" size={14} color={pressed ? colors.textInverse : colors.primary} />
                        <Text variant="smallBold" color={pressed ? colors.textInverse : colors.primary}>
                          {t('services.directory.callDept')}
                        </Text>
                      </>
                    )}
                  </Pressable>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchWrap: { paddingHorizontal: spacing.base, paddingBottom: spacing.sm },
  content: { padding: spacing.base },

  card: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.base,
    marginBottom: spacing.sm,
  },
  row: { alignItems: 'flex-start', gap: spacing.sm },
  actions: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
