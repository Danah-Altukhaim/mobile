import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Text, Button, Input, Tabs, Icon } from '../../components/ui';
import { InnerScreenHeader } from '../../components/InnerScreenHeader';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useDirection } from '../../hooks/useDirection';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { servicesApi } from '../../services/api';
import { FilePicker } from './components/FilePicker';
import { SuccessBanner } from './components/SuccessBanner';

type Path = 'local_club' | 'amateur';

export function SportDiscountScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const isAr = i18n.language === 'ar';
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDir = isRTL ? 'row-reverse' : 'row';
  const bottomInset = useContentBottomInset();

  const [path, setPath] = useState<Path>('local_club');
  const [club, setClub] = useState('');
  const [coachNotes, setCoachNotes] = useState('');
  const [clubLetter, setClubLetter] = useState<{ name: string } | null>(null);
  const [cid, setCid] = useState<{ name: string } | null>(null);
  const [refNo, setRefNo] = useState<string | null>(null);

  const canSubmit =
    !!cid && (path === 'local_club' ? !!club && !!clubLetter : true);

  const mutation = useMutation({
    mutationFn: () =>
      servicesApi.create({
        type: 'sport_discount',
        payload: {
          path,
          club,
          coach_notes: coachNotes,
          club_letter: clubLetter?.name,
          civil_id: cid?.name,
        },
      }),
    onSuccess: () => {
      const seq = String(Date.now()).slice(-4);
      setRefNo(`CCK-${new Date().getFullYear()}-${seq}`);
    },
  });

  return (
    <View style={styles.container}>
      <InnerScreenHeader
        eyebrow={isAr ? 'خصم الرياضي' : 'Athlete benefit'}
        title={t('services.letterTypes.sport_discount')}
        subtitle={t('services.sport.intro')}
      />
      <View style={styles.tabsWrap}>
        <Tabs
          tabs={[
            { key: 'local_club', label: t('services.sport.localClubTab') },
            { key: 'amateur', label: t('services.sport.amateurTab') },
          ]}
          activeKey={path}
          onChange={(k) => {
            setPath(k as Path);
            setRefNo(null);
          }}
        />
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]} showsVerticalScrollIndicator={false}>
        {refNo && <SuccessBanner referenceNo={refNo} />}

        {/* Eligibility note — explains the difference between paths */}
        <View style={[styles.note, { backgroundColor: colors.primaryWash, borderColor: colors.primary }]}>
          <View style={[styles.noteHeader, { flexDirection: rowDir }]}>
            <Icon name="warning" size={14} color={colors.primary} />
            <Text variant="bodyBold" color={colors.primary} style={{ flex: 1, textAlign, writingDirection }}>
              {path === 'local_club'
                ? t('services.sport.localClubTitle')
                : t('services.sport.amateurTitle')}
            </Text>
          </View>
          <Text variant="caption" color={colors.textPrimary} style={{ textAlign, writingDirection, lineHeight: 18 }}>
            {path === 'local_club'
              ? t('services.sport.localClubDesc')
              : t('services.sport.amateurDesc')}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {path === 'local_club' && (
            <>
              <Input
                label={t('services.sport.clubName')}
                value={club}
                onChangeText={setClub}
                placeholder={isAr ? 'اسم النادي الرياضي' : 'Sports club name'}
              />
              <FilePicker
                label={t('services.sport.clubLetterUpload')}
                helper={t('services.sport.clubLetterHelper')}
                required
                onPick={setClubLetter}
              />
            </>
          )}
          {path === 'amateur' && (
            <Input
              label={t('services.sport.coachNotes')}
              value={coachNotes}
              onChangeText={setCoachNotes}
              multiline
              numberOfLines={3}
              placeholder={t('services.sport.coachNotesPlaceholder')}
            />
          )}
          <FilePicker
            label={t('services.sport.cidUpload')}
            helper={t('services.sport.cidHelper')}
            required
            onPick={setCid}
          />
          <Button
            title={t('services.submit')}
            onPress={() => mutation.mutate()}
            loading={mutation.isPending}
            disabled={!canSubmit || mutation.isPending}
            fullWidth
            size="large"
            style={{ marginTop: spacing.sm }}
          />
        </View>

        {refNo && (
          <Button
            title={t('services.openMyRequests')}
            variant="outline"
            onPress={() => navigation.navigate('MyRequests')}
            fullWidth
            style={{ marginTop: spacing.base }}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  tabsWrap: { paddingHorizontal: spacing.base, paddingVertical: spacing.sm },
  content: { padding: spacing.base },
  note: {
    borderWidth: 1,
    padding: spacing.base,
    marginBottom: spacing.base,
    gap: spacing.xs,
  },
  noteHeader: { alignItems: 'center', gap: 8, marginBottom: 6 },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.base,
  },
});
