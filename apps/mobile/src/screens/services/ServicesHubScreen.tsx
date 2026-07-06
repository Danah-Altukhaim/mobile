import React from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Text, Icon, Triangle, type IconName } from '../../components/ui';
import { ScreenHeader } from '../../components/ScreenHeader';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useDirection } from '../../hooks/useDirection';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { haptic } from '../../utils/haptics';
import type { ServiceRequestType } from '@masari/shared';
import type { ServicesStackParamList } from '../../navigation/types';

type ListTile = {
  kind: 'list';
  key: string;
  icon: IconName;
  titleKey: string;
  descriptionKey?: string;
  types: ServiceRequestType[];
  formRoute: keyof ServicesStackParamList;
  formParams?: Record<string, unknown>;
};

type DirectTile = {
  kind: 'direct';
  key: string;
  icon: IconName;
  titleKey: string;
  // Inline bilingual label used when there is no locale key for the tile.
  titleInline?: { en: string; ar: string };
  route: keyof ServicesStackParamList;
  params?: Record<string, unknown>;
};

// Cross-tab tile — jumps to a screen owned by a different bottom-tab stack.
type CrossTabTile = {
  kind: 'crossTab';
  key: string;
  icon: IconName;
  titleKey: string;
  tab: string;
  screen: string;
};

type Tile = ListTile | DirectTile | CrossTabTile;

type Group = { titleKey: string; tiles: Tile[] };

const groups: Group[] = [
  {
    titleKey: 'services.groups.letters',
    tiles: [
      { kind: 'list', key: 'twimc', icon: 'document', titleKey: 'services.letterTypes.twimc', descriptionKey: 'services.letterDescriptions.twimc', types: ['twimc'], formRoute: 'LetterRequest', formParams: { serviceType: 'twimc' } },
      { kind: 'list', key: 'balance', icon: 'card', titleKey: 'services.letterTypes.twimc_balance', descriptionKey: 'services.letterDescriptions.twimc_balance', types: ['twimc_balance'], formRoute: 'LetterRequest', formParams: { serviceType: 'twimc_balance' } },
      { kind: 'list', key: 'puc_with', icon: 'document', titleKey: 'services.letterTypes.puc_letter_with_stipend', descriptionKey: 'services.letterDescriptions.puc_letter_with_stipend', types: ['puc_letter_with_stipend'], formRoute: 'LetterRequest', formParams: { serviceType: 'puc_letter_with_stipend' } },
      { kind: 'list', key: 'puc_no', icon: 'document', titleKey: 'services.letterTypes.puc_letter_no_stipend', descriptionKey: 'services.letterDescriptions.puc_letter_no_stipend', types: ['puc_letter_no_stipend'], formRoute: 'LetterRequest', formParams: { serviceType: 'puc_letter_no_stipend' } },
      { kind: 'direct', key: 'expected_grad', icon: 'document', titleKey: '', titleInline: { en: 'Expected Graduation Docs', ar: 'مستندات المتوقع تخرجهم' }, route: 'LetterRequest', params: { serviceType: 'expected_graduation_docs' } },
      { kind: 'crossTab', key: 'transcript', icon: 'transcript', titleKey: 'academics.transcriptRequest', tab: 'AcademicsTab', screen: 'TranscriptRequest' },
    ],
  },
  {
    titleKey: 'services.groups.registration',
    tiles: [
      { kind: 'list', key: 'absence', icon: 'attendance', titleKey: 'services.letterTypes.absence_excuse', descriptionKey: 'services.letterDescriptions.absence_excuse', types: ['absence_excuse'], formRoute: 'ExcusedAbsence' },
      { kind: 'list', key: 'sem_withdraw', icon: 'close', titleKey: 'services.letterTypes.semester_withdrawal', descriptionKey: 'services.letterDescriptions.semester_withdrawal', types: ['semester_withdrawal'], formRoute: 'WithdrawalRequest', formParams: { kind: 'semester' } },
      { kind: 'list', key: 'col_withdraw', icon: 'warning', titleKey: 'services.letterTypes.college_withdrawal', descriptionKey: 'services.letterDescriptions.college_withdrawal', types: ['college_withdrawal'], formRoute: 'WithdrawalRequest', formParams: { kind: 'college' } },
      { kind: 'list', key: 'appeal', icon: 'priority-high', titleKey: 'services.letterTypes.grade_appeal', descriptionKey: 'services.letterDescriptions.grade_appeal', types: ['grade_appeal'], formRoute: 'GradeAppeal' },
      { kind: 'list', key: 'transfer_credit', icon: 'document', titleKey: 'services.letterTypes.transfer_credit_equivalency', descriptionKey: 'services.letterDescriptions.transfer_credit_equivalency', types: ['transfer_credit_equivalency'], formRoute: 'TransferCreditEquivalency' },
      { kind: 'direct', key: 'profile_update', icon: 'pencil', titleKey: 'services.profileUpdate.title', route: 'ProfileUpdate' },
    ],
  },
  {
    titleKey: 'services.groups.finance',
    tiles: [
      { kind: 'list', key: 'social', icon: 'people', titleKey: 'services.letterTypes.social_allowance', descriptionKey: 'services.letterDescriptions.social_allowance', types: ['social_allowance'], formRoute: 'SocialAllowance' },
      { kind: 'list', key: 'bank', icon: 'bank', titleKey: 'services.letterTypes.bank_details_change', descriptionKey: 'services.letterDescriptions.bank_details_change', types: ['bank_details_change'], formRoute: 'BankDetailsChange' },
      { kind: 'list', key: 'sport', icon: 'thumbs-up', titleKey: 'services.letterTypes.sport_discount', descriptionKey: 'services.letterDescriptions.sport_discount', types: ['sport_discount'], formRoute: 'SportDiscount' },
    ],
  },
  {
    titleKey: 'services.groups.studentLife',
    tiles: [
      { kind: 'list', key: 'id_lost', icon: 'profile', titleKey: 'services.letterTypes.student_id_lost', descriptionKey: 'services.letterDescriptions.student_id_lost', types: ['student_id_lost', 'student_id_photo'], formRoute: 'StudentIdServices' },
      { kind: 'direct', key: 'directory', icon: 'people', titleKey: 'services.directory.title', route: 'ContactDirectory' },
    ],
  },
  {
    titleKey: 'services.groups.support',
    tiles: [
      { kind: 'direct', key: 'helpdesk', icon: 'settings', titleKey: 'services.helpdesk.title', route: 'Helpdesk' },
      { kind: 'list', key: 'complaint', icon: 'warning', titleKey: 'services.letterTypes.complaint', types: ['complaint'], formRoute: 'Complaint' },
      { kind: 'list', key: 'suggestion', icon: 'comment', titleKey: 'services.letterTypes.suggestion', types: ['suggestion'], formRoute: 'Suggestion' },
    ],
  },
];

export function ServicesHubScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const isAr = i18n.language === 'ar';
  const bottomInset = useContentBottomInset();

  return (
    <View style={styles.container}>
      <ScreenHeader title={t('services.title')} subtitle={t('services.subtitle')} />

      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: bottomInset }]} showsVerticalScrollIndicator={false}>
        {/* MY REQUESTS — solid green hero card */}
        <Pressable
          onPress={() => {
            haptic.selection();
            navigation.navigate('MyRequests');
          }}
          style={({ pressed }) => [
            styles.myRequestsCard,
            { backgroundColor: colors.primary, opacity: pressed ? 0.92 : 1 },
          ]}
          accessibilityRole="button"
        >
          <View style={[styles.myRequestsRow, { flexDirection: rowDirection }]}>
            <View style={styles.myRequestsIcon}>
              <Icon name="assignments" size={22} color={colors.textInverse} />
            </View>
            <View style={{ flex: 1, paddingHorizontal: spacing.base }}>
              <Text variant="bodyBold" color={colors.textInverse} style={{ textAlign, writingDirection }}>
                {t('services.myRequests')}
              </Text>
              <Text
                variant="caption"
                color="rgba(255,255,255,0.78)"
                style={{ textAlign, writingDirection, marginTop: 2 }}
              >
                {t('services.openMyRequests')}
              </Text>
            </View>
            <Triangle size={10} color={colors.brandRed} />
          </View>
          <View style={[styles.myRequestsStripe, { backgroundColor: colors.brandRed }]} />
        </Pressable>

        {groups.map((group) => (
          <View key={group.titleKey} style={styles.group}>
            <View style={[styles.groupHeader, { flexDirection: rowDirection }]}>
              <View style={styles.groupMark} />
              <Text
                variant="overline"
                color={colors.textTertiary}
                style={{ letterSpacing: isAr ? 0 : 1 }}
              >
                {t(group.titleKey)}
              </Text>
            </View>
            <View style={[styles.grid, { flexDirection: rowDirection }]}>
              {group.tiles.map((tile) => (
                <View key={tile.key} style={styles.tileWrap}>
                  <Pressable
                    onPress={() => {
                      haptic.selection();
                      if (tile.kind === 'crossTab') {
                        navigation
                          .getParent()
                          ?.navigate(tile.tab as never, { screen: tile.screen } as never);
                      } else if (tile.kind === 'direct') {
                        navigation.navigate(tile.route as never, tile.params as never);
                      } else {
                        navigation.navigate('ServiceRequestList' as never, {
                          titleKey: tile.titleKey,
                          descriptionKey: tile.descriptionKey,
                          types: tile.types,
                          formRoute: tile.formRoute,
                          formParams: tile.formParams,
                        } as never);
                      }
                    }}
                    style={({ pressed }) => [
                      styles.tile,
                      pressed && { transform: [{ scale: 0.98 }] },
                    ]}
                    accessibilityRole="button"
                  >
                    <View style={styles.tileIconWedge}>
                      <Icon name={tile.icon} size={20} color={colors.primary} />
                    </View>
                    <Text
                      variant="smallBold"
                      style={[styles.tileLabel, { textAlign: 'center' }]}
                      numberOfLines={3}
                    >
                      {tile.kind === 'direct' && tile.titleInline
                        ? (isAr ? tile.titleInline.ar : tile.titleInline.en)
                        : t(tile.titleKey)}
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { padding: spacing.base },

  myRequestsCard: {
    padding: spacing.base,
    marginBottom: spacing.xl,
    overflow: 'hidden',
  },
  myRequestsRow: { alignItems: 'center' },
  myRequestsIcon: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  myRequestsStripe: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },

  group: { marginBottom: spacing.xl },
  groupHeader: {
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.sm,
  },
  groupMark: {
    width: 12,
    height: 2,
    backgroundColor: colors.secondary,
  },

  grid: { flexWrap: 'wrap', marginHorizontal: -spacing.xs },
  tileWrap: { width: '50%', padding: spacing.xs },
  tile: {
    minHeight: 110,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  tileIconWedge: {
    width: 40,
    height: 40,
    backgroundColor: colors.primaryWash,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: { fontSize: 12, lineHeight: 16 },
});
