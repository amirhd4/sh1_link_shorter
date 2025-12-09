import { useMemo } from 'react';
import { faIR as faIRLocale } from '@mui/x-data-grid/locales';

export function usePersianDataGridLocale() {
  return useMemo(() => {
    // تلاش برای استفاده از locale اصلی MUI
    const baseLocaleText = faIRLocale?.components?.MuiDataGrid?.defaultProps?.localeText;

    if (baseLocaleText) {
      return {
        ...baseLocaleText,
        paginationDisplayedRows: ({ from, to, count, estimated }: any) => {
          if (!estimated) {
            return `${from.toLocaleString('fa-IR')}–${to.toLocaleString('fa-IR')} از ${count !== -1 ? count.toLocaleString('fa-IR') : `بیش از ${to.toLocaleString('fa-IR')}`}`;
          }
          const estimateLabel = estimated > to
            ? `حدود ${estimated.toLocaleString('fa-IR')}`
            : `بیش از ${to.toLocaleString('fa-IR')}`;
          return `${from.toLocaleString('fa-IR')}–${to.toLocaleString('fa-IR')} از ${count !== -1 ? count.toLocaleString('fa-IR') : estimateLabel}`;
        },
        // در صورت نیاز، ترجمه‌های بیشتر را اینجا اضافه فرمایید
        // توجه: اگر `labelRowsPerPage` در baseLocaleText تعریف شده باشد، می‌توانید آن را سوا شود یا override کنید
        // labelRowsPerPage: ...
      };
    }

    // در صورت نبود locale رسمی، fallback خودتان را بازگردانید
    return {
      MuiTablePagination: {
        labelDisplayedRows: ({ from, to, count }: { from: number; to: number; count: number }) =>
          `${from.toLocaleString('fa-IR')}–${to.toLocaleString('fa-IR')} از ${count !== -1 ? count.toLocaleString('fa-IR') : `بیش از ${to.toLocaleString('fa-IR')}`}`,
        labelRowsPerPage: 'تعداد سطرها در هر صفحه:',
      },
      noRowsLabel: 'بدون سطر',
      toolbarDensity: 'چگالی',
      toolbarFilters: 'فیلترها',
      toolbarExport: 'صدور',
      toolbarColumns: 'ستون‌ها',
      columnMenuLabel: 'منو',
      filterPanelOperators: 'عملگرها',
      paginationDisplayedRows: ({ from, to, count, estimated }: any) => {
        if (!estimated) {
          return `${from.toLocaleString('fa-IR')}–${to.toLocaleString('fa-IR')} از ${count !== -1 ? count.toLocaleString('fa-IR') : `بیش از ${to.toLocaleString('fa-IR')}`}`;
        }
        const estimateLabel = estimated > to
          ? `حدود ${estimated.toLocaleString('fa-IR')}`
          : `بیش از ${to.toLocaleString('fa-IR')}`;
        return `${from.toLocaleString('fa-IR')}–${to.toLocaleString('fa-IR')} از ${count !== -1 ? count.toLocaleString('fa-IR') : estimateLabel}`;
      },
    } as any;
  }, []);
}
