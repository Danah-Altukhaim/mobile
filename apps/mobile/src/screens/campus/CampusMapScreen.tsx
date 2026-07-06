import React, { useState, useMemo } from 'react';
import { ScrollView, View, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Text, SearchBar, Tabs, Badge, ScreenSkeleton, Icon, EmptyState, type IconName } from '../../components/ui';
import { InnerScreenHeader } from '../../components/InnerScreenHeader';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { useLocalizedField } from '../../hooks/useLocale';
import { campusApi } from '../../services/api';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { useDirection } from '../../hooks/useDirection';
import { haptic } from '../../utils/haptics';
import { toLatnDigits } from '../../i18n/helpers';

const categoryIcons: Record<string, IconName> = {
  academic: 'academics',
  services: 'building',
  library: 'library',
  religious: 'mosque',
  social: 'target',
};

export function CampusMapScreen() {
  const { t, i18n } = useTranslation();
  const l = useLocalizedField();
  const colors = useColors();
  const isAr = i18n.language === 'ar';
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const bottomInset = useContentBottomInset();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedBuilding, setSelectedBuilding] = useState<any>(null);

  const categoryColors: Record<string, { fg: string; wash: string }> = useMemo(() => ({
    academic: { fg: colors.primary, wash: colors.primaryWash },
    services: { fg: colors.info, wash: colors.infoWash },
    library: { fg: colors.secondaryDark, wash: '#EFF7E0' },
    religious: { fg: colors.secondary, wash: '#EFF7E0' },
    social: { fg: colors.success, wash: colors.successWash },
  }), [colors]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['campus-buildings'],
    queryFn: () => campusApi.getBuildings(),
  });

  if (isLoading) return <ScreenSkeleton />;
  const buildings = Array.isArray(data?.data) ? data.data : [];

  const categoryTabs = [
    { key: 'all', label: t('campus.allCategories') },
    { key: 'academic', label: t('campus.academic') },
    { key: 'services', label: t('campus.services') },
    { key: 'library', label: t('campus.library') },
    { key: 'religious', label: t('campus.religious') },
    { key: 'social', label: t('campus.socialCategory') },
  ];

  const filtered = buildings.filter((b: any) => {
    const matchesSearch =
      b.name_en.toLowerCase().includes(search.toLowerCase()) || b.name_ar.includes(search);
    const matchesCategory = activeCategory === 'all' || b.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <InnerScreenHeader
        eyebrow={isAr ? 'الحرم الجامعي' : 'Saad Al-Abdullah'}
        title={t('campus.map')}
      />

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]} showsVerticalScrollIndicator={false}>
        {/* Building wedge grid */}
        <View style={[styles.grid, { flexDirection: rowDirection }]}>
          {buildings.map((building: any) => {
            const tone = categoryColors[building.category] || { fg: colors.primary, wash: colors.primaryWash };
            const isSelected = selectedBuilding?.id === building.id;
            return (
              <Pressable
                key={building.id}
                onPress={() => {
                  haptic.selection();
                  setSelectedBuilding(isSelected ? null : building);
                }}
                style={({ pressed }) => [
                  styles.gridTile,
                  {
                    backgroundColor: isSelected ? tone.fg : tone.wash,
                    borderColor: tone.fg,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Icon
                  name={categoryIcons[building.category] || 'building'}
                  size={24}
                  color={isSelected ? colors.textInverse : tone.fg}
                />
                <Text
                  variant="caption"
                  color={isSelected ? colors.textInverse : tone.fg}
                  style={styles.tileName}
                  numberOfLines={1}
                >
                  {l(building, 'name')}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {selectedBuilding && (
          <View style={[styles.detailCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.detailHeader, { flexDirection: rowDirection }]}>
              <View style={[styles.accentBar, { backgroundColor: (categoryColors[selectedBuilding.category] || { fg: colors.primary }).fg }]} />
              <View style={{ flex: 1 }}>
                <Text variant="bodyBold" style={{ textAlign, writingDirection }}>
                  {l(selectedBuilding, 'name')}
                </Text>
                <Text variant="caption" color={colors.textTertiary} style={{ textAlign, writingDirection }}>
                  {toLatnDigits(String(selectedBuilding.floors))} {t('campus.floor')} ·{' '}
                  {toLatnDigits(String(selectedBuilding.rooms?.length || 0))} {t('campus.rooms')}
                </Text>
              </View>
            </View>
            {selectedBuilding.rooms?.length > 0 && (
              <View style={[styles.roomsRow, { flexDirection: rowDirection }]}>
                {selectedBuilding.rooms.map((room: string, i: number) => (
                  <Badge key={i} label={room} variant="neutral" size="sm" />
                ))}
              </View>
            )}
          </View>
        )}

        <View style={styles.tabsWrap}>
          <Tabs tabs={categoryTabs} activeKey={activeCategory} onChange={setActiveCategory} variant="chip" />
        </View>
        <SearchBar value={search} onChangeText={setSearch} placeholder={t('campus.searchBuilding')} />

        <View style={styles.spacer} />

        {isError ? (
          <EmptyState icon="map" title={t('common.error')} tone="error" />
        ) : filtered.length === 0 ? (
          <EmptyState icon="map" title={t('common.emptyNotifications')} tone="neutral" />
        ) : (
          <View style={[styles.list, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {filtered.map((building: any, i: number, arr: any[]) => {
              const tone = categoryColors[building.category] || { fg: colors.primary, wash: colors.primaryWash };
              const isLast = i === arr.length - 1;
              return (
                <View
                  key={building.id}
                  style={[
                    styles.row,
                    { flexDirection: rowDirection, borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth, borderBottomColor: colors.divider },
                  ]}
                >
                  <View style={[styles.iconWedge, { backgroundColor: tone.wash }]}>
                    <Icon name={categoryIcons[building.category] || 'building'} size={16} color={tone.fg} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text variant="bodyBold" style={{ textAlign, writingDirection }}>
                      {l(building, 'name')}
                    </Text>
                    <Text variant="caption" color={colors.textTertiary} style={{ textAlign, writingDirection, marginTop: 2 }}>
                      {toLatnDigits(String(building.floors))} {t('campus.floor')} ·{' '}
                      {toLatnDigits(String(building.rooms?.length || 0))} {t('campus.rooms')}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.base },

  grid: {
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  gridTile: {
    width: '30.5%',
    aspectRatio: 1,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
    gap: 6,
  },
  tileName: { textAlign: 'center', fontSize: 10, lineHeight: 13 },

  detailCard: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.base,
    marginBottom: spacing.base,
  },
  detailHeader: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  accentBar: { width: 3, height: 36 },
  roomsRow: {
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },

  tabsWrap: {
    marginBottom: spacing.sm,
  },
  spacer: { height: spacing.base },

  list: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  row: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWedge: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
