import React, { useState } from 'react';
import { FlatList, View, StyleSheet, RefreshControl, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Text, Badge, Icon, Tabs, ScreenSkeleton, EmptyState } from '../../components/ui';
import { InnerScreenHeader } from '../../components/InnerScreenHeader';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { useLocalizedField } from '../../hooks/useLocale';
import { useUIStore } from '../../store/ui.store';
import { useDirection } from '../../hooks/useDirection';
import { campusApi } from '../../services/api';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { courseColor } from '../../utils/courseColor';
import { haptic } from '../../utils/haptics';
import { toLatnDigits } from '../../i18n/helpers';

type ChannelKind = 'class' | 'club';

export function ChannelsScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const colors = useColors();
  const l = useLocalizedField();
  const locale = useUIStore((s) => s.locale);
  const intlLocale = locale === 'ar' ? 'ar-KW' : 'en-KW';
  const isAr = i18n.language === 'ar';
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const bottomInset = useContentBottomInset();

  const [tab, setTab] = useState<ChannelKind>('class');

  const classQuery = useQuery({
    queryKey: ['class-channels'],
    queryFn: () => campusApi.getClassChannels(),
  });
  const clubQuery = useQuery({
    queryKey: ['club-channels'],
    queryFn: () => campusApi.getClubChannels(),
  });

  const active = tab === 'class' ? classQuery : clubQuery;
  const channels = Array.isArray(active.data?.data) ? active.data!.data : [];

  if (classQuery.isLoading && clubQuery.isLoading) return <ScreenSkeleton />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <InnerScreenHeader
        eyebrow={isAr ? 'ابقَ على تواصل' : 'Stay in the loop'}
        title={t('campus.channels')}
        subtitle={t('campus.channelsSubtitle')}
      />

      <View style={styles.tabsWrap}>
        <Tabs
          tabs={[
            { key: 'class', label: t('campus.classChannels'), icon: 'channels' },
            { key: 'club', label: t('campus.clubChannels'), icon: 'clubs' },
          ]}
          activeKey={tab}
          onChange={(key) => setTab(key as ChannelKind)}
        />
      </View>

      <FlatList
        contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]}
        data={channels}
        keyExtractor={(item: any) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        refreshControl={
          <RefreshControl
            refreshing={active.isRefetching}
            onRefresh={active.refetch}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          active.isError ? (
            <EmptyState icon="channels" title={t('common.error')} tone="error" />
          ) : (
            <EmptyState
              icon="channels"
              title={t(tab === 'class' ? 'campus.noClassChannels' : 'campus.noClubChannels')}
              tone="neutral"
            />
          )
        }
        renderItem={({ item }: { item: any }) => {
          const isClass = tab === 'class';
          const accent = courseColor(isClass ? item.course_code : item.club_slug);
          const title = isClass
            ? `${item.course_code} · ${l(item, 'course_name')}`
            : l(item, 'club_name');
          const subtitle = isClass ? l(item, 'instructor_name') : l(item, 'advisor_name');
          const lastSent = item.last_message?.sent_at
            ? toLatnDigits(
                new Date(item.last_message.sent_at).toLocaleDateString(intlLocale, {
                  month: 'short',
                  day: 'numeric',
                }),
              )
            : '';
          const isAnnouncement = item.last_message?.is_announcement;

          return (
            <Pressable
              onPress={() => {
                haptic.selection();
                navigation.navigate('Channel', {
                  channelId: item.id,
                  kind: tab,
                  title: isClass ? l(item, 'course_name') : l(item, 'club_name'),
                });
              }}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.92 : 1 },
              ]}
            >
              <View style={[styles.accent, { backgroundColor: accent.fg }]} />
              <View style={[styles.cardRow, { flexDirection: rowDirection }]}>
                <View style={[styles.iconWedge, { backgroundColor: accent.wash }]}>
                  <Icon name={isClass ? 'channels' : 'clubs'} size={18} color={accent.fg} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={[styles.cardHeader, { flexDirection: rowDirection }]}>
                    <Text
                      variant="bodyBold"
                      style={{ flex: 1, textAlign, writingDirection }}
                      numberOfLines={1}
                    >
                      {title}
                    </Text>
                    {!!lastSent && (
                      <Text variant="caption" color={colors.textTertiary}>{lastSent}</Text>
                    )}
                  </View>
                  <Text
                    variant="caption"
                    color={colors.textSecondary}
                    style={{ textAlign, writingDirection, marginTop: 2 }}
                    numberOfLines={1}
                  >
                    {subtitle}
                  </Text>
                  <View style={[styles.previewRow, { flexDirection: rowDirection, marginTop: 6 }]}>
                    {isAnnouncement && (
                      <Badge label={t('campus.announcement')} variant="primary" size="sm" />
                    )}
                    <Text
                      variant="small"
                      color={colors.textSecondary}
                      style={{ flex: 1, textAlign, writingDirection }}
                      numberOfLines={2}
                    >
                      {l(item.last_message, 'content')}
                    </Text>
                  </View>
                </View>
                {item.unread_count > 0 && (
                  <View style={styles.unreadWrap}>
                    <Badge label={String(item.unread_count)} variant="error" solid size="sm" />
                  </View>
                )}
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.base },
  tabsWrap: { paddingHorizontal: spacing.base, paddingBottom: spacing.sm },

  card: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  accent: { height: 3 },
  cardRow: { padding: spacing.base, alignItems: 'flex-start', gap: spacing.md },
  iconWedge: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeader: { alignItems: 'center', gap: spacing.sm },
  previewRow: { alignItems: 'flex-start', gap: 8 },
  unreadWrap: { paddingTop: 2 },
});
