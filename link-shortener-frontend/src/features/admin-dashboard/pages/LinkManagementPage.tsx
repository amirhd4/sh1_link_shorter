import { useQuery } from '@tanstack/react-query';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import { adminService } from '../../../services/adminService';
import type { LinkDetailsForAdmin } from '../../../types/api';


const columns: GridColDef[] = [
  { field: 'short_code', headerName: 'کد کوتاه', width: 150 },
  {
    field: 'owner',
    headerName: 'صاحب لینک',
    width: 250,
    valueGetter: (value, row) => row.owner?.email || '---',
  },
  { field: 'long_url', headerName: 'آدرس اصلی', flex: 1, minWidth: 250 },
  { field: 'clicks', headerName: 'تعداد کلیک', type: 'number', width: 130 },
  {
    field: 'created_at',
    headerName: 'تاریخ ایجاد',
    width: 180,
    valueFormatter: (value) => new Date(value).toLocaleDateString('fa-IR'),
  },
];

export function LinkManagementPage() {
  const { data: links, isLoading, isError, error } = useQuery({
    queryKey: ['admin-all-links'],
    queryFn: adminService.getAllLinks,
  });

  if (isLoading) return <CircularProgress />;
  if (isError) return <Alert severity="error">خطا در دریافت لیست لینک‌ها: {error.message}</Alert>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        مدیریت تمام لینک‌ها
      </Typography>
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={links || []}
          columns={columns}
          getRowId={(row: LinkDetailsForAdmin) => row.short_code}
          loading={isLoading}
          initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
          pageSizeOptions={[10, 25, 50]}
        />
      </Box>
    </Box>
  );
}