'use client';

import { useState, useRef, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { SkeletonTable } from '@/components/Skeleton';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';
import Pagination from '@/components/Pagination';
import ConfirmDialog from '@/components/ConfirmDialog';
import RoleMenu from '@/components/RoleMenu';

const USERS_KEY = ['users'] as const;

interface AdminUser {
  id: string;
  email: string;
  name_en: string;
  name_ar: string;
  role: string;
  status: string;
  last_login: string | null;
}

const ROLES = ['super_admin', 'university_admin', 'advisor', 'staff'] as const;
const PAGE_SIZE = 10;

export default function UsersPage() {
  const { t, locale, isRTL } = useI18n();
  const qc = useQueryClient();

  const { data: users = [], isError, isLoading, refetch } = useQuery<AdminUser[]>({
    queryKey: USERS_KEY,
    queryFn: () => api.getUsers() as Promise<AdminUser[]>,
  });

  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', name_en: '', name_ar: '', role: 'staff' });
  const [creating, setCreating] = useState(false);

  const [page, setPage] = useState(1);

  const [pendingRoleChange, setPendingRoleChange] = useState<{
    userId: string;
    userName: string;
    newRole: string;
  } | null>(null);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [importBanner, setImportBanner] = useState<string | null>(null);

  // Bulk operations
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkRole, setBulkRole] = useState('staff');
  const [bulkConfirm, setBulkConfirm] = useState<{ type: 'role' | 'suspend'; message: string } | null>(null);

  // Export filters
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [exportFilters, setExportFilters] = useState({ college: '', year: '', status: '' });
  const [exporting, setExporting] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  const getRoleName = (role?: string) => {
    const map: Record<string, string> = {
      super_admin: t('users.superAdmin'),
      university_admin: t('users.universityAdmin'),
      advisor: t('users.advisor'),
      staff: t('users.staff'),
    };
    return map[role || ''] || role || '';
  };

  const totalItems = users.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return users.slice(start, start + PAGE_SIZE);
  }, [users, page]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const user = (await api.createUser(newUser)) as unknown as AdminUser;
      qc.setQueryData<AdminUser[]>(USERS_KEY, (prev) => (prev ? [...prev, user] : [user]));
      setShowForm(false);
      setNewUser({ email: '', name_en: '', name_ar: '', role: 'staff' });
    } finally {
      setCreating(false);
    }
  };

  const requestRoleChange = (user: AdminUser, newRole: string) => {
    if (newRole === user.role) return;
    setPendingRoleChange({
      userId: user.id,
      userName: locale === 'ar' ? user.name_ar : user.name_en,
      newRole,
    });
  };

  const confirmRoleChange = async () => {
    if (!pendingRoleChange) return;
    const { userId, newRole } = pendingRoleChange;
    await api.updateRole(userId, newRole);
    qc.setQueryData<AdminUser[]>(USERS_KEY, (prev) =>
      prev?.map((u) => u.id === userId ? { ...u, role: newRole } : u) ?? prev,
    );
    setPendingRoleChange(null);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedUsers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedUsers.map((u) => u.id)));
    }
  };

  const handleBulkRoleChange = async () => {
    setBulkConfirm(null);
    await api.bulkUpdateRole(Array.from(selectedIds), bulkRole);
    qc.setQueryData<AdminUser[]>(USERS_KEY, (prev) =>
      prev?.map((u) => selectedIds.has(u.id) ? { ...u, role: bulkRole } : u) ?? prev,
    );
    setSuccessMsg(t('users.bulkSuccess', { count: selectedIds.size }));
    setSelectedIds(new Set());
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleBulkSuspend = async () => {
    setBulkConfirm(null);
    await api.bulkSuspend(Array.from(selectedIds));
    qc.setQueryData<AdminUser[]>(USERS_KEY, (prev) =>
      prev?.map((u) => selectedIds.has(u.id) ? { ...u, status: 'inactive' } : u) ?? prev,
    );
    setSuccessMsg(t('users.bulkSuccess', { count: selectedIds.size }));
    setSelectedIds(new Set());
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleExportFiltered = async () => {
    setExporting(true);
    try {
      const data = (await api.exportStudentsFiltered(exportFilters)) as { export_id: string; total_records: number };
      setSuccessMsg(t('users.exportReady', { count: data.total_records, id: data.export_id }));
      setShowExportPanel(false);
      setTimeout(() => setSuccessMsg(null), 4000);
    } finally {
      setExporting(false);
    }
  };

  const handleExport = async () => {
    setSuccessMsg(null);
    const data = (await api.exportStudents()) as { export_id: string; total_records: number };
    const msg = t('users.exportReady', { count: data.total_records, id: data.export_id });
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportBanner(t('users.importPreview', { file: file.name }));
    setTimeout(() => setImportBanner(null), 5000);
    e.target.value = '';
  };

  const roleBadge = (role: string) => {
    const colors: Record<string, string> = {
      super_admin: 'bg-purple-100 text-purple-700',
      university_admin: 'bg-blue-100 text-blue-700',
      advisor: 'bg-oasis-100 text-oasis-700',
      staff: 'bg-gray-100 text-gray-700',
    };
    return colors[role] || colors.staff;
  };

  const primaryName = (u: AdminUser) => locale === 'ar' ? u.name_ar : u.name_en;
  const secondaryName = (u: AdminUser) => locale === 'ar' ? u.name_en : u.name_ar;

  if (isError) {
    return (
      <ErrorState
        title={t('common.error')}
        description={t('common.errorDescription')}
        onRetry={() => refetch()}
        retryLabel={t('common.retry')}
      />
    );
  }

  if (isLoading) {
    return (
      <div dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="h-7 bg-gray-200 rounded w-48 mb-6 animate-pulse" />
        <SkeletonTable rows={5} cols={5} />
      </div>
    );
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('users.title')}</h1>
        <div className="flex gap-3">
          <input
            type="file"
            accept=".csv"
            ref={fileRef}
            onChange={handleFileImport}
            className="hidden"
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {t('users.importStudents')}
          </button>
          <button
            onClick={() => setShowExportPanel(!showExportPanel)}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {t('users.exportStudents')}
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 text-sm bg-pair-600 text-white rounded-lg hover:bg-pair-700"
          >
            {t('users.addAdmin')}
          </button>
        </div>
      </div>

      {successMsg && (
        <div role="status" aria-live="polite" className="bg-oasis-50 border border-oasis-200 rounded-lg p-3 mb-4 flex items-center justify-between">
          <p className="text-sm text-oasis-700">{successMsg}</p>
          <button onClick={() => setSuccessMsg(null)} aria-label={t('common.cancel')} className="text-oasis-500 hover:text-oasis-700 text-sm ms-4">&times;</button>
        </div>
      )}

      {importBanner && (
        <div role="status" aria-live="polite" className="bg-oasis-50 border border-oasis-200 rounded-lg p-3 mb-4 flex items-center justify-between">
          <p className="text-sm text-oasis-700">{importBanner}</p>
          <button onClick={() => setImportBanner(null)} aria-label={t('common.cancel')} className="text-oasis-500 hover:text-oasis-700 text-sm ms-4">&times;</button>
        </div>
      )}

      {/* Export Filters Panel */}
      {showExportPanel && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4">
          <h3 className="text-sm font-semibold">{t('users.exportFilters')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('users.exportCollege')}</label>
              <select
                value={exportFilters.college}
                onChange={(e) => setExportFilters({ ...exportFilters, college: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">{t('users.allColleges')}</option>
                <option value="computer_science">Computer Science</option>
                <option value="engineering">Engineering</option>
                <option value="business">Business</option>
                <option value="science">Science</option>
                <option value="arts">Arts</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('users.exportYear')}</label>
              <select
                value={exportFilters.year}
                onChange={(e) => setExportFilters({ ...exportFilters, year: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">{t('users.allYears')}</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
                <option value="5">5th Year</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('users.exportStatus')}</label>
              <select
                value={exportFilters.status}
                onChange={(e) => setExportFilters({ ...exportFilters, status: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">{t('users.allStatuses')}</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="at_risk">At-Risk</option>
                <option value="probation">Probation</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportFiltered}
              disabled={exporting}
              className="px-4 py-2 text-sm bg-pair-600 text-white rounded-lg hover:bg-pair-700 disabled:opacity-50"
            >
              {exporting ? t('users.exporting') : t('users.exportWithFilters')}
            </button>
            <button
              onClick={() => setShowExportPanel(false)}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-pair-50 border border-pair-200 rounded-lg p-3 mb-4 flex items-center gap-4 flex-wrap">
          <span className="text-sm font-medium text-pair-700">{t('users.selected', { count: selectedIds.size })}</span>
          <div className="flex items-center gap-2">
            <select
              value={bulkRole}
              onChange={(e) => setBulkRole(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{getRoleName(r)}</option>
              ))}
            </select>
            <button
              onClick={() => setBulkConfirm({ type: 'role', message: t('users.bulkConfirmRole', { count: selectedIds.size, role: getRoleName(bulkRole) }) })}
              className="px-3 py-1.5 text-sm bg-pair-600 text-white rounded-lg hover:bg-pair-700"
            >
              {t('users.bulkChangeRole')}
            </button>
          </div>
          <button
            onClick={() => setBulkConfirm({ type: 'suspend', message: t('users.bulkConfirmSuspend', { count: selectedIds.size }) })}
            className="px-3 py-1.5 text-sm bg-danger-600 text-white rounded-lg hover:bg-danger-700"
          >
            {t('users.bulkSuspend')}
          </button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="new-user-email" className="block text-xs font-medium text-gray-700 mb-1">{t('users.email')}</label>
              <input
                id="new-user-email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="new-user-name-en" className="block text-xs font-medium text-gray-700 mb-1">{t('users.nameEn')}</label>
              <input
                id="new-user-name-en"
                type="text"
                value={newUser.name_en}
                onChange={(e) => setNewUser({ ...newUser, name_en: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                dir="ltr"
                required
              />
            </div>
            <div>
              <label htmlFor="new-user-name-ar" className="block text-xs font-medium text-gray-700 mb-1">{t('users.nameAr')}</label>
              <input
                id="new-user-name-ar"
                type="text"
                value={newUser.name_ar}
                onChange={(e) => setNewUser({ ...newUser, name_ar: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                dir="rtl"
                required
              />
            </div>
          </div>
          <div className="flex items-end gap-4">
            <div>
              <label htmlFor="new-user-role" className="block text-xs font-medium text-gray-700 mb-1">{t('users.role')}</label>
              <select
                id="new-user-role"
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{getRoleName(r)}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 bg-pair-600 text-white text-sm rounded-lg hover:bg-pair-700 disabled:opacity-50"
            >
              {creating ? t('users.creating') : t('users.createUser')}
            </button>
          </div>
        </form>
      )}

      {users.length === 0 ? (
        <EmptyState title={t('users.noUsers')} />
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b bg-gray-50">
                  <th className="px-3 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === paginatedUsers.length && paginatedUsers.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-pair-600 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-start">{t('users.name')}</th>
                  <th className="px-6 py-3 text-start">{t('users.email')}</th>
                  <th className="px-6 py-3 text-start">{t('users.role')}</th>
                  <th className="px-6 py-3 text-start">{t('users.status')}</th>
                  <th className="px-6 py-3 text-start">{t('users.lastLogin')}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((u) => (
                  <tr key={u.id} className={`border-b border-gray-50 ${selectedIds.has(u.id) ? 'bg-pair-50/50' : ''}`}>
                    <td className="px-3 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(u.id)}
                        onChange={() => toggleSelect(u.id)}
                        className="w-4 h-4 text-pair-600 rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-medium">{primaryName(u)}</span>
                        <span className="block text-xs text-gray-400">{secondaryName(u)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{u.email}</td>
                    <td className="px-6 py-4">
                      <RoleMenu
                        value={u.role}
                        options={ROLES.map((r) => ({ value: r, label: getRoleName(r) }))}
                        badgeClass={roleBadge(u.role)}
                        ariaLabel={`${primaryName(u)}: ${t('users.role')}`}
                        onChange={(next) => requestRoleChange(u, next)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-xs ${u.status === 'active' ? 'bg-oasis-100 text-oasis-700' : 'bg-gray-100 text-gray-500'}`}>
                        {u.status === 'active' ? t('status.active') : t('status.inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {u.last_login
                        ? new Date(u.last_login).toLocaleString(locale === 'ar' ? 'ar-KW' : 'en-GB')
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </>
      )}

      <ConfirmDialog
        open={!!pendingRoleChange}
        title={t('users.confirmRoleChange')}
        message={t('users.confirmRoleChangeMessage', {
          name: pendingRoleChange?.userName ?? '',
          role: getRoleName(pendingRoleChange?.newRole),
        })}
        onConfirm={confirmRoleChange}
        onCancel={() => setPendingRoleChange(null)}
      />

      <ConfirmDialog
        open={!!bulkConfirm}
        title={t('users.bulkActions')}
        message={bulkConfirm?.message ?? ''}
        onConfirm={bulkConfirm?.type === 'role' ? handleBulkRoleChange : handleBulkSuspend}
        onCancel={() => setBulkConfirm(null)}
      />
    </div>
  );
}
