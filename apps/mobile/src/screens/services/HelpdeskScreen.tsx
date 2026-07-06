import React, { useMemo, useState } from 'react';
import { ScrollView, View, Pressable, Linking, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { HELPDESK_DEPARTMENTS } from '@masari/shared';
import { Text, Icon, Select, Button, Input, Triangle } from '../../components/ui';
import { InnerScreenHeader } from '../../components/InnerScreenHeader';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useDirection } from '../../hooks/useDirection';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { useUIStore } from '../../store/ui.store';
import { haptic } from '../../utils/haptics';
import { toLatnDigits } from '../../i18n/helpers';

// Students are redirected to Microsoft Teams from the hub (CCK Hub IT dept doc).
const TEAMS_URL = 'https://teams.microsoft.com';
// University webmail — Outlook on the web (CCK Hub IT dept doc).
const OUTLOOK_URL = 'https://outlook.office.com';
// Tickets for an unlisted department fall back to the general helpdesk inbox.
const GENERAL_EMAIL = 'helpdesk@cck.edu.kw';
const OTHER = 'other';
const MAX_WORDS = 250;
const MAX_ATTACHMENTS = 5;

// CCK Hub IT Department doc groups IT issues under three named categories.
// The screen renders this grouping; issue slugs reference helpdesk.ts.
const IT_CATEGORIES: { en: string; ar: string; slugs: string[] }[] = [
  {
    en: 'Account & Access Issues',
    ar: 'مشاكل الحساب والوصول',
    slugs: ['login', 'email-activation', 'password-reset', 'office-activation'],
  },
  {
    en: 'SIS & LMS',
    ar: 'نظام معلومات الطلبة ونظام التعلم',
    slugs: ['timetable-sis', 'course-not-in-lms', 'sis-lms-mismatch', 'lms-file-upload'],
  },
  {
    en: 'Technical Support & Device Issues',
    ar: 'الدعم الفني ومشاكل الأجهزة',
    slugs: ['seb', 'ipad-display', 'navigation-help'],
  },
];

// Short IT support FAQ surfaced beneath the ticket form (inline bilingual).
const IT_FAQ: { q_en: string; q_ar: string; a_en: string; a_ar: string }[] = [
  {
    q_en: 'How do I reset my password?',
    q_ar: 'كيف أعيد تعيين كلمة المرور؟',
    a_en: 'Submit a "Password reset request" ticket below under Account & Access Issues. The IT team will send a reset link to your registered email.',
    a_ar: 'قدّم تذكرة "طلب إعادة تعيين كلمة المرور" أدناه ضمن مشاكل الحساب والوصول. سيرسل فريق تقنية المعلومات رابط إعادة التعيين إلى بريدك المسجّل.',
  },
  {
    q_en: 'How do I activate Microsoft Office on my device?',
    q_ar: 'كيف أفعّل Microsoft Office على جهازي؟',
    a_en: 'Sign in to Office with your university email, then activate. If activation fails, raise an "Microsoft Office activation" ticket.',
    a_ar: 'سجّل الدخول إلى Office باستخدام بريدك الجامعي ثم فعّله. إذا فشل التفعيل، قدّم تذكرة "تفعيل Microsoft Office".',
  },
  {
    q_en: 'My university email is not working - what do I do?',
    q_ar: 'بريدي الجامعي لا يعمل - ماذا أفعل؟',
    a_en: 'Check Outlook on the web using the link above. If you still cannot sign in, submit an "Email activation" ticket.',
    a_ar: 'تحقق من Outlook عبر الويب باستخدام الرابط أعلاه. إذا تعذّر عليك تسجيل الدخول، قدّم تذكرة "تفعيل البريد الإلكتروني".',
  },
  {
    q_en: 'Safe Exam Browser (SEB) will not open or close - what should I do?',
    q_ar: 'متصفح الاختبارات الآمن (SEB) لا يفتح أو لا يُغلق - ماذا أفعل؟',
    a_en: 'Restart your device and reinstall the latest SEB version. If the issue continues, raise a "Safe Exam Browser" ticket before your exam.',
    a_ar: 'أعد تشغيل جهازك وأعد تثبيت أحدث إصدار من SEB. إذا استمرت المشكلة، قدّم تذكرة "متصفح الاختبارات الآمن" قبل اختبارك.',
  },
  {
    q_en: 'My timetable does not show in SIS on my iPhone/iPad - how do I fix it?',
    q_ar: 'جدولي الدراسي لا يظهر في نظام معلومات الطلبة على iPhone/iPad - كيف أصلحه؟',
    a_en: 'Open SIS in Safari and refresh the page. If the timetable is still missing, submit a "Timetable not showing in SIS" ticket.',
    a_ar: 'افتح نظام معلومات الطلبة في Safari وحدّث الصفحة. إذا ظل الجدول غير ظاهر، قدّم تذكرة "الجدول لا يظهر في النظام".',
  },
];

