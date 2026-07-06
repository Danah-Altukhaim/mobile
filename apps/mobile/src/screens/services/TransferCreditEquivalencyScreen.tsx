import React, { useMemo, useState } from 'react';
import { ScrollView, View, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import {
  PROGRAMS,
  EQUIVALENCY,
  TRANSFER_CATEGORIES,
  PAAET_CATEGORY_ONE,
  transferCreditCap,
  meetsTransferGrade,
  type TransferCategory,
  type CckSchool,
} from '@masari/shared';
import { Text, Button, Input, Select, Icon, Badge } from '../../components/ui';
import { InnerScreenHeader } from '../../components/InnerScreenHeader';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useDirection } from '../../hooks/useDirection';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { servicesApi } from '../../services/api';
import { FilePicker } from './components/FilePicker';
import { SuccessBanner } from './components/SuccessBanner';
import { toLatnDigits } from '../../i18n/helpers';

interface PriorCourse {
  id: string;
  code: string;
  title: string;
  credits: string;
  grade: string;
  semester: string;
}

// PAAET is the default per the transfer-credits form; the dropdown lets students
// pick any other recognised Kuwaiti institution.
const PRIOR_INSTITUTIONS = [
  { value: 'paaet', label_en: 'PAAET', label_ar: 'الهيئة العامة للتعليم التطبيقي والتدريب' },
  { value: 'kuwait_university', label_en: 'Kuwait University', label_ar: 'جامعة الكويت' },
  { value: 'auk', label_en: 'American University of Kuwait', label_ar: 'الجامعة الأمريكية في الكويت' },
  { value: 'gust', label_en: 'Gulf University for Science & Technology', label_ar: 'جامعة الخليج للعلوم والتكنولوجيا' },
  { value: 'aum', label_en: 'American University of the Middle East', label_ar: 'الجامعة الأمريكية في الشرق الأوسط' },
  { value: 'other', label_en: 'Other (provide name)', label_ar: 'أخرى (يرجى ذكر الاسم)' },
];

function newRow(): PriorCourse {
  return {
    id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    code: '',
    title: '',
    credits: '',
    grade: '',
    semester: '',
  };
}

export function TransferCreditEquivalencyScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const isAr = i18n.language === 'ar';
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDir = isRTL ? 'row-reverse' : 'row';
  const bottomInset = useContentBottomInset();

  const [applicantName, setApplicantName] = useState('');
  const [civilId, setCivilId] = useState('');
  const [priorInstitution, setPriorInstitution] = useState('paaet');
  const [priorInstitutionOther, setPriorInstitutionOther] = useState('');
  const [transferCategory, setTransferCategory] = useState<TransferCategory>('paaet_high');
  const [targetMajor, setTargetMajor] = useState('');
  const [rows, setRows] = useState<PriorCourse[]>([newRow()]);
  const [transcript, setTranscript] = useState<{ name: string } | null>(null);
  const [descriptions, setDescriptions] = useState<{ name: string } | null>(null);
  const [cid, setCid] = useState<{ name: string } | null>(null);
  const [refNo, setRefNo] = useState<string | null>(null);

  const majorOptions = PROGRAMS.map((p) => ({ value: p.slug, label: p.name_en }));

  // §4.3 — credit cap depends on category + the CCK school the major belongs to.
  const targetSchool: CckSchool = /comp|tech|ait|engineer/i.test(targetMajor)
    ? 'advanced_technology'
    : 'business';
  const creditCap = transferCreditCap(transferCategory, targetSchool);
  const isPaaetHigh = transferCategory === 'paaet_high';

  // §4.2.5 — AI equivalency suggestions: match each entered prior course title against
  // the historical PAAET → CCK equivalency table.
  const suggestions = useMemo(() => {
    return rows
      .map((row) => {
        if (!row.title.trim() || row.title.trim().length < 3) return null;
        const needle = row.title.trim().toLowerCase();
        const match = EQUIVALENCY.find((e) =>
          e.cck_course_name.toLowerCase().includes(needle) ||
          needle.includes(e.cck_course_name.toLowerCase().split(',')[0]),
        );
        if (!match) return null;
        return { rowId: row.id, priorTitle: row.title, match };
      })
      .filter((s): s is { rowId: string; priorTitle: string; match: typeof EQUIVALENCY[number] } => !!s);
  }, [rows]);

  const validRows = rows.filter((r) => r.code && r.title && r.credits && r.grade);
  const institutionLabel =
    priorInstitution === 'other'
      ? priorInstitutionOther
      : PRIOR_INSTITUTIONS.find((p) => p.value === priorInstitution)?.[isAr ? 'label_ar' : 'label_en'] ?? '';
  const canSubmit =
    !!applicantName &&
    !!civilId &&
    !!institutionLabel &&
    !!targetMajor &&
    validRows.length > 0 &&
    !!transcript &&
    !!cid;

  const mutation = useMutation({
    mutationFn: () =>
      servicesApi.create({
        type: 'transfer_credit_equivalency',
        payload: {
          applicant_name: applicantName,
          civil_id: civilId,
          prior_institution: institutionLabel,
          transfer_category: transferCategory,
          target_major: targetMajor,
          target_school: targetSchool,
          courses: validRows,
          ai_suggestions: suggestions.map((s) => ({
            prior_title: s.priorTitle,
            cck_code: s.match.cck_code,
            cck_course_name: s.match.cck_course_name,
            cck_credit: s.match.cck_credit,
          })),
          transcript: transcript?.name,
          course_descriptions: descriptions?.name,
          civil_id_file: cid?.name,
        },
      }),
    onSuccess: () => {
      const seq = String(Date.now()).slice(-4);
      setRefNo(`CCK-${new Date().getFullYear()}-${seq}`);
    },
  });

  function patchRow(id: string, patch: Partial<PriorCourse>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  return (
    <View style={styles.container}>
      <InnerScreenHeader
        eyebrow={isAr ? 'معادلة المقررات' : 'Credit equivalency'}
        title={t('services.letterTypes.transfer_credit_equivalency')}
        subtitle={t('services.transferCredit.intro')}
      />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]} showsVerticalScrollIndicator={false}>
        {refNo && <SuccessBanner referenceNo={refNo} />}

        {/* Equivalency Screen Update — the transferable-credit rules block was removed
            per the v3 spec; eligibility is still enforced inline per course + on the cap row. */}

        {/* Applicant block */}
        <SectionTitle title={t('services.transferCredit.applicantSection')} isAr={isAr} />
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Input
            label={t('services.transferCredit.applicantName')}
            value={applicantName}
            onChangeText={setApplicantName}
          />
          <Input
            label={t('services.transferCredit.civilIdNumber')}
            value={civilId}
            onChangeText={setCivilId}
            keyboardType="number-pad"
          />
          <Select
            label={t('services.transferCredit.priorInstitution')}
            options={PRIOR_INSTITUTIONS.map((p) => ({
              value: p.value,
              label: isAr ? p.label_ar : p.label_en,
            }))}
            value={priorInstitution}
            onChange={setPriorInstitution}
          />
          {priorInstitution === 'other' && (
            <Input
              label={t('services.transferCredit.priorInstitutionOther')}
              value={priorInstitutionOther}
              onChangeText={setPriorInstitutionOther}
            />
          )}
          <Select
            label={t('services.transferCredit.transferCategory')}
            options={TRANSFER_CATEGORIES.map((c) => ({
              value: c.key,
              label: isAr ? c.label_ar : c.label_en,
            }))}
            value={transferCategory}
            onChange={(v) => setTransferCategory(v as TransferCategory)}
          />
          <Select
            label={t('services.transferCredit.targetMajor')}
            options={majorOptions}
            value={targetMajor}
            onChange={setTargetMajor}
            placeholder={t('services.selectOne')}
          />
          {creditCap > 0 && (
            <View style={[styles.capRow, { flexDirection: rowDir, backgroundColor: colors.surfaceMuted }]}>
              <Icon name="payments" size={14} color={colors.textTertiary} />
              <Text variant="caption" color={colors.textSecondary} style={{ flex: 1, textAlign, writingDirection }}>
                {t('services.transferCredit.capForCategory', {
                  cap: toLatnDigits(String(creditCap)),
                  school: isAr
                    ? (targetSchool === 'business' ? 'إدارة الأعمال' : 'التقنية المتقدمة')
                    : (targetSchool === 'business' ? 'School of Business' : 'School of Advanced Technology'),
                })}
                {isPaaetHigh ? ` · ${t('services.transferCredit.minCckGraduation', {
                  n: toLatnDigits(String(PAAET_CATEGORY_ONE.min_cck_credits_to_graduate)),
                })}` : ''}
              </Text>
            </View>
          )}
        </View>

        {/* Courses block */}
        <SectionTitle title={t('services.transferCredit.coursesSection')} isAr={isAr} />
        {rows.map((row, idx) => (
          <View key={row.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.rowHeader, { flexDirection: rowDir }]}>
              <Text variant="bodyBold" color={colors.textPrimary} style={{ flex: 1, textAlign, writingDirection }}>
                {t('services.transferCredit.courseN', { n: toLatnDigits(String(idx + 1)) })}
              </Text>
              {rows.length > 1 && (
                <Pressable onPress={() => setRows((prev) => prev.filter((r) => r.id !== row.id))}>
                  <Text variant="caption" color={colors.brandRed}>
                    {t('common.remove')}
                  </Text>
                </Pressable>
              )}
            </View>
            <Input
              label={t('services.transferCredit.priorCode')}
              value={row.code}
              onChangeText={(v) => patchRow(row.id, { code: v })}
            />
            <Input
              label={t('services.transferCredit.priorTitle')}
              value={row.title}
              onChangeText={(v) => patchRow(row.id, { title: v })}
            />
            <View style={[styles.inlineRow, { flexDirection: rowDir }]}>
              <View style={{ flex: 1 }}>
                <Input
                  label={t('services.transferCredit.priorCredits')}
                  value={row.credits}
                  onChangeText={(v) => patchRow(row.id, { credits: v.replace(/[^0-9]/g, '') })}
                  keyboardType="number-pad"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label={t('services.transferCredit.priorGrade')}
                  value={row.grade}
                  onChangeText={(v) => patchRow(row.id, { grade: v })}
                  placeholder="A / B+ / C"
                />
                {row.grade.trim() && (
                  <Badge
                    label={meetsTransferGrade(transferCategory, row.grade)
                      ? t('services.transferCredit.gradeEligible')
                      : t('services.transferCredit.gradeBelowFloor')}
                    variant={meetsTransferGrade(transferCategory, row.grade) ? 'success' : 'error'}
                    size="sm"
                  />
                )}
              </View>
            </View>
            <Input
              label={t('services.transferCredit.priorSemester')}
              value={row.semester}
              onChangeText={(v) => patchRow(row.id, { semester: v })}
              placeholder={isAr ? 'مثال: ربيع ٢٠٢٤' : 'e.g. Spring 2024'}
            />
          </View>
        ))}
        <Button
          title={t('services.transferCredit.addCourse')}
          variant="outline"
          onPress={() => setRows((prev) => [...prev, newRow()])}
          fullWidth
          style={{ marginBottom: spacing.lg }}
        />

        {/* AI-suggested equivalencies (CCK Hub Feedback v3 — "to be AI suggested"). */}
        {suggestions.length > 0 && (
          <View style={[styles.aiBlock, { backgroundColor: colors.primarySoft, borderColor: colors.primary }]}>
            <View style={[styles.rulesHeader, { flexDirection: rowDir }]}>
              <Icon name="ai" size={16} color={colors.primary} />
              <Text variant="bodyBold" color={colors.primary} style={{ flex: 1, textAlign, writingDirection }}>
                {t('services.transferCredit.aiSuggestionsTitle')}
              </Text>
            </View>
            <Text variant="caption" color={colors.textSecondary} style={{ textAlign, writingDirection, marginBottom: spacing.sm }}>
              {t('services.transferCredit.aiSuggestionsHelp')}
            </Text>
            {suggestions.map((s) => (
              <View key={s.rowId} style={[styles.aiRow, { flexDirection: rowDir }]}>
                <View style={{ flex: 1 }}>
                  <Text variant="caption" color={colors.textTertiary} style={{ textAlign, writingDirection }}>
                    {s.priorTitle}
                  </Text>
                  <Text variant="bodyBold" color={colors.textPrimary} style={{ textAlign, writingDirection, marginTop: 2 }}>
                    {s.match.cck_course_name}
                  </Text>
                  <Text variant="caption" color={colors.textSecondary} style={{ textAlign, writingDirection }}>
                    {s.match.cck_code} · {toLatnDigits(String(s.match.cck_credit))} {t('academics.credits')}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Documents */}
        <SectionTitle title={t('services.transferCredit.documentsSection')} isAr={isAr} />
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <FilePicker
            label={t('services.transferCredit.transcriptUpload')}
            helper={t('services.transferCredit.transcriptHelper')}
            required
            onPick={setTranscript}
          />
          <FilePicker
            label={t('services.transferCredit.descriptionsUpload')}
            helper={t('services.transferCredit.descriptionsHelper')}
            onPick={setDescriptions}
          />
          <FilePicker
            label={t('services.uploadCivilId')}
            helper={t('services.civilIdHelper')}
            required
            onPick={setCid}
          />
        </View>

        <Button
          title={t('services.submit')}
          onPress={() => mutation.mutate()}
          loading={mutation.isPending}
          disabled={!canSubmit || mutation.isPending}
          fullWidth
          size="large"
        />

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

function SectionTitle({ title, isAr }: { title: string; isAr: boolean }) {
  const { isRTL } = useDirection();
  return (
    <View style={[styles.sectionTitle, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      <View style={[styles.sectionMark, { backgroundColor: colors.brandRed }]} />
      <Text variant="overline" color={colors.textTertiary} style={{ letterSpacing: isAr ? 0 : 1 }}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.base },
  rulesHeader: { alignItems: 'center', gap: 8, marginBottom: spacing.sm },
  sectionTitle: {
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.sm,
  },
  sectionMark: { width: 12, height: 2 },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.base,
    marginBottom: spacing.base,
  },
  rowHeader: { alignItems: 'center', gap: 8, marginBottom: spacing.sm },
  inlineRow: { gap: spacing.sm },
  capRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.sm,
  },
  aiBlock: {
    borderWidth: 1,
    padding: spacing.base,
    marginBottom: spacing.lg,
    gap: 6,
  },
  aiRow: {
    paddingVertical: spacing.sm,
    alignItems: 'flex-start',
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
