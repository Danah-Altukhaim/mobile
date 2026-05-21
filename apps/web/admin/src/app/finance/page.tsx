'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CREDIT_PRICE_KWD, FOUNDATION_SEMESTER_FEE_KWD, REGISTRATION_FEE_KWD,
  STUDENT_SERVICE_FEE_KWD, MISC_FEES_KWD, WITHDRAWAL_FINE_BY_WEEK,
  INSTALLMENT_WEEKS, INSTALLMENT_SPLIT, CCK_PAYMENT_METHODS, FINANCE_POLICY_NOTES,
  NON_REFUNDABLE_FEES,
  type MiscFeeType,
} from '@masari/shared';
import Card from '@/components/Card';
import { CloseIcon } from '@/components/icons';
import { SkeletonPage } from '@/components/Skeleton';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import { useI18n } from '@/lib/i18n';
import {
  api,
  type FinanceAccount, type FinanceClearance, type FinanceInstallment,
  type InstallmentStatus, type AccountStanding, type ClearanceStatus,
} from '@/lib/api';

interface FinanceOverview {
  current_study_week: number;
  installment_weeks: number[];
  summary: {
    total_billed: number;
    total_collected: number;
    outstanding: number;
    holds: number;
    overdue_installments: number;
  };
  accounts: FinanceAccount[];
}

type Tab = 'accounts' | 'clearances' | 'schedule';
type AccountFilter = 'all' | 'outstanding' | 'overdue' | 'hold' | 'cleared';

const TABS: Tab[] = ['accounts', 'clearances', 'schedule'];
const ACCOUNT_FILTERS: AccountFilter[] = ['all', 'outstanding', 'overdue', 'hold', 'cleared'];
const CLEARANCES_KEY = ['finance', 'clearances'] as const;

const accountMatches = (a: FinanceAccount, f: AccountFilter): boolean => {
  switch (f) {
    case 'all': return true;
    case 'outstanding': return a.balance > 0;
    case 'overdue': return a.installments.some((i) => i.status === 'overdue');
    case 'hold': return a.standing === 'hold';
    case 'cleared': return a.standing === 'cleared';
  }
};

const INSTALLMENT_DOT: Record<InstallmentStatus, string> = {
  paid: 'bg-oasis-500',
  due: 'bg-gold-500',
  overdue: 'bg-danger-500',
  upcoming: 'bg-gray-300',
};

const STANDING_STYLE: Record<AccountStanding, string> = {
  cleared: 'bg-oasis-50 text-oasis-700',
  on_track: 'bg-pair-50 text-pair-700',
  hold: 'bg-danger-50 text-danger-700',
};

const CLEARANCE_STYLE: Record<ClearanceStatus, string> = {
  pending: 'bg-gold-50 text-gold-700',
  cleared: 'bg-oasis-50 text-oasis-700',
  blocked: 'bg-danger-50 text-danger-700',
};

const kwd = (n: number) => `${n.toLocaleString('en-US', { maximumFractionDigits: 2 })} KWD`;

const MISC_FEE_ORDER: MiscFeeType[] = [
  'application', 'late_registration', 're_admission', 'id_replacement',
  'official_transcript', 'twimc_letter', 'diploma_reissuance',
  'placement_test', 'graduation_gown',
];

