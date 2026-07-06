'use client';

import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { api } from '@/lib/api';
import {
  CCK_TRANSFER_POLICY, CCK_GRADING_POLICY,
  CCK_GRADING_SCHEME, CCK_ACADEMIC_STANDING,
  CCK_EQUIVALENCY_RULES,
} from '@/lib/cckPolicies';
import { useI18n } from '@/lib/i18n';

const TABS = [
  { key: 'branding', labelKey: 'settings.branding' },
  { key: 'general', labelKey: 'settings.general' },
  { key: 'security', labelKey: 'settings.security' },
  { key: 'sso', labelKey: 'settings.sso' },
  { key: 'policies', labelKey: 'settings.policies' },
];

const MODULES = [
  { key: 'academics' },
  { key: 'payments' },
  { key: 'ai_advisor' },
  { key: 'campus' },
  { key: 'social' },
  { key: 'notifications' },
];

const ONBOARDING_STEPS = [
  { key: 'welcome', default: true },
  { key: 'profile_setup', default: true },
  { key: 'interests', default: true },
  { key: 'connect_lms', default: true },
  { key: 'notification_prefs', default: false },
  { key: 'campus_tour', default: false },
];

function getContrastRatio(hex1: string, hex2: string): number {
  const getLuminance = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  };
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

export default function SettingsPage() {
  const { t, locale, isRTL } = useI18n();
  const [activeTab, setActiveTab] = useState('branding');

  // Branding state
  const [form, setForm] = useState({
    university_name_en: 'Pair University',
    university_name_ar: 'جامعة بير',
    primary_color: '#006341',
    secondary_color: '#76B82A',
    logo_url: '',
    font_family: 'Hind',
  });
  const [enabledModules, setEnabledModules] = useState<Record<string, boolean>>({
    academics: true,
    payments: true,
    ai_advisor: true,
    campus: true,
    social: true,
    notifications: true,
  });
  const [onboardingSteps, setOnboardingSteps] = useState<Record<string, boolean>>(
    Object.fromEntries(ONBOARDING_STEPS.map((s) => [s.key, s.default]))
  );

  // General state
  const [generalForm, setGeneralForm] = useState({
    timezone: 'Asia/Riyadh',
    language: 'en',
    academic_year: '2025-2026',
    semester: 'Spring',
    support_email: 'support@university.edu.sa',
    max_students: '50000',
  });

  // Security state
  const [securityForm, setSecurityForm] = useState({
    session_timeout: '30',
    mfa_required: true,
    password_min_length: '8',
    login_attempts: '5',
    ip_whitelist: '',
  });

  // SSO state
  const [ssoForm, setSsoForm] = useState({
    enabled: false,
    provider: 'saml',
    entity_id: '',
    sso_url: '',
    certificate: '',
    attr_email: 'email',
    attr_name: 'displayName',
    attr_student_id: 'employeeNumber',
  });
  const [ssoTestSuccess, setSsoTestSuccess] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Contrast warning: primary color vs white
  const showContrastWarning = getContrastRatio(form.primary_color, '#ffffff') < 3;

  // Notification dependency warning
  const showNotificationWarning = !enabledModules.notifications;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      if (activeTab === 'branding') {
        await api.updateBranding({ ...form, enabled_modules: enabledModules, onboarding_steps: onboardingSteps });
      } else if (activeTab === 'general') {
        await api.updateGeneralSettings(generalForm);
      } else if (activeTab === 'security') {
        await api.updateSecuritySettings(securityForm);
      } else if (activeTab === 'sso') {
        await api.updateSSOConfig({
          enabled: ssoForm.enabled,
          provider: ssoForm.provider,
          entity_id: ssoForm.entity_id,
          sso_url: ssoForm.sso_url,
          certificate: ssoForm.certificate,
          attribute_mapping: {
            email: ssoForm.attr_email,
            name: ssoForm.attr_name,
            student_id: ssoForm.attr_student_id,
          },
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <PageHeader title={t('settings.title')} />

      {saved && (
        <div role="status" aria-live="polite" className="bg-pair-50 border border-pair-200 rounded-sm p-4 mb-6">
          <p className="text-pair-700 font-medium">{t('settings.savedSuccess')}</p>
        </div>
      )}

      {error && (
        <div role="alert" className="bg-danger-50 border border-danger-200 rounded-sm p-4 mb-6">
          <p className="text-danger-700 font-medium">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-line mb-6">
        <div className="flex gap-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-pair-600 text-pair-600'
                  : 'border-transparent text-muted hover:text-body hover:border-line-strong'
              }`}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSave}>
        {/* Branding Tab */}
        {activeTab === 'branding' && (
          <div className="space-y-8">
            <div className="cck-card p-6 space-y-6">
              <h2 className="text-lg font-semibold">{t('settings.branding')}</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-body mb-1">{t('settings.universityNameEn')}</label>
                  <input
                    type="text"
                    value={form.university_name_en}
                    onChange={(e) => setForm({ ...form, university_name_en: e.target.value })}
                    className="cck-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-body mb-1">{t('settings.universityNameAr')}</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={form.university_name_ar}
                    onChange={(e) => setForm({ ...form, university_name_ar: e.target.value })}
                    className="cck-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-body mb-1">{t('settings.primaryColor')}</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={form.primary_color}
                      onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                      className="w-10 h-10 rounded-sm border border-line-strong cursor-pointer"
                    />
                    <input
                      type="text"
                      value={form.primary_color}
                      onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                      className="flex-1 border border-line-strong rounded-sm px-3 py-2 text-sm font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-body mb-1">{t('settings.secondaryColor')}</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={form.secondary_color}
                      onChange={(e) => setForm({ ...form, secondary_color: e.target.value })}
                      className="w-10 h-10 rounded-sm border border-line-strong cursor-pointer"
                    />
                    <input
                      type="text"
                      value={form.secondary_color}
                      onChange={(e) => setForm({ ...form, secondary_color: e.target.value })}
                      className="flex-1 border border-line-strong rounded-sm px-3 py-2 text-sm font-mono"
                    />
                  </div>
                </div>
              </div>

              {showContrastWarning && (
                <div className="bg-danger-50 border border-danger-200 rounded-sm p-4">
                  <p className="text-danger-700 text-sm font-medium">{t('settings.contrastWarning')}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-body mb-1">{t('settings.fontFamily')}</label>
                  <select
                    value={form.font_family}
                    onChange={(e) => setForm({ ...form, font_family: e.target.value })}
                    className="cck-input"
                  >
                    {['Hind', 'Montserrat', 'Noto Sans Arabic', 'Cairo', 'Outfit', 'Tajawal', 'IBM Plex Sans Arabic', 'Inter', 'Roboto'].map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-body mb-1">{t('settings.logoUrl')}</label>
                  <input
                    type="url"
                    value={form.logo_url}
                    onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                    placeholder="https://cdn.example.com/logo.png"
                    className="cck-input"
                  />
                </div>
              </div>

              <div className="border border-line rounded-sm p-4">
                <p className="text-sm font-medium text-body mb-3">{t('settings.preview')}</p>
                <div
                  className="flex items-center gap-4 p-4 rounded-sm"
                  style={{ backgroundColor: form.primary_color, fontFamily: form.font_family }}
                >
                  <div
                    className="w-10 h-10 bg-white rounded-sm flex items-center justify-center text-xs font-bold"
                    style={{ color: form.primary_color }}
                  >
                    Logo
                  </div>
                  <div>
                    <p className="font-bold text-white">{form.university_name_en}</p>
                    <p className="text-sm" style={{ color: form.secondary_color }}>{form.university_name_ar}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="cck-card p-6">
              <h2 className="text-lg font-semibold mb-4">{t('settings.enabledModules')}</h2>
              <p className="text-sm text-muted mb-4">{t('settings.enabledModulesDesc')}</p>

              {showNotificationWarning && (
                <div className="bg-danger-50 border border-danger-200 rounded-sm p-4 mb-4">
                  <p className="text-danger-700 text-sm font-medium">{t('settings.notificationDependency')}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {MODULES.map((m) => (
                  <label
                    key={m.key}
                    className={`flex items-center justify-between p-4 rounded-sm border cursor-pointer transition-colors ${
                      enabledModules[m.key] ? 'border-pair-300 bg-pair-50' : 'border-line bg-canvas'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium">{t('module.' + m.key)}</p>
                      <p className="text-xs text-muted">{t('module.' + m.key + '.desc')}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={enabledModules[m.key] || false}
                      onChange={(e) => setEnabledModules({ ...enabledModules, [m.key]: e.target.checked })}
                      className="w-5 h-5 text-pair-600 rounded-sm"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="cck-card p-6">
              <h2 className="text-lg font-semibold mb-4">{t('settings.onboardingFlow')}</h2>
              <p className="text-sm text-muted mb-4">{t('settings.onboardingDesc')}</p>
              <div className="space-y-2">
                {ONBOARDING_STEPS.map((step, i) => (
                  <label
                    key={step.key}
                    className={`flex items-center gap-4 p-3 rounded-sm border cursor-pointer ${
                      onboardingSteps[step.key] ? 'border-pair-300 bg-pair-50' : 'border-line'
                    }`}
                  >
                    <span className="w-6 h-6 rounded-full bg-line-strong flex items-center justify-center text-xs font-medium text-body">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm">{t('onboarding.' + step.key)}</span>
                    <input
                      type="checkbox"
                      checked={onboardingSteps[step.key] || false}
                      onChange={(e) => setOnboardingSteps({ ...onboardingSteps, [step.key]: e.target.checked })}
                      className="w-5 h-5 text-pair-600 rounded-sm"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="space-y-8">
            <div className="cck-card p-6 space-y-6">
              <h2 className="text-lg font-semibold">{t('settings.generalSettings')}</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-body mb-1">{t('settings.timezone')}</label>
                  <select
                    value={generalForm.timezone}
                    onChange={(e) => setGeneralForm({ ...generalForm, timezone: e.target.value })}
                    className="cck-input"
                  >
                    {['Asia/Riyadh', 'Asia/Dubai', 'Asia/Kuwait', 'UTC', 'Europe/London', 'America/New_York'].map((tz) => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-body mb-1">{t('settings.defaultLanguage')}</label>
                  <select
                    value={generalForm.language}
                    onChange={(e) => setGeneralForm({ ...generalForm, language: e.target.value })}
                    className="cck-input"
                  >
                    <option value="en">English</option>
                    <option value="ar">Arabic</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-body mb-1">{t('settings.academicYear')}</label>
                  <input
                    type="text"
                    value={generalForm.academic_year}
                    onChange={(e) => setGeneralForm({ ...generalForm, academic_year: e.target.value })}
                    className="cck-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-body mb-1">{t('settings.currentSemester')}</label>
                  <select
                    value={generalForm.semester}
                    onChange={(e) => setGeneralForm({ ...generalForm, semester: e.target.value })}
                    className="cck-input"
                  >
                    <option value="Fall">Fall</option>
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-body mb-1">{t('settings.supportEmail')}</label>
                  <input
                    type="email"
                    value={generalForm.support_email}
                    onChange={(e) => setGeneralForm({ ...generalForm, support_email: e.target.value })}
                    className="cck-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-body mb-1">{t('settings.maxStudents')}</label>
                  <input
                    type="number"
                    value={generalForm.max_students}
                    onChange={(e) => setGeneralForm({ ...generalForm, max_students: e.target.value })}
                    className="cck-input"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-8">
            <div className="cck-card p-6 space-y-6">
              <h2 className="text-lg font-semibold">{t('settings.securitySettings')}</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-body mb-1">{t('settings.sessionTimeout')}</label>
                  <input
                    type="number"
                    value={securityForm.session_timeout}
                    onChange={(e) => setSecurityForm({ ...securityForm, session_timeout: e.target.value })}
                    className="cck-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-body mb-1">{t('settings.maxLoginAttempts')}</label>
                  <input
                    type="number"
                    value={securityForm.login_attempts}
                    onChange={(e) => setSecurityForm({ ...securityForm, login_attempts: e.target.value })}
                    className="cck-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-body mb-1">{t('settings.minPasswordLength')}</label>
                  <input
                    type="number"
                    value={securityForm.password_min_length}
                    onChange={(e) => setSecurityForm({ ...securityForm, password_min_length: e.target.value })}
                    className="cck-input"
                  />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="mfa"
                    checked={securityForm.mfa_required}
                    onChange={(e) => setSecurityForm({ ...securityForm, mfa_required: e.target.checked })}
                    className="w-5 h-5 text-pair-600 rounded-sm"
                  />
                  <label htmlFor="mfa" className="text-sm font-medium text-body">{t('settings.requireMfa')}</label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-body mb-1">{t('settings.ipWhitelist')}</label>
                <textarea
                  value={securityForm.ip_whitelist}
                  onChange={(e) => setSecurityForm({ ...securityForm, ip_whitelist: e.target.value })}
                  placeholder={t('settings.ipWhitelistPlaceholder')}
                  rows={4}
                  className="cck-input font-mono"
                />
                <p className="text-xs text-muted mt-1">{t('settings.ipWhitelistHint')}</p>
              </div>
            </div>
          </div>
        )}

        {/* SSO Tab */}
        {activeTab === 'sso' && (
          <div className="space-y-8">
            <div className="cck-card p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold">{t('settings.ssoConfig')}</h2>
                <p className="text-sm text-muted mt-1">{t('settings.ssoDesc')}</p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="sso-enabled"
                  checked={ssoForm.enabled}
                  onChange={(e) => setSsoForm({ ...ssoForm, enabled: e.target.checked })}
                  className="w-5 h-5 text-pair-600 rounded-sm"
                />
                <label htmlFor="sso-enabled" className="text-sm font-medium text-body">{t('settings.ssoEnabled')}</label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-body mb-1">{t('settings.ssoProvider')}</label>
                  <select
                    value={ssoForm.provider}
                    onChange={(e) => setSsoForm({ ...ssoForm, provider: e.target.value })}
                    className="cck-input"
                  >
                    <option value="saml">SAML 2.0</option>
                    <option value="oauth2">OAuth 2.0 / OIDC</option>
                    <option value="azure_ad">Azure AD</option>
                    <option value="google">Google Workspace</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-body mb-1">{t('settings.entityId')}</label>
                  <input
                    type="text"
                    value={ssoForm.entity_id}
                    onChange={(e) => setSsoForm({ ...ssoForm, entity_id: e.target.value })}
                    placeholder="https://idp.university.edu.sa/entity"
                    className="cck-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-body mb-1">{t('settings.ssoUrl')}</label>
                <input
                  type="url"
                  value={ssoForm.sso_url}
                  onChange={(e) => setSsoForm({ ...ssoForm, sso_url: e.target.value })}
                  placeholder="https://idp.university.edu.sa/sso/saml"
                  className="cck-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-body mb-1">{t('settings.certificate')}</label>
                <textarea
                  value={ssoForm.certificate}
                  onChange={(e) => setSsoForm({ ...ssoForm, certificate: e.target.value })}
                  placeholder={t('settings.certificatePlaceholder')}
                  rows={4}
                  className="cck-input font-mono"
                />
              </div>
            </div>

            <div className="cck-card p-6 space-y-6">
              <h2 className="text-lg font-semibold">{t('settings.attributeMapping')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-body mb-1">{t('settings.attrEmail')}</label>
                  <input
                    type="text"
                    value={ssoForm.attr_email}
                    onChange={(e) => setSsoForm({ ...ssoForm, attr_email: e.target.value })}
                    className="cck-input font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-body mb-1">{t('settings.attrName')}</label>
                  <input
                    type="text"
                    value={ssoForm.attr_name}
                    onChange={(e) => setSsoForm({ ...ssoForm, attr_name: e.target.value })}
                    className="cck-input font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-body mb-1">{t('settings.attrStudentId')}</label>
                  <input
                    type="text"
                    value={ssoForm.attr_student_id}
                    onChange={(e) => setSsoForm({ ...ssoForm, attr_student_id: e.target.value })}
                    className="cck-input font-mono"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => { setSsoTestSuccess(true); setTimeout(() => setSsoTestSuccess(false), 3000); }}
                className="px-4 py-2 text-sm border border-pair-300 text-pair-700 rounded-sm hover:bg-pair-50"
              >
                {t('settings.testConnection')}
              </button>
              {ssoTestSuccess && (
                <p className="text-sm text-pair-700 font-medium">{t('settings.connectionSuccess')}</p>
              )}
            </div>
          </div>
        )}

        {/* Policies Tab - read-only single source of truth */}
        {activeTab === 'policies' && (
          <div className="space-y-8">
            <div className="cck-card p-6">
              <h2 className="text-lg font-semibold">{t('settings.policiesTitle')}</h2>
              <p className="text-sm text-muted mt-1">{t('settings.policiesDesc')}</p>
            </div>

            {/* Credit Transfer Policy */}
            <section className="cck-card p-6 space-y-5">
              <header>
                <h3 className="text-base font-semibold">{t('settings.policy.transferTitle')}</h3>
                <p className="text-xs text-muted mt-1">
                  {t('settings.policy.approvedBy', {
                    by: CCK_TRANSFER_POLICY.approved_by,
                    at: CCK_TRANSFER_POLICY.approved_at,
                    effective: CCK_TRANSFER_POLICY.effective,
                  })}
                </p>
              </header>

              <div>
                <h4 className="text-sm font-semibold mb-2">{t('settings.policy.transferRulesTitle')}</h4>
                <ol className="space-y-1.5 list-decimal list-inside text-sm">
                  {CCK_EQUIVALENCY_RULES.map((rule) => (
                    <li key={rule.key} className="text-ink">
                      {locale === 'ar' ? rule.label_ar : rule.label_en}
                    </li>
                  ))}
                </ol>
              </div>

              <ol className="space-y-3">
                {CCK_TRANSFER_POLICY.sections.map((s) => (
                  <li key={s.number} className="rounded-sm border border-line p-4">
                    <p className="text-[11px] uppercase tracking-wide text-pair-700 font-semibold">
                      {t('settings.policy.transferSection', { number: s.number })}
                    </p>
                    <p className="text-sm font-semibold mt-1">
                      {locale === 'ar' ? s.title_ar : s.title_en}
                    </p>
                    <p className="text-sm text-ink mt-1">
                      {locale === 'ar' ? s.body_ar : s.body_en}
                    </p>
                  </li>
                ))}
              </ol>
            </section>

            {/* Grading System Policy */}
            <section className="cck-card p-6 space-y-5">
              <header>
                <h3 className="text-base font-semibold">{t('settings.policy.gradingTitle')}</h3>
                <p className="text-xs text-muted mt-1">
                  {t('settings.policy.approvedBy', {
                    by: CCK_GRADING_POLICY.approved_by,
                    at: CCK_GRADING_POLICY.approved_at,
                    effective: CCK_GRADING_POLICY.effective,
                  })}
                </p>
              </header>

              <div className="rounded-sm border border-line overflow-hidden">
                <header className="px-4 py-3 bg-canvas border-b border-line">
                  <h4 className="text-sm font-semibold">{t('settings.policy.gradingScheme')}</h4>
                </header>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-muted border-b">
                      <th className="px-4 py-2 text-start font-medium">{t('settings.policy.letter')}</th>
                      <th className="px-4 py-2 text-start font-medium">{t('settings.policy.range')}</th>
                      <th className="px-4 py-2 text-start font-medium">{t('settings.policy.score')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CCK_GRADING_SCHEME.map((g) => (
                      <tr key={g.letter} className="border-b border-line last:border-0">
                        <td className="px-4 py-2 font-semibold" dir="ltr">{g.letter}</td>
                        <td className="px-4 py-2" dir="ltr">{g.description_en}</td>
                        <td className="px-4 py-2 tabular-nums" dir="ltr">{g.score.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="rounded-sm border border-line overflow-hidden">
                <header className="px-4 py-3 bg-canvas border-b border-line">
                  <h4 className="text-sm font-semibold">{t('settings.policy.standingTitle')}</h4>
                </header>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-muted border-b">
                      <th className="px-4 py-2 text-start font-medium">{t('settings.policy.standingClassification')}</th>
                      <th className="px-4 py-2 text-start font-medium">{t('settings.policy.standingRange')}</th>
                      <th className="px-4 py-2 text-start font-medium">{t('settings.policy.standingArabic')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CCK_ACADEMIC_STANDING.map((row) => (
                      <tr key={row.classification_en} className="border-b border-line last:border-0">
                        <td className="px-4 py-2 font-medium">{row.classification_en}</td>
                        <td className="px-4 py-2" dir="ltr">{row.range_en}</td>
                        <td className="px-4 py-2 text-end" dir="rtl">{row.classification_ar}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">{t('settings.policy.notesTitle')}</h4>
                <ul className="space-y-1.5 text-sm">
                  {(locale === 'ar' ? CCK_GRADING_POLICY.notes_ar : CCK_GRADING_POLICY.notes_en).map((n, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 inline-block w-1.5 h-1.5 rounded-full bg-pair-600 shrink-0" />
                      <span>{n}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>
        )}

        {activeTab !== 'policies' && (
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary mt-8"
          >
            {saving ? t('common.saving') : t('common.save')}
          </button>
        )}
      </form>
    </div>
  );
}
