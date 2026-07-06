import { useQuery } from '@tanstack/react-query';
import { academicApi, apiClient } from '../services/api';
import { API_PATHS } from '@masari/shared';

/**
 * CCK Hub Feedback v3 — "Requests": TWIMC & Transcript requests cannot be made
 * unless outstanding balance is paid AND installments are up to date.
 *
 * Returns true (blocked) when either condition fails.
 */
export function useFinanceGate(): {
  isLoading: boolean;
  blocked: boolean;
  balanceDue: number;
  overdueInstallments: number;
} {
  const fees = useQuery({
    queryKey: ['student', 'fees'],
    queryFn: () => academicApi.getFees(),
  });

  const installments = useQuery({
    queryKey: ['installments'],
    queryFn: () => apiClient.get<any>(API_PATHS.PAYMENT_INSTALLMENTS),
  });

  const balanceDue = Number(fees.data?.data?.balance_due ?? 0);
  const today = new Date();
  const list = installments.data?.data?.installments ?? [];
  const overdue = list.filter((inst: any) => {
    if (inst.status === 'paid') return false;
    if (!inst.due_date) return false;
    return new Date(inst.due_date) < today;
  }).length;

  return {
    isLoading: fees.isLoading || installments.isLoading,
    blocked: balanceDue > 0 || overdue > 0,
    balanceDue,
    overdueInstallments: overdue,
  };
}