export default function FinancePage() {
  const { t, dir } = useI18n();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('accounts');
  const [accountFilter, setAccountFilter] = useState<AccountFilter>('all');
  const [selected, setSelected] = useState<FinanceAccount | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const showAccounts = (filter: AccountFilter) => {
    setAccountFilter(filter);
    setTab('accounts');
  };

  const { data: overview, isError: ovError, refetch: refetchOverview } = useQuery<FinanceOverview>({
    queryKey: ['finance', 'overview'],
    queryFn: () => api.getFinanceOverview() as Promise<FinanceOverview>,
  });
  const { data: clearances, isError: clError, refetch: refetchClearances } = useQuery<FinanceClearance[]>({
    queryKey: CLEARANCES_KEY,
    queryFn: () => api.getFinanceClearances() as Promise<FinanceClearance[]>,
  });

  const resolve = async (id: string, decision: 'cleared' | 'blocked') => {
    setBusy(id + decision);
    try {
      await api.resolveFinanceClearance(id, decision);
      qc.setQueryData<FinanceClearance[]>(CLEARANCES_KEY, (prev) =>
        prev?.map((c) => (c.id === id ? { ...c, status: decision } : c)) ?? prev,
      );
    } finally {
      setBusy(null);
    }
  };

  if (ovError || clError) {
    return (
      <ErrorState
        title={t('common.error')}
        description={t('common.errorDescription')}
        onRetry={() => { refetchOverview(); refetchClearances(); }}
        retryLabel={t('common.retry')}
      />
    );
  }
  if (!overview || !clearances) return <SkeletonPage />;

  const pendingClearances = clearances.filter((c) => c.status === 'pending').length;

  return (
    <div dir={dir}>
      <h1 className="text-2xl font-bold mb-1">{t('finance.title')}</h1>
      <p className="text-sm text-[#737477] mb-1">{t('finance.subtitle')}</p>
      <p className="text-xs text-[#737477] mb-6">
        {t('finance.studyWeek', { week: overview.current_study_week })}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card
          title={t('finance.kpi.outstanding')}
          value={kwd(overview.summary.outstanding)}
          onClick={() => showAccounts('outstanding')}
          active={tab === 'accounts' && accountFilter === 'outstanding'}
        />
        <Card title={t('finance.kpi.collected')} value={kwd(overview.summary.total_collected)} />
        <Card
          title={t('finance.kpi.holds')}
          value={overview.summary.holds}
          onClick={() => showAccounts('hold')}
          active={tab === 'accounts' && accountFilter === 'hold'}
        />
        <Card
          title={t('finance.kpi.overdueInstallments')}
          value={overview.summary.overdue_installments}
          onClick={() => showAccounts('overdue')}
          active={tab === 'accounts' && accountFilter === 'overdue'}
        />
        <Card
          title={t('finance.kpi.pendingClearances')}
          value={pendingClearances}
          onClick={() => setTab('clearances')}
          active={tab === 'clearances'}
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {TABS.map((tb) => (
          <button
            key={tb}
            onClick={() => setTab(tb)}
            className={`px-3 py-1.5 rounded-lg text-sm border ${
              tab === tb
                ? 'bg-pair-600 text-white border-pair-600'
                : 'bg-white text-[#737477] border-gray-300 hover:bg-gray-50'
            }`}
          >
            {t(`finance.tab.${tb}`)}
            {tb === 'clearances' && pendingClearances > 0 ? ` · ${pendingClearances}` : ''}
          </button>
        ))}
      </div>

      {tab === 'accounts' && (
        <AccountsTab
          accounts={overview.accounts}
          filter={accountFilter}
          onFilterChange={setAccountFilter}
          onSelect={setSelected}
        />
      )}
      {tab === 'clearances' && (
        <ClearancesTab clearances={clearances} busy={busy} onResolve={resolve} />
      )}
      {tab === 'schedule' && <ScheduleTab />}

      <p className="text-xs text-[#737477] mt-6 leading-relaxed">{t('finance.linkedNote')}</p>

      {selected && (
        <StudentDetailModal account={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function InstallmentDots({ installments }: { installments: FinanceInstallment[] }) {
  const { t } = useI18n();
  return (
    <span className="flex items-center gap-1.5">
      {installments.map((inst) => (
        <span
          key={inst.number}
          title={t(`finance.inst.${inst.status}`, { n: inst.number, week: inst.week })}
          className={`w-2.5 h-2.5 rounded-full ${INSTALLMENT_DOT[inst.status]}`}
        />
      ))}
    </span>
  );
}

function AccountsTab({
  accounts, filter, onFilterChange, onSelect,
}: {
  accounts: FinanceAccount[];
  filter: AccountFilter;
  onFilterChange: (f: AccountFilter) => void;
  onSelect: (a: FinanceAccount) => void;
}) {
  const { t, locale } = useI18n();
  const textAlign = locale === 'ar' ? 'text-right' : 'text-left';
  const visible = accounts.filter((a) => accountMatches(a, filter));

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {ACCOUNT_FILTERS.map((f) => {
          const count = accounts.filter((a) => accountMatches(a, f)).length;
          return (
            <button
              key={f}
              onClick={() => onFilterChange(f)}
              className={`px-3 py-1.5 rounded-lg text-sm border ${
                filter === f
                  ? 'bg-pair-600 text-white border-pair-600'
                  : 'bg-white text-[#737477] border-gray-300 hover:bg-gray-50'
              }`}
            >
              {t(`finance.filter.${f}`)} · {count}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <EmptyState title={t('finance.filter.empty')} />
      ) : (
    <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className={`${textAlign} text-gray-500 border-b border-gray-200`}>
            <th className="p-4 font-medium">{t('finance.col.student')}</th>
            <th className="p-4 font-medium">{t('finance.col.program')}</th>
            <th className="p-4 font-medium">{t('finance.col.total')}</th>
            <th className="p-4 font-medium">{t('finance.col.paid')}</th>
            <th className="p-4 font-medium">{t('finance.col.balance')}</th>
            <th className="p-4 font-medium">{t('finance.col.installments')}</th>
            <th className="p-4 font-medium">{t('finance.col.method')}</th>
            <th className="p-4 font-medium">{t('finance.col.standing')}</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((a) => (
            <tr
              key={a.student_id}
              onClick={() => onSelect(a)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(a);
                }
              }}
              className="border-b border-gray-50 last:border-0 align-top cursor-pointer hover:bg-gray-50 focus:outline-none focus-visible:bg-gray-50"
            >
              <td className="p-4">
                <p className="font-medium">{locale === 'ar' ? a.name_ar : a.name_en}</p>
                <p className="text-xs text-[#737477] font-mono">{a.student_id}</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {a.late_fee && (
                    <span className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-danger-50 text-danger-700">
                      {t('finance.flag.lateFee', { amount: a.late_fee_amount })}
                    </span>
                  )}
                  {a.repeated_course && (
                    <span className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-gold-50 text-gold-700">
                      {t('finance.flag.repeated')}
                    </span>
                  )}
                </div>
              </td>
              <td className="p-4">
                <p>{locale === 'ar' ? a.program_ar : a.program_en}</p>
                <p className="text-xs text-[#737477] mt-0.5">
                  {t(`finance.funding.${a.funding}`)} · {t(`finance.discount.${a.discount}`)}
                </p>
              </td>
              <td className="p-4 whitespace-nowrap">{kwd(a.total_payable)}</td>
              <td className="p-4 whitespace-nowrap text-oasis-700">{kwd(a.paid_amount)}</td>
              <td className={`p-4 whitespace-nowrap font-medium ${a.balance > 0 ? 'text-danger-600' : 'text-oasis-700'}`}>
                {kwd(a.balance)}
              </td>
              <td className="p-4"><InstallmentDots installments={a.installments} /></td>
              <td className="p-4 whitespace-nowrap">{t(`finance.method.${a.method}`)}</td>
              <td className="p-4">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${STANDING_STYLE[a.standing]}`}>
                  {t(`finance.standing.${a.standing}`)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
      )}
    </div>
  );
}

function ClearancesTab({
  clearances, busy, onResolve,
}: {
  clearances: FinanceClearance[];
  busy: string | null;
  onResolve: (id: string, decision: 'cleared' | 'blocked') => void;
}) {
  const { t, locale } = useI18n();

  if (clearances.length === 0) return <EmptyState title={t('finance.clearance.empty')} />;

  return (
    <div className="space-y-3">
      {clearances.map((c) => (
        <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-mono text-[#737477]">{c.id}</p>
              <p className="font-semibold mt-1">{locale === 'ar' ? c.name_ar : c.name_en}</p>
              <p className="text-xs text-[#737477]">
                {c.student_id} · {t(`finance.clearance.type.${c.type}`)}
              </p>
            </div>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${CLEARANCE_STYLE[c.status]}`}>
              {c.status === 'pending'
                ? t('status.pending')
                : t(`finance.clearance.${c.status}`)}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              c.outstanding > 0 ? 'bg-danger-50 text-danger-700' : 'bg-oasis-50 text-oasis-700'
            }`}>
              {c.outstanding > 0
                ? t('finance.clearance.outstanding', { amount: kwd(c.outstanding) })
                : t('finance.clearance.noBalance')}
            </span>
            {!c.cid_uploaded && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-gold-50 text-gold-700">
                {t('finance.clearance.cidMissing')}
              </span>
            )}
          </div>

          {c.status === 'pending' && (
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={() => onResolve(c.id, 'cleared')}
                disabled={busy === c.id + 'cleared' || c.outstanding > 0 || !c.cid_uploaded}
                className="px-3 py-1.5 bg-oasis-500 text-white rounded-lg text-sm font-medium hover:bg-oasis-600 disabled:opacity-50"
              >
                {t('finance.clearance.clear')}
              </button>
              <button
                onClick={() => onResolve(c.id, 'blocked')}
                disabled={busy === c.id + 'blocked'}
                className="px-3 py-1.5 border border-danger-200 text-danger-700 rounded-lg text-sm hover:bg-danger-50 disabled:opacity-50"
              >
                {t('finance.clearance.block')}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function ScheduleTab() {
  const { t, locale } = useI18n();
  const notes = FINANCE_POLICY_NOTES[locale === 'ar' ? 'ar' : 'en'];

  const FeeRow = ({ label, value, note }: { label: string; value: string; note?: string }) => (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-gray-50 last:border-0 text-sm">
      <span className="text-gray-600">
        {label}
        {note && (
          <span className="ms-2 px-1.5 py-0.5 rounded text-[10px] font-medium bg-danger-50 text-danger-700 align-middle">
            {note}
          </span>
        )}
      </span>
      <span className="font-medium whitespace-nowrap">{value}</span>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Section title={t('finance.schedule.tuition')}>
        <FeeRow label={t('finance.schedule.diploma')} value={t('finance.schedule.perCredit', { value: CREDIT_PRICE_KWD.diploma })} />
        <FeeRow label={t('finance.schedule.bbaBusiness')} value={t('finance.schedule.perCredit', { value: CREDIT_PRICE_KWD.bba_business })} />
        <FeeRow label={t('finance.schedule.bascComputer')} value={t('finance.schedule.perCredit', { value: CREDIT_PRICE_KWD.basc_computer })} />
        <FeeRow label={t('finance.schedule.foundation')} value={t('finance.schedule.flatFee', { value: FOUNDATION_SEMESTER_FEE_KWD })} />
        <p className="text-xs text-[#737477] mt-3 leading-relaxed">{t('finance.schedule.grantNote')}</p>
      </Section>

      <Section title={t('finance.schedule.upfront')}>
        <FeeRow label={t('finance.schedule.regDiploma')} value={kwd(REGISTRATION_FEE_KWD.diploma)} />
        <FeeRow label={t('finance.schedule.regBachelor')} value={kwd(REGISTRATION_FEE_KWD.bachelor)} />
        <FeeRow label={t('finance.schedule.serviceFee')} value={kwd(STUDENT_SERVICE_FEE_KWD)} />
      </Section>

      <Section title={t('finance.schedule.installmentPlan')}>
        {INSTALLMENT_WEEKS.map((week, i) => (
          <FeeRow
            key={week}
            label={t('finance.schedule.installmentRow', { n: i + 1, week })}
            value={`${Math.round(INSTALLMENT_SPLIT[i] * 100)}%`}
          />
        ))}
        <p className="text-xs text-[#737477] mt-3 leading-relaxed">{t('finance.schedule.installmentNote')}</p>
      </Section>

      <Section title={t('finance.schedule.withdrawalFines')}>
        {[2, 3, 4, 5].map((week) => (
          <FeeRow
            key={week}
            label={t('finance.schedule.withdrawalWeek', { week })}
            value={`${Math.round((WITHDRAWAL_FINE_BY_WEEK[week] ?? 1) * 100)}%`}
          />
        ))}
      </Section>

      <Section title={t('finance.schedule.misc')}>
        {MISC_FEE_ORDER.map((key) => (
          <FeeRow
            key={key}
            label={t(`finance.fee.${key}`)}
            value={kwd(MISC_FEES_KWD[key])}
            note={NON_REFUNDABLE_FEES.includes(key) ? t('finance.nonRefundable') : undefined}
          />
        ))}
      </Section>

      <Section title={t('finance.schedule.methods')}>
        <div className="flex flex-wrap gap-2 mb-5">
          {CCK_PAYMENT_METHODS.map((m) => (
            <span key={m} className="px-2.5 py-1 rounded-lg text-sm bg-gray-100 text-gray-700">
              {t(`finance.method.${m}`)}
            </span>
          ))}
        </div>
        <h3 className="text-sm font-semibold mb-2">{t('finance.schedule.policyNotes')}</h3>
        <ul className="space-y-1.5">
          {notes.map((note, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-600">
              <span className="text-pair-600 shrink-0">•</span>
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-gray-50 last:border-0 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-end">{value}</span>
    </div>
  );
}

type ReminderChannel = 'email' | 'push';

function StudentDetailModal({
  account, onClose,
}: {
  account: FinanceAccount;
  onClose: () => void;
}) {
  const { t, locale, dir } = useI18n();
  const [sending, setSending] = useState<ReminderChannel | null>(null);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const name = locale === 'ar' ? account.name_ar : account.name_en;
  const program = locale === 'ar' ? account.program_ar : account.program_en;

  const sendReminder = async (channel: ReminderChannel) => {
    setSending(channel);
    setResult(null);
    try {
      await api.sendFinanceReminder(account.student_id, channel);
      setResult({
        ok: true,
        message: channel === 'email'
          ? t('finance.detail.sentEmail', { email: account.email })
          : t('finance.detail.sentPush', { name }),
      });
    } catch {
      setResult({ ok: false, message: t('finance.detail.sentFailed') });
    } finally {
      setSending(null);
    }
  };

  return (
    <div
      dir={dir}
      role="dialog"
      aria-modal="true"
      aria-label={t('finance.detail.title')}
      className="fixed inset-0 z-50 flex justify-end"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div className="relative bg-white h-full w-full max-w-md shadow-xl overflow-y-auto">
        <div className="flex items-start justify-between gap-4 p-5 border-b border-gray-200 sticky top-0 bg-white">
          <div className="min-w-0">
            <p className="text-xs text-[#737477]">{t('finance.detail.title')}</p>
            <h2 className="text-lg font-bold mt-0.5 truncate">{name}</h2>
            <p className="text-xs text-[#737477] font-mono">{account.student_id}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${STANDING_STYLE[account.standing]}`}>
              {t(`finance.standing.${account.standing}`)}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label={t('finance.detail.close')}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pair-500"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-6">
          <section>
            <h3 className="text-xs font-semibold uppercase text-[#737477] mb-1">{t('finance.detail.contact')}</h3>
            <DetailRow
              label={t('common.email')}
              value={<a href={`mailto:${account.email}`} className="text-pair-700 hover:underline">{account.email}</a>}
            />
            <DetailRow
              label={t('finance.detail.phone')}
              value={<a href={`tel:${account.phone.replace(/\s/g, '')}`} className="text-pair-700 hover:underline" dir="ltr">{account.phone}</a>}
            />
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase text-[#737477] mb-1">{t('finance.detail.program')}</h3>
            <DetailRow label={t('finance.detail.program')} value={program} />
            <DetailRow label={t('finance.detail.credits')} value={account.credits} />
            <DetailRow label={t('finance.col.method')} value={t(`finance.method.${account.method}`)} />
            <DetailRow label={t('finance.detail.funding')} value={t(`finance.funding.${account.funding}`)} />
            <DetailRow label={t('finance.detail.discount')} value={t(`finance.discount.${account.discount}`)} />
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase text-[#737477] mb-1">{t('finance.detail.account')}</h3>
            <DetailRow label={t('finance.col.total')} value={kwd(account.total_payable)} />
            <DetailRow label={t('finance.col.paid')} value={<span className="text-oasis-700">{kwd(account.paid_amount)}</span>} />
            <DetailRow
              label={t('finance.col.balance')}
              value={<span className={account.balance > 0 ? 'text-danger-600' : 'text-oasis-700'}>{kwd(account.balance)}</span>}
            />
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase text-[#737477] mb-2">{t('finance.detail.installments')}</h3>
            <div className="space-y-2">
              {account.installments.map((inst) => (
                <div key={inst.number} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${INSTALLMENT_DOT[inst.status]}`} />
                    {t('finance.detail.installmentRow', { n: inst.number, week: inst.week })}
                  </span>
                  <span className="flex items-center gap-2 whitespace-nowrap">
                    <span className="text-gray-500">{t(`finance.detail.instStatus.${inst.status}`)}</span>
                    <span className="font-medium">{kwd(inst.amount)}</span>
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase text-[#737477] mb-2">{t('finance.detail.flags')}</h3>
            {account.late_fee || account.repeated_course ? (
              <div className="flex flex-wrap gap-1.5">
                {account.late_fee && (
                  <span className="px-2 py-1 rounded text-xs font-medium bg-danger-50 text-danger-700">
                    {t('finance.flag.lateFee', { amount: account.late_fee_amount })}
                  </span>
                )}
                {account.repeated_course && (
                  <span className="px-2 py-1 rounded text-xs font-medium bg-gold-50 text-gold-700">
                    {t('finance.flag.repeated')}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">{t('finance.detail.noFlags')}</p>
            )}
          </section>

          <section className="border-t border-gray-200 pt-5">
            <h3 className="text-sm font-semibold mb-1">{t('finance.detail.reminder')}</h3>
            <p className="text-xs text-[#737477] mb-3 leading-relaxed">
              {account.balance > 0
                ? t('finance.detail.reminderHint', { amount: kwd(account.balance).replace(' KWD', '') })
                : t('finance.detail.reminderClear')}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => sendReminder('email')}
                disabled={sending !== null}
                className="px-3 py-2 bg-pair-600 text-white rounded-lg text-sm font-medium hover:bg-pair-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-pair-500"
              >
                {sending === 'email' ? t('finance.detail.sending') : t('finance.detail.sendEmail')}
              </button>
              <button
                type="button"
                onClick={() => sendReminder('push')}
                disabled={sending !== null}
                className="px-3 py-2 border border-pair-600 text-pair-700 rounded-lg text-sm font-medium hover:bg-pair-50 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-pair-500"
              >
                {sending === 'push' ? t('finance.detail.sending') : t('finance.detail.sendPush')}
              </button>
            </div>
            {result && (
              <p className={`mt-3 text-sm px-3 py-2 rounded-lg ${
                result.ok ? 'bg-oasis-50 text-oasis-700' : 'bg-danger-50 text-danger-700'
              }`}>
                {result.message}
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
