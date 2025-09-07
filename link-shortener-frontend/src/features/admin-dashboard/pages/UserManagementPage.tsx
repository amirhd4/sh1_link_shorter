import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataGrid, type GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Alert, Box, CircularProgress, Typography, Chip, Tooltip, Snackbar, Paper } from '@mui/material';
import { adminService } from '../../../services/adminService';
import type { UserResponse } from '../../../types/api';
import { usePersianDataGridLocale } from '../../../hooks/usePersianDataGridLocale';
import { ConfirmationDialog } from '../../../components/molecules/ConfirmationDialog';
import { AssignPlanModal } from '../components/AssignPlanModal';

// Import Icons
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import theme from "../../../styles/theme.ts";
import { CustomNoRowsOverlay } from '../../../components/molecules/CustomNoRowsOverlay.tsx'; // <<< بهبود ۱: ایمپورت کامپوننت حالت خالی

export function UserManagementPage() {
  const queryClient = useQueryClient();
  const localeText = usePersianDataGridLocale();

  // States for managing modals and notifications
  const [assignPlanUser, setAssignPlanUser] = useState<UserResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserResponse | null>(null);
  const [toggleActiveTarget, setToggleActiveTarget] = useState<UserResponse | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  // Query to fetch all users
  const { data: users, isLoading, isError, error } = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminService.getAllUsers,
  });

  // Mutation for deleting a user
  const deleteMutation = useMutation({
    mutationFn: adminService.deleteUser,
    onSuccess: () => {
      setSnackbarMessage('کاربر با موفقیت حذف شد.');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => {
      setSnackbarMessage('خطا در حذف کاربر.');
    },
    onSettled: () => setDeleteTarget(null),
  });

  // Mutation for toggling user's active status
  const toggleActiveMutation = useMutation({
    mutationFn: adminService.toggleUserActive,
    onSuccess: (updatedUser) => {
      setSnackbarMessage(`وضعیت کاربر به '${updatedUser.is_active ? 'فعال' : 'غیرفعال'}' تغییر کرد.`);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => {
      setSnackbarMessage('خطا در تغییر وضعیت کاربر.');
    },
    onSettled: () => setToggleActiveTarget(null),
  });

  // Column definitions for the DataGrid
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'email', headerName: 'ایمیل', flex: 1, minWidth: 200 },
    {
      field: 'plan',
      headerName: 'پلن فعلی',
      width: 150,
      valueGetter: (value, row) => row.plan?.name || '---',
    },
    {
      field: 'subscription_end_date',
      headerName: 'پایان اشتراک',
      width: 150,
      valueFormatter: (value) => value ? new Date(value as string).toLocaleDateString('fa-IR') : 'نامحدود',
    },
    {
      field: 'is_active',
      headerName: 'وضعیت',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'فعال' : 'غیرفعال'}
          color={params.value ? 'success' : 'error'}
          size="small"
        />
      )
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'عملیات',
      width: 180, // <<< بهبود ۲: افزایش عرض ستون برای نمایش بهتر آیکون‌ها
      getActions: ({ row }) => [
        <Tooltip title="تغییر پلن">
            <GridActionsCellItem icon={<EditIcon />} label="Change Plan" onClick={() => setAssignPlanUser(row)} />
        </Tooltip>,
        <Tooltip title={row.is_active ? "غیرفعال کردن کاربر" : "فعال کردن کاربر"}>
          <GridActionsCellItem
            icon={row.is_active ? <ToggleOffIcon /> : <ToggleOnIcon />}
            label="Toggle Active"
            onClick={() => setToggleActiveTarget(row)}
          />
        </Tooltip>,
        <Tooltip title="حذف کامل کاربر">
            <GridActionsCellItem
              icon={<DeleteIcon />}
              label=""
              onClick={() => setDeleteTarget(row)}
              showInMenu
              style={{ color: theme.palette.error.main }}
            />
        </Tooltip>,
      ],
    },
  ];

  if (isLoading) {
    return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;
  }

  if (isError) {
    return <Alert severity="error">خطا در دریافت لیست کاربران: {(error as Error).message}</Alert>;
  }

  return (
    <>
      <Box>
        <Typography variant="h4" gutterBottom>مدیریت کاربران</Typography>
        <Paper sx={{ height: 650, width: '100%' }}>
          <DataGrid
            rows={users || []}
            columns={columns}
            getRowId={(row: UserResponse) => row.id}
            loading={isLoading || deleteMutation.isPending || toggleActiveMutation.isPending}
            localeText={localeText}
            initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
            pageSizeOptions={[10, 25, 50]}
            slots={{
              noRowsOverlay: CustomNoRowsOverlay, // <<< بهبود ۱: استفاده از کامپوننت سفارشی
            }}
            density="compact" // <<< بهبود ۴: فشرده‌سازی جدول برای نمایش اطلاعات بیشتر
            disableColumnFilter // <<< بهبود ۵: حذف دکمه فیلتر برای سادگی
            disableColumnSelector // <<< بهبود ۵: حذف دکمه انتخاب ستون برای سادگی
          />
        </Paper>
      </Box>

      {/* Modals and Dialogs for actions */}
      <ConfirmationDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title={`حذف کاربر ${deleteTarget?.email}`}
        description="آیا از حذف کامل این کاربر اطمینان دارید؟ این عمل غیرقابل بازگشت است و تمام لینک‌های او نیز حذف خواهد شد."
      />
      <ConfirmationDialog
        open={!!toggleActiveTarget}
        onClose={() => setToggleActiveTarget(null)}
        onConfirm={() => toggleActiveTarget && toggleActiveMutation.mutate(toggleActiveTarget.id)}
        title={`تغییر وضعیت کاربر ${toggleActiveTarget?.email}`}
        description={`آیا از ${toggleActiveTarget?.is_active ? 'غیرفعال' : 'فعال'} کردن این کاربر اطمینان دارید؟`}
      />
      <AssignPlanModal
        open={!!assignPlanUser}
        onClose={() => setAssignPlanUser(null)}
        user={assignPlanUser}
      />
      <Snackbar
        open={!!snackbarMessage}
        autoHideDuration={4000}
        onClose={() => setSnackbarMessage(null)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
}