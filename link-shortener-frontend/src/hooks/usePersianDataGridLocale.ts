import {faIR} from '@mui/x-data-grid/locales';


export function usePersianDataGridLocale() {
  return {
    ...faIR.components.MuiDataGrid.defaultProps.localeText,

    paginationAriaLabel: ({from, to, count}: { from: number; to: number; count: number }) => {
      const fromFa = from.toLocaleString('fa-IR');
      const toFa = to.toLocaleString('fa-IR');
      const countFa = count !== -1 ? count.toLocaleString('fa-IR') : `بیش از ${toFa}`;
      return `${fromFa}–${toFa} از ${countFa}`;
    },

    labelRowsPerPage: "تعداد سطرها در هر صفحه:",

    noRowsLabel: 'هیچ رکوردی یافت نشد',
    toolbarFilters: 'فیلترها',
    toolbarColumns: 'ستون‌ها',
    toolbarDensity: 'تراکم',
    toolbarExport: 'خروجی گرفتن',

    MuiTablePagination: {
      labelDisplayedRows: ({from, to, count}: { from: number; to: number; count: number }) => {
        const fromFa = from.toLocaleString('fa-IR');
        const toFa = to.toLocaleString('fa-IR');
        const countFa = count !== -1 ? count.toLocaleString('fa-IR') : `بیش از ${toFa}`;
        return `${fromFa}–${toFa} از ${countFa}`;
      },
      labelRowsPerPage: "تعداد سطرها در هر صفحه:",
    },
  };
}