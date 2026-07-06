import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Text, Button, Input, Select, ScreenSkeleton } from '../../components/ui';
import { InnerScreenHeader } from '../../components/InnerScreenHeader';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useDirection } from '../../hooks/useDirection';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { useUIStore } from '../../store/ui.store';
import { servicesApi } from '../../services/api';
import { toLatnDigits } from '../../i18n/helpers';
import { FilePicker } from './components/FilePicker';
import { SuccessBanner } from './components/SuccessBanner';

interface Props {
  kind: 'complaint' | 'suggestion';
}

// Student Life doc caps complaint/suggestion text at 250 words.
const MAX_WORDS = 250;

/** Word count, whitespace-collapsed. Empty string counts as 0. */
function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export function FeedbackRequestScreen({ kind }: Props) {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const locale = useUIStore((s) => s.locale);
  const isAr = i18n.language === 'ar';
  const { isRTL, textAlign, writingDirection } = useDirection();
  const bottomInset = useContentBottomInset();

  const isComplaint = kind === 'complaint';

  const [department, setDepartment] = useState('');
  const [otherDepartment, setOtherDepartment] = useState('');
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const [attachment, setAttachment] = useState<{ name: string } | null>(null);
  const [refNo, setRefNo] = useState<string | null>(null);

  const detailWords = countWords(details);
  const overLimit = detailWords > MAX_WORDS;

  const { data, isLoading } = useQuery({
    queryKey: ['service', 'contact-directory'],
    queryFn: () => servicesApi.contactDirectory(),
  });

  const departments = [
    ...(data?.data || []).map((d) => ({
      value: d.id,
      label: locale === 'ar' ? d.department_ar : d.department_en,
    })),
    { value: 'other', label: t(`services.${kind}.departmentOther`) },
  ];

  const isOther = department === 'other';
  const canSubmit =
    !!department &&
    !!subject &&
    !!details &&
    !overLimit &&
    (!isOther || !!otherDepartment.trim());
  const mutation = useMutation({
    mutationFn: () =>
      servicesApi.create({
        type: kind,
        payload: {
          department: isOther ? otherDepartment.trim() : department,
          subject,
          details,
          ...(isComplaint && attachment ? { attachment: attachment.name } : {}),
        },
      }),
    onSuccess: () => {
      const seq = String(Date.now()).slice(-4);
      setRefNo(`CCK-${new Date().getFullYear()}-${seq}`);
    },
  });

  if (isLoading) return <ScreenSkeleton />;

  return (
    <View style={styles.container}>
      <InnerScreenHeader
        eyebrow={isAr
          ? (kind === 'complaint' ? 'تقديم شكوى' : 'تقديم اقتراح')
          : (kind === 'complaint' ? 'File a complaint' : 'Share a suggestion')}
        title={t(`services.letterTypes.${kind}`)}
        subtitle={t(`services.${kind}.intro`)}
      />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]} showsVerticalScrollIndicator={false}>
        {refNo && <SuccessBanner referenceNo={refNo} />}

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Select
            label={t(`services.${kind}.department`)}
            options={departments}
            value={department}
            onChange={setDepartment}
            placeholder={t('services.selectOne')}
          />
          {isOther && (
            <Input
              label={t(`services.${kind}.departmentOtherLabel`)}
              value={otherDepartment}
              onChangeText={setOtherDepartment}
            />
          )}
          <Input
            label={t(`services.${kind}.subject`)}
            value={subject}
            onChangeText={setSubject}
          />
          <Input
            label={t(`services.${kind}.details`)}
            value={details}
            onChangeText={setDetails}
            multiline
            numberOfLines={5}
          />
          <Text
            variant="caption"
            color={overLimit ? colors.brandRed : colors.textTertiary}
            style={{
              textAlign: isRTL ? 'left' : 'right',
              writingDirection,
              marginTop: -spacing.sm,
              marginBottom: spacing.sm,
            }}
          >
            {isAr
              ? `${toLatnDigits(String(detailWords))} / ${toLatnDigits(String(MAX_WORDS))} كلمة`
              : `${toLatnDigits(String(detailWords))} / ${toLatnDigits(String(MAX_WORDS))} words`}
          </Text>

          {isComplaint && (
            <>
              <Text
                variant="caption"
                color={colors.textSecondary}
                style={{ textAlign, writingDirection, marginBottom: 6 }}
              >
                {isAr
                  ? 'مرفق (صورة أو فيديو أو ملف PDF) - اختياري'
                  : 'Attachment (Image, Video or PDF) - optional'}
              </Text>
              <FilePicker
                label={isAr ? 'إرفاق ملف' : 'Attach a file'}
                helper={isAr ? 'صورة أو فيديو أو PDF' : 'Image, video or PDF'}
                onPick={setAttachment}
              />
            </>
          )}

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

export const ComplaintScreen = () => <FeedbackRequestScreen kind="complaint" />;
export const SuggestionScreen = () => <FeedbackRequestScreen kind="suggestion" />;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.base },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.base,
  },
});