/** Word count, whitespace-collapsed. Empty string counts as 0. */
function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export function HelpdeskScreen() {
  const { t, i18n } = useTranslation();
  const locale = useUIStore((s) => s.locale);
  const isAr = i18n.language === 'ar';
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDir = isRTL ? 'row-reverse' : 'row';
  const bottomInset = useContentBottomInset();

  const [departmentSlug, setDepartmentSlug] = useState('');
  const [issueSlug, setIssueSlug] = useState('');
  const [otherText, setOtherText] = useState('');
  const [extraDetails, setExtraDetails] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  // Attachments are a UI-only placeholder: mailto can't carry files, so picked
  // screenshots are listed by name and noted in the ticket body.
  const [attachments, setAttachments] = useState<string[]>([]);
  const [attachCounter, setAttachCounter] = useState(0);

  const department = useMemo(
    () => HELPDESK_DEPARTMENTS.find((d) => d.slug === departmentSlug) ?? null,
    [departmentSlug],
  );
  const issue = useMemo(
    () => department?.issues.find((i) => i.slug === issueSlug) ?? null,
    [department, issueSlug],
  );

  // Every dropdown ends with an "Other" option for edge cases not listed.
  const departmentOptions = [
    ...HELPDESK_DEPARTMENTS.map((d) => ({
      value: d.slug,
      label: locale === 'ar' ? d.name_ar : d.name_en,
    })),
    { value: OTHER, label: t('services.helpdesk.otherOption') },
  ];
  const issueOptions = [
    ...(department?.issues ?? []).map((i) => ({
      value: i.slug,
      label: locale === 'ar' ? i.label_ar : i.label_en,
    })),
    { value: OTHER, label: t('services.helpdesk.otherOption') },
  ];

  const departmentIsOther = departmentSlug === OTHER;
  const departmentIsIt = departmentSlug === 'it';
  const issueIsOther = issueSlug === OTHER;
  // The free-text bubble shows when either dropdown lands on "Other".
  const needsOtherText = departmentIsOther || issueIsOther;

  const words = countWords(otherText);
  const overLimit = words > MAX_WORDS;
  const otherTextValid = words > 0 && !overLimit;

  const detailWords = countWords(extraDetails);
  const detailsOverLimit = detailWords > MAX_WORDS;

  const issueResolved = departmentIsOther || !!issueSlug;
  const canSubmit =
    !!departmentSlug &&
    issueResolved &&
    (!needsOtherText || otherTextValid) &&
    !detailsOverLimit;

  function addAttachment() {
    if (attachments.length >= MAX_ATTACHMENTS) return;
    haptic.selection();
    const n = attachCounter + 1;
    setAttachCounter(n);
    setAttachments((prev) => [...prev, `screenshot-${n}.png`]);
  }

  function removeAttachment(index: number) {
    haptic.selection();
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  function submitTicket() {
    if (!canSubmit) return;
    haptic.selection();
    const deptName = department ? department.name_en : 'General';
    const email = department ? department.email : GENERAL_EMAIL;
    const issueName = departmentIsOther
      ? 'Other'
      : issueIsOther
        ? 'Other'
        : issue?.label_en ?? '';
    const subject = encodeURIComponent(`[${deptName}] ${issueName}`);
    const parts: string[] = [];
    if (needsOtherText) parts.push(otherText.trim());
    if (extraDetails.trim()) parts.push(`Additional details:\n${extraDetails.trim()}`);
    if (attachments.length) {
      parts.push(`Attachments:\n${attachments.map((a) => `- ${a}`).join('\n')}`);
    }
    const body = parts.length ? `&body=${encodeURIComponent(parts.join('\n\n'))}` : '';
    Linking.openURL(`mailto:${email}?subject=${subject}${body}`);
  }

  return (
    <View style={styles.container}>
      <InnerScreenHeader
        eyebrow={isAr ? 'الدعم' : 'Support'}
        title={t('services.helpdesk.title')}
        subtitle={t('services.helpdesk.subtitle')}
      />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]} showsVerticalScrollIndicator={false}>
        {/* Two dependent dropdowns: department, then department-scoped issue. */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Select
            label={t('services.helpdesk.departmentLabel')}
            options={departmentOptions}
            value={departmentSlug}
            onChange={(v) => {
              setDepartmentSlug(v);
              setIssueSlug('');
              setOtherText('');
            }}
            placeholder={t('services.helpdesk.departmentPlaceholder')}
          />
          {/* Issue picker is hidden when the department itself is "Other". */}
          {/* IT issues are grouped under the three named categories (IT doc). */}
          {!departmentIsOther && departmentIsIt && (
            <View style={{ marginBottom: spacing.sm }}>
              <Text
                variant="caption"
                color={colors.textSecondary}
                style={{ textAlign, writingDirection, marginBottom: spacing.sm }}
              >
                {t('services.helpdesk.issueLabel')}
              </Text>
              {IT_CATEGORIES.map((cat) => {
                const catIssues = (department?.issues ?? []).filter((i) =>
                  cat.slugs.includes(i.slug),
                );
                if (catIssues.length === 0) return null;
                return (
                  <View key={cat.en} style={styles.itCategory}>
                    <View style={[styles.itCategoryHead, { flexDirection: rowDir }]}>
                      <View style={styles.itCategoryMark} />
                      <Text
                        variant="overline"
                        color={colors.textTertiary}
                        style={{ letterSpacing: isAr ? 0 : 1 }}
                      >
                        {isAr ? cat.ar : cat.en}
                      </Text>
                    </View>
                    {catIssues.map((iss, idx) => {
                      const selected = issueSlug === iss.slug;
                      return (
                        <Pressable
                          key={iss.slug}
                          onPress={() => {
                            haptic.selection();
                            setIssueSlug(iss.slug);
                            setOtherText('');
                          }}
                          style={[
                            styles.itIssueRow,
                            {
                              flexDirection: rowDir,
                              borderTopWidth: idx === 0 ? 0 : StyleSheet.hairlineWidth,
                              borderTopColor: colors.divider,
                              backgroundColor: selected ? colors.primaryWash : 'transparent',
                            },
                          ]}
                        >
                          <Icon
                            name={selected ? 'check' : 'document'}
                            size={14}
                            color={selected ? colors.primary : colors.textTertiary}
                          />
                          <Text
                            variant="small"
                            color={selected ? colors.primary : colors.textPrimary}
                            style={{ flex: 1, textAlign, writingDirection }}
                          >
                            {isAr ? iss.label_ar : iss.label_en}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                );
              })}
              {/* "Other" still available for IT edge cases. */}
              <Pressable
                onPress={() => {
                  haptic.selection();
                  setIssueSlug(OTHER);
                  setOtherText('');
                }}
                style={[
                  styles.itIssueRow,
                  {
                    flexDirection: rowDir,
                    borderTopWidth: StyleSheet.hairlineWidth,
                    borderTopColor: colors.divider,
                    backgroundColor: issueIsOther ? colors.primaryWash : 'transparent',
                  },
                ]}
              >
                <Icon
                  name={issueIsOther ? 'check' : 'document'}
                  size={14}
                  color={issueIsOther ? colors.primary : colors.textTertiary}
                />
                <Text
                  variant="small"
                  color={issueIsOther ? colors.primary : colors.textPrimary}
                  style={{ flex: 1, textAlign, writingDirection }}
                >
                  {t('services.helpdesk.otherOption')}
                </Text>
              </Pressable>
            </View>
          )}

          {!departmentIsOther && !departmentIsIt && (
            <>
              <Select
                label={t('services.helpdesk.issueLabel')}
                options={issueOptions}
                value={issueSlug}
                onChange={(v) => {
                  setIssueSlug(v);
                  setOtherText('');
                }}
                placeholder={
                  department
                    ? t('services.helpdesk.issuePlaceholder')
                    : t('services.helpdesk.issueDisabled')
                }
              />
              {!department && (
                <Text
                  variant="caption"
                  color={colors.textTertiary}
                  style={{ textAlign, writingDirection, marginTop: -spacing.sm, marginBottom: spacing.sm }}
                >
                  {t('services.helpdesk.pickDepartmentFirst')}
                </Text>
              )}
            </>
          )}

          {/* Free-text bubble for edge cases — capped at 250 words. */}
          {needsOtherText && (
            <View>
              <Input
                label={t('services.helpdesk.otherLabel')}
                value={otherText}
                onChangeText={setOtherText}
                placeholder={t('services.helpdesk.otherPlaceholder')}
                multiline
                numberOfLines={5}
              />
              <Text
                variant="caption"
                color={overLimit ? colors.brandRed : colors.textTertiary}
                style={{ textAlign: isRTL ? 'left' : 'right', writingDirection, marginTop: -spacing.sm }}
              >
                {t('services.helpdesk.wordCount', {
                  words: toLatnDigits(String(words)),
                  max: toLatnDigits(String(MAX_WORDS)),
                })}
              </Text>
            </View>
          )}
        </View>

        {/* Optional extra details + screenshot attachments — for any ticket */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text variant="smallBold" color={colors.textPrimary} style={{ textAlign, writingDirection, marginBottom: spacing.sm }}>
            {t('services.helpdesk.detailsTitle')}
          </Text>
          <Input
            label={t('services.helpdesk.detailsLabel')}
            value={extraDetails}
            onChangeText={setExtraDetails}
            placeholder={t('services.helpdesk.detailsPlaceholder')}
            multiline
            numberOfLines={4}
          />
          {extraDetails.trim().length > 0 && (
            <Text
              variant="caption"
              color={detailsOverLimit ? colors.brandRed : colors.textTertiary}
              style={{ textAlign: isRTL ? 'left' : 'right', writingDirection, marginTop: -spacing.sm }}
            >
              {t('services.helpdesk.wordCount', {
                words: toLatnDigits(String(detailWords)),
                max: toLatnDigits(String(MAX_WORDS)),
              })}
            </Text>
          )}

          <Text variant="smallBold" color={colors.textPrimary} style={{ textAlign, writingDirection, marginTop: spacing.xs }}>
            {t('services.helpdesk.attachmentsLabel')}
          </Text>
          <Text variant="caption" color={colors.textTertiary} style={{ textAlign, writingDirection, marginTop: 2 }}>
            {t('services.helpdesk.attachmentsHint')}
          </Text>

          {attachments.length > 0 && (
            <View style={styles.attachmentList}>
              {attachments.map((name, i) => (
                <View
                  key={name}
                  style={[styles.attachmentChip, { flexDirection: rowDir, borderColor: colors.border, backgroundColor: colors.background }]}
                >
                  <Icon name="image" size={14} color={colors.primary} />
                  <Text
                    variant="caption"
                    color={colors.textSecondary}
                    numberOfLines={1}
                    style={{ flex: 1, textAlign, writingDirection }}
                  >
                    {name}
                  </Text>
                  <Pressable
                    hitSlop={8}
                    onPress={() => removeAttachment(i)}
                    accessibilityLabel={t('services.helpdesk.removeAttachment')}
                  >
                    <Icon name="close" size={14} color={colors.textTertiary} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          {attachments.length < MAX_ATTACHMENTS ? (
            <Pressable
              style={({ pressed }) => [
                styles.actionBtn,
                { backgroundColor: pressed ? colors.primary : colors.surface, borderColor: colors.primary, marginTop: spacing.sm },
              ]}
              onPress={addAttachment}
            >
              {({ pressed }) => (
                <>
                  <Icon name="attachment" size={14} color={pressed ? colors.textInverse : colors.primary} />
                  <Text variant="smallBold" color={pressed ? colors.textInverse : colors.primary}>
                    {t('services.helpdesk.addAttachment')}
                  </Text>
                </>
              )}
            </Pressable>
          ) : (
            <Text variant="caption" color={colors.textTertiary} style={{ textAlign, writingDirection, marginTop: spacing.sm }}>
              {t('services.helpdesk.attachmentLimit', { max: toLatnDigits(String(MAX_ATTACHMENTS)) })}
            </Text>
          )}
        </View>

        {/* Selection summary + submit */}
        {canSubmit && (
          <View style={[styles.summary, { backgroundColor: colors.primaryWash, borderColor: colors.primary }]}>
            <View style={[styles.summaryRow, { flexDirection: rowDir }]}>
              <Icon name="briefcase" size={14} color={colors.primary} />
              <Text variant="caption" color={colors.textSecondary} style={{ flex: 1, textAlign, writingDirection }}>
                {departmentIsOther
                  ? t('services.helpdesk.otherOption')
                  : locale === 'ar'
                    ? department!.name_ar
                    : department!.name_en}
              </Text>
            </View>
            <View style={[styles.summaryRow, { flexDirection: rowDir }]}>
              <Icon name="document" size={14} color={colors.primary} />
              <Text variant="bodyBold" color={colors.textPrimary} style={{ flex: 1, textAlign, writingDirection }}>
                {needsOtherText
                  ? t('services.helpdesk.otherOption')
                  : locale === 'ar'
                    ? issue!.label_ar
                    : issue!.label_en}
              </Text>
            </View>
            <Button
              title={t('services.helpdesk.submit')}
              onPress={submitTicket}
              fullWidth
              size="large"
              style={{ marginTop: spacing.sm }}
            />
          </View>
        )}

        {/* Direct contact fallback */}
        <View style={[styles.actionsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text variant="smallBold" color={colors.textPrimary} style={{ textAlign, writingDirection }}>
            {t('services.helpdesk.cantFind')}
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.actionBtn,
              { backgroundColor: pressed ? colors.primary : colors.surface, borderColor: colors.primary },
            ]}
            onPress={() => {
              haptic.selection();
              Linking.openURL(TEAMS_URL);
            }}
          >
            {({ pressed }) => (
              <>
                <Icon name="messages" size={14} color={pressed ? colors.textInverse : colors.primary} />
                <Text variant="smallBold" color={pressed ? colors.textInverse : colors.primary}>
                  {t('services.helpdesk.openTeams')}
                </Text>
              </>
            )}
          </Pressable>
          {/* University webmail — Outlook on the web (IT dept doc). */}
          <Pressable
            style={({ pressed }) => [
              styles.actionBtn,
              { backgroundColor: pressed ? colors.primary : colors.surface, borderColor: colors.primary },
            ]}
            onPress={() => {
              haptic.selection();
              Linking.openURL(OUTLOOK_URL);
            }}
          >
            {({ pressed }) => (
              <>
                <Icon name="mail" size={14} color={pressed ? colors.textInverse : colors.primary} />
                <Text variant="smallBold" color={pressed ? colors.textInverse : colors.primary}>
                  {isAr ? 'فتح البريد الجامعي (Outlook)' : 'Open University Email (Outlook)'}
                </Text>
              </>
            )}
          </Pressable>
        </View>

        {/* IT Support FAQ — collapsible common Q&A. */}
        <View style={[styles.actionsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text variant="smallBold" color={colors.textPrimary} style={{ textAlign, writingDirection }}>
            {isAr ? 'الأسئلة الشائعة - الدعم الفني' : 'IT Support FAQ'}
          </Text>
          <View style={[styles.faqList, { borderColor: colors.border }]}>
            {IT_FAQ.map((item, i) => {
              const isOpen = openFaq === i;
              return (
                <View
                  key={item.q_en}
                  style={[
                    styles.faqItem,
                    {
                      borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth,
                      borderTopColor: colors.divider,
                    },
                  ]}
                >
                  <Pressable
                    onPress={() => {
                      haptic.selection();
                      setOpenFaq(isOpen ? null : i);
                    }}
                    style={[styles.faqQuestion, { flexDirection: rowDir }]}
                    accessibilityRole="button"
                  >
                    <Text
                      variant="smallBold"
                      color={colors.textPrimary}
                      style={{ flex: 1, textAlign, writingDirection }}
                    >
                      {isAr ? item.q_ar : item.q_en}
                    </Text>
                    {isOpen ? (
                      <Icon name="chevron-down" size={16} color={colors.chevron} />
                    ) : (
                      <Triangle size={8} color={colors.chevron} direction="auto" />
                    )}
                  </Pressable>
                  {isOpen && (
                    <Text
                      variant="caption"
                      color={colors.textSecondary}
                      style={{
                        textAlign,
                        writingDirection,
                        lineHeight: 18,
                        paddingBottom: spacing.sm,
                      }}
                    >
                      {isAr ? item.a_ar : item.a_en}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>
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
    paddingBottom: spacing.sm,
    marginBottom: spacing.base,
  },

  summary: {
    borderWidth: 1,
    padding: spacing.base,
    marginBottom: spacing.base,
    gap: spacing.sm,
  },
  summaryRow: { alignItems: 'center', gap: spacing.sm },

  attachmentList: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  attachmentChip: {
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 8,
    paddingHorizontal: spacing.sm,
  },

  actionsCard: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.base,
    gap: spacing.sm,
    marginBottom: spacing.base,
  },

  itCategory: { marginBottom: spacing.sm },
  itCategoryHead: {
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.xs,
  },
  itCategoryMark: {
    width: 12,
    height: 2,
    backgroundColor: colors.secondary,
  },
  itIssueRow: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 10,
    paddingHorizontal: spacing.xs,
  },

  faqList: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  faqItem: {
    paddingHorizontal: spacing.sm,
  },
  faqQuestion: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  actionBtn: {
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
});
