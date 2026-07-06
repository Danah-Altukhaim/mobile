import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Text, Button, Input } from '../../components/ui';
import { InnerScreenHeader } from '../../components/InnerScreenHeader';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useDirection } from '../../hooks/useDirection';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { useAuthStore } from '../../store/auth.store';
import { servicesApi } from '../../services/api';
import { FilePicker } from './components/FilePicker';
import { SuccessBanner } from './components/SuccessBanner';

type PickedFile = { name: string; size_kb: number };

const RELATION_OPTIONS = ['father', 'mother', 'spouse', 'sibling', 'guardian', 'other'] as const;
type Relation = (typeof RELATION_OPTIONS)[number];

export function ProfileUpdateScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const isAr = i18n.language === 'ar';
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDir = isRTL ? 'row-reverse' : 'row';
  const bottomInset = useContentBottomInset();
  const user = useAuthStore((s) => s.user);

  // Personal details
  const [mobile, setMobile] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [email, setEmail] = useState(user?.email ?? '');
  const [address, setAddress] = useState('');
  const [civilIdNumber, setCivilIdNumber] = useState('');
  const [civilIdExpiry, setCivilIdExpiry] = useState('');
  const [passportNumber, setPassportNumber] = useState('');

  // Emergency contact
  const [ecName, setEcName] = useState('');
  const [ecPhone, setEcPhone] = useState('');
  const [ecRelation, setEcRelation] = useState<Relation | ''>('');

  // Documents
  const [civilIdFront, setCivilIdFront] = useState<PickedFile | null>(null);
  const [civilIdBack, setCivilIdBack] = useState<PickedFile | null>(null);
  const [passportCopy, setPassportCopy] = useState<PickedFile | null>(null);
  const [photo, setPhoto] = useState<PickedFile | null>(null);

  const [refNo, setRefNo] = useState<string | null>(null);

  // Civil ID number + civil ID front are the minimum to submit a profile update.
  const canSubmit = !!civilIdNumber && !!mobile && !!civilIdFront && !!ecName && !!ecPhone;

  const mutation = useMutation({
    mutationFn: () =>
      servicesApi.create({
        type: 'profile_update' as any,
        payload: {
          mobile,
          altPhone,
          email,
          address,
          civilIdNumber,
          civilIdExpiry,
          passportNumber,
          emergencyContact: { name: ecName, phone: ecPhone, relation: ecRelation },
          docs: {
            civil_id_front: civilIdFront?.name,
            civil_id_back: civilIdBack?.name,
            passport: passportCopy?.name,
            photo: photo?.name,
          },
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
        eyebrow={isAr ? 'الملف الشخصي' : 'Profile'}
        title={t('services.profileUpdate.title')}
        subtitle={t('services.profileUpdate.subtitle')}
      />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]} showsVerticalScrollIndicator={false}>
        {refNo && (
          <SuccessBanner
            referenceNo={refNo}
            description={t('services.profileUpdate.successNote')}
          />
        )}

        <View style={[styles.notice, { backgroundColor: colors.primaryWash, borderColor: colors.primary, flexDirection: rowDir }]}>
          <Text variant="caption" color={colors.textSecondary} style={{ flex: 1, textAlign, writingDirection, lineHeight: 18 }}>
            {t('services.profileUpdate.notice')}
          </Text>
        </View>

        {/* Contact details */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text
            variant="overline"
            color={colors.textTertiary}
            style={{ textAlign, writingDirection, letterSpacing: isAr ? 0 : 1, marginBottom: spacing.sm }}
          >
            {t('services.profileUpdate.contactSection')}
          </Text>
          <Input
            label={t('services.profileUpdate.mobile')}
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
            required
            leadingIcon="phone"
          />
          <Input
            label={t('services.profileUpdate.altPhone')}
            value={altPhone}
            onChangeText={setAltPhone}
            keyboardType="phone-pad"
            leadingIcon="phone"
          />
          <Input
            label={t('services.profileUpdate.email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leadingIcon="mail"
          />
          <Input
            label={t('services.profileUpdate.address')}
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={3}
            leadingIcon="location"
            helper={t('services.profileUpdate.addressHelper')}
          />
        </View>

        {/* Identification */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text
            variant="overline"
            color={colors.textTertiary}
            style={{ textAlign, writingDirection, letterSpacing: isAr ? 0 : 1, marginBottom: spacing.sm }}
          >
            {t('services.profileUpdate.identitySection')}
          </Text>
          <Input
            label={t('services.profileUpdate.civilIdNumber')}
            value={civilIdNumber}
            onChangeText={setCivilIdNumber}
            keyboardType="number-pad"
            required
            leadingIcon="card"
          />
          <Input
            label={t('services.profileUpdate.civilIdExpiry')}
            value={civilIdExpiry}
            onChangeText={setCivilIdExpiry}
            placeholder="YYYY-MM-DD"
            helper={t('services.profileUpdate.civilIdExpiryHelper')}
          />
          <Input
            label={t('services.profileUpdate.passportNumber')}
            value={passportNumber}
            onChangeText={setPassportNumber}
            autoCapitalize="characters"
          />
        </View>

        {/* Emergency contact */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text
            variant="overline"
            color={colors.textTertiary}
            style={{ textAlign, writingDirection, letterSpacing: isAr ? 0 : 1, marginBottom: spacing.sm }}
          >
            {t('services.profileUpdate.emergencySection')}
          </Text>
          <Input
            label={t('services.profileUpdate.ecName')}
            value={ecName}
            onChangeText={setEcName}
            required
          />
          <Input
            label={t('services.profileUpdate.ecPhone')}
            value={ecPhone}
            onChangeText={setEcPhone}
            keyboardType="phone-pad"
            required
            leadingIcon="phone"
          />
          <Text
            variant="caption"
            color={colors.textSecondary}
            style={{ textAlign, writingDirection, marginBottom: 6 }}
          >
            {t('services.profileUpdate.ecRelation')}
          </Text>
          <View style={[styles.chipRow, { flexDirection: rowDir }]}>
            {RELATION_OPTIONS.map((r) => {
              const active = ecRelation === r;
              return (
                <View
                  key={r}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? colors.primary : colors.surfaceMuted,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                  onTouchEnd={() => setEcRelation(r)}
                >
                  <Text
                    variant="smallBold"
                    color={active ? colors.textInverse : colors.textSecondary}
                  >
                    {t(`services.profileUpdate.relations.${r}`)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Documents */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text
            variant="overline"
            color={colors.textTertiary}
            style={{ textAlign, writingDirection, letterSpacing: isAr ? 0 : 1, marginBottom: spacing.sm }}
          >
            {t('services.profileUpdate.documentsSection')}
          </Text>
          <FilePicker
            label={t('services.profileUpdate.civilIdFront')}
            required
            helper={t('services.civilIdHelper')}
            onPick={setCivilIdFront}
          />
          <FilePicker
            label={t('services.profileUpdate.civilIdBack')}
            helper={t('services.civilIdHelper')}
            onPick={setCivilIdBack}
          />
          <FilePicker
            label={t('services.profileUpdate.passportCopy')}
            helper={t('services.profileUpdate.passportHelper')}
            onPick={setPassportCopy}
          />
          <FilePicker
            label={t('services.profileUpdate.newPhoto')}
            helper={t('services.profileUpdate.photoHelper')}
            onPick={setPhoto}
          />
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Button
            title={t('services.submit')}
            onPress={() => mutation.mutate()}
            loading={mutation.isPending}
            disabled={!canSubmit || mutation.isPending}
            fullWidth
            size="large"
          />
          {!canSubmit && (
            <Text
              variant="caption"
              color={colors.textTertiary}
              style={{ textAlign, writingDirection, marginTop: spacing.sm }}
            >
              {t('services.profileUpdate.requiredHint')}
            </Text>
          )}
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
  content: { padding: spacing.base },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.base,
    marginBottom: spacing.base,
  },
  notice: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    marginBottom: spacing.base,
    alignItems: 'center',
    gap: spacing.sm,
  },
  chipRow: {
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
});
