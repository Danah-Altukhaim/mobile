import React, { useState, useMemo } from 'react';
import { ScrollView, View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Text, Card, SearchBar, Tabs, Badge, ScreenSkeleton, Icon } from '../../components/ui';
import type { IconName } from '../../components/ui';
import { useColors } from '../../theme/useColors';
import { spacing, borderRadius } from '../../theme/spacing';
import { useLocalizedField } from '../../hooks/useLocale';
import { campusApi } from '../../services/api';
import { useDirection } from '../../hooks/useDirection';

const categoryIcons: Record<string, IconName> = {
  academic: 'academics',
  services: 'building',
  library: 'library',
  religious: 'mosque',
  social: 'target',
};

export function CampusMapScreen() {
  const { t } = useTranslation();
  const l = useLocalizedField();
  const colors = useColors();
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedBuilding, setSelectedBuilding] = useState<any>(null);

  const categoryColors: Record<string, string> = useMemo(() => ({
    academic: colors.primary,
    services: colors.info,
    library: colors.accent || '#8B5CF6',
    religious: colors.secondary,
    social: colors.success,
  }), [colors]);

  const { data, isLoading } = useQuery({
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
    const matchesSearch = b.name_en.toLowerCase().includes(search.toLowerCase()) || b.name_ar.includes(search);
    const matchesCategory = activeCategory === 'all' || b.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text variant="h2" style={[styles.title, { textAlign, writingDirection }]}>{t('campus.map')}</Text>

      {/* Campus Grid */}
      <View style={[styles.grid, { flexDirection: rowDirection }]}>
        {buildings.map((building: any) => {
          const color = categoryColors[building.category] || colors.primary;
          return (
            <TouchableOpacity
              key={building.id}
              style={[styles.gridTile, { backgroundColor: color + '20', borderColor: color }]}
              onPress={() => setSelectedBuilding(selectedBuilding?.id === building.id ? null : building)}
              activeOpacity={0.7}
            >
              <Icon name={categoryIcons[building.category] || 'building'} size={28} color={color} />
              <Text variant="small" color={color} style={styles.tileName} numberOfLines={1}>
                {l(building, 'name')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selected Building Detail */}
      {selectedBuilding && (
        <Card elevation="md" style={styles.detailCard}>
          <Text variant="h3" style={{ textAlign, writingDirection }}>{l(selectedBuilding, 'name')}</Text>
          <Text variant="caption" color={colors.textSecondary} style={{ textAlign, writingDirection }}>
            {selectedBuilding.floors} {t('campus.floor')} • {selectedBuilding.rooms?.length || 0} {t('campus.rooms')}
          </Text>
          {selectedBuilding.rooms?.length > 0 && (
            <View style={[styles.roomsRow, { flexDirection: rowDirection }]}>
              {selectedBuilding.rooms.map((room: string, i: number) => (
                <Badge key={i} label={room} variant="neutral" />
              ))}
            </View>
          )}
        </Card>
      )}

      {/* Category Filter + Search */}
      <Tabs tabs={categoryTabs} activeKey={activeCategory} onChange={setActiveCategory} />
      <View style={styles.spacer} />
      <SearchBar value={search} onChangeText={setSearch} placeholder={t('campus.searchBuilding')} />
      <View style={styles.spacer} />

      {/* Building List */}
      {filtered.map((building: any) => {
        const color = categoryColors[building.category] || colors.primary;
        return (
          <Card key={building.id} elevation="sm" style={styles.card}>
            <View style={[styles.row, { flexDirection: rowDirection }]}>
              <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
                <Icon name={categoryIcons[building.category] || 'building'} size={20} color={color} />
              </View>
              <View style={styles.buildingInfo}>
                <Text variant="bodyBold" style={{ textAlign, writingDirection }}>{l(building, 'name')}</Text>
                <Text variant="caption" color={colors.textSecondary} style={{ textAlign, writingDirection }}>
                  {building.floors} {t('campus.floor')} • {building.rooms?.length || 0} {t('campus.rooms')}
                </Text>
              </View>
            </View>
          </Card>
        );
      })}

      {filtered.length === 0 && (
        <Text variant="body" color={colors.textSecondary} style={styles.empty}>{t('common.emptyNotifications')}</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.base, paddingBottom: 100 },
  title: { marginBottom: spacing.base },
  grid: { flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.base },
  gridTile: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
  },
  tileName: { textAlign: 'center', fontWeight: '600', fontSize: 11, marginTop: spacing.xs },
  detailCard: { marginBottom: spacing.base },
  roomsRow: { flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
  spacer: { height: spacing.sm },
  card: { marginBottom: spacing.sm },
  row: { alignItems: 'center', gap: spacing.md },
  iconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  buildingInfo: { flex: 1 },
  empty: { textAlign: 'center', marginTop: spacing.xl },
});
