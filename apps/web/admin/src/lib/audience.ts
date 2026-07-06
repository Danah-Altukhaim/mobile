import { STAFF_DEPARTMENTS, type StudentLifeEvent } from './api';

type Translate = (key: string, params?: Record<string, string | number>) => string;

/** Human-readable chips describing an event's (multi-select) audience. */
export function audienceChips(event: StudentLifeEvent, t: Translate, isAr: boolean): string[] {
  return event.audience.map((tag) => {
    if (tag === 'specific') {
      const detail = isAr ? event.audience_detail_ar : event.audience_detail_en;
      return detail
        ? `${t('studentLife.audience.specific')} - ${detail}`
        : t('studentLife.audience.specific');
    }
    if (tag === 'staff') {
      if (event.staff_scope === 'departments' && event.staff_departments?.length) {
        const names = STAFF_DEPARTMENTS
          .filter((d) => event.staff_departments?.includes(d.key))
          .map((d) => (isAr ? d.label_ar : d.label_en))
          .join(isAr ? '، ' : ', ');
        return `${t('studentLife.audience.staff')} - ${names}`;
      }
      return `${t('studentLife.audience.staff')} (${t('studentLife.staffAll')})`;
    }
    return t(`studentLife.audience.${tag}`);
  });
}
