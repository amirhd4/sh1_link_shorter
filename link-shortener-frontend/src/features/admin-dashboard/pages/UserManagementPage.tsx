import { useQuery } from '@tanstack/react-query';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import { adminService } from '../../../services/adminService';
import type { UserResponse } from '../../../types/api';

// تعریف ستون‌های جدول کاربران
const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'email', headerName: 'ایمیل', flex: 1, minWidth: 200 },
  { field: 'role', headerName: 'نقش', width: 130 },
  {
    field: 'plan',
    headerName: 'پلن فعلی',
    width: 150,
    // از آنجایی که plan یک آبجکت است، با valueGetter مقدار آن را نمایش می‌دهیم
    valueGetter: (value, row) => row.plan?.name || '---',
  },
  {
    field: 'subscription_end_date',
    headerName: 'تاریخ انقضای اشتراک',
    width: 180,
    // فرمت کردن تاریخ برای نمایش بهتر
    valueFormatter: (value) => {
      if (!value) return '---';
      return new Date(value).toLocaleDateString('fa-IR');
    }
  },
];

export function UserManagementPage() {
  const { data: users, isLoading, isError, error } = useQuery({
    queryKey: ['admin-users'], // یک کلید جداگانه برای کش داده‌های ادمین
    queryFn: adminService.getAllUsers,
  });

  if (isLoading) {
    return <CircularProgress />;
  }

  if (isError) {
    return <Alert severity="error">خطا در دریافت لیست کاربران: {error.message}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        مدیریت کاربران
      </Typography>
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={users || []}
          columns={columns}
          getRowId={(row: UserResponse) => row.id}
          loading={isLoading}
          initialState={{
            pagination: { paginationModel: { page: 0, pageSize: 10 } },
          }}
          pageSizeOptions={[10, 25, 50]}
        />
      </Box>
    </Box>
  );
}