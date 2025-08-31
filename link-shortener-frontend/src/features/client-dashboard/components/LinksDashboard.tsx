import { useQuery } from '@tanstack/react-query';
import { linkService } from '../../../services/linkService';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

// تعریف ستون‌های گرید داده
const columns: GridColDef[] = [
  { field: 'short_code', headerName: 'کد کوتاه', width: 150 },
  { field: 'long_url', headerName: 'آدرس اصلی', flex: 1 },
  { field: 'clicks', headerName: 'تعداد کلیک', type: 'number', width: 130 },
];


export function LinksDashboard() {
  const { t } = useTranslation('common');

  const { data: links, isLoading, isError, error } = useQuery({
    queryKey: ['my-links'], // کلید منحصر به فرد برای کش کردن داده [cite: 298]
    queryFn: linkService.getMyLinks,
  });

  if (isLoading) {
    return <CircularProgress />;
  }

  if (isError) {
    return <Alert severity="error">{t('messages.error')}: {error.message}</Alert>;
  }

  return (
    <Box sx={{ height: 400, width: '100%' }}>
        <Typography variant="h4" gutterBottom>
            لینک‌های من
        </Typography>
      <DataGrid
        rows={links || []}
        columns={columns}
        getRowId={(row) => row.short_code} // مشخص کردن کلید منحصر به فرد هر ردیف
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10]}
        checkboxSelection
      />
    </Box>
  );
}