import { faIR } from '@mui/x-data-grid/locales';

/**
 * یک هوک سفارشی که آبجکت کامل و بی‌نقص متن‌های فارسی را برای
 * کامپوننت MUI DataGrid فراهم می‌کند.
 * این هوک متن‌های پیش‌فرض را با بازنویسی‌های سفارشی ترکیب می‌کند.
 */
export function usePersianDataGridLocale() {
  const localeText = {
    // استفاده از تمام متن‌های فارسی پیش‌فرض از پکیج MUI
    ...faIR.components.MuiDataGrid.defaultProps.localeText,

    // بازنویسی و شخصی‌سازی متن صفحه‌بندی برای اطمینان از عملکرد صحیح
    MuiTablePagination: {
      labelDisplayedRows: ({ from, to, count }: { from: number; to: number; count: number }) =>
        `${from.toLocaleString('fa-IR')}–${to.toLocaleString('fa-IR')} از ${count !== -1 ? count.toLocaleString('fa-IR') : `بیش از ${to.toLocaleString('fa-IR')}`}`,
      labelRowsPerPage: "تعداد سطرها در هر صفحه:",
    },

    // می‌توانید هر متن دیگری را نیز در اینجا بازنویسی کنید
    noRowsLabel: 'هیچ رکوردی یافت نشد',
    toolbarFilters: 'فیلترها',
  };

  return localeText;
}