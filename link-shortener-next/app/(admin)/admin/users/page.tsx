"use client";

import {useEffect, useState, useMemo} from 'react'; // اضافه شدن useMemo
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataGrid, type GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Alert, Box, CircularProgress, Typography, Chip, Tooltip, Snackbar, Paper, TextField, InputAdornment } from '@mui/material'; // اضافه شدن TextField و InputAdornment
import { adminService } from '@/services/adminService';
import type { UserResponse } from '@/types/api';
import { usePersianDataGridLocale } from '@/hooks/usePersianDataGridLocale';
import { ConfirmationDialog } from '@/components/molecules/ConfirmationDialog';
import { AssignPlanModal } from '@/components/admin-dashboard/AssignPlanModal';
import Link  from "next/link";

// Import Icons
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import SearchIcon from '@mui/icons-material/Search'; // اضافه شدن آیکون جستجو
import theme from "@/styles/theme";
import { CustomNoRowsOverlay } from '@/components/molecules/CustomNoRowsOverlay';


export default function UserManagementPage() {
  const queryClient = useQueryClient();
  const localeText = usePersianDataGridLocale();

  // States for managing modals and notifications
  const [assignPlanUser, setAssignPlanUser] = useState<UserResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserResponse | null>(null);
  const [toggleActiveTarget, setToggleActiveTarget] = useState<UserResponse | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>(''); // <<< جدید: State برای عبارت جستجو
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>(''); // <<< جدید: برای Debounce

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
    onError: (error: any) => {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        'خطای غیرمنتظره‌ای رخ داد';
      setSnackbarMessage(message);
    },
    onSettled: () => setDeleteTarget(null),
  });

  // Mutation for toggling user's active status
  const toggleActiveMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: number; isActive: boolean }) =>
      adminService.updateUserActive(userId, isActive),
    onSuccess: (updatedUser) => {
      setSnackbarMessage(
        `وضعیت کاربر به '${updatedUser.is_active ? 'فعال' : 'غیرفعال'}' تغییر کرد.`
      );
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        'خطای غیرمنتظره‌ای رخ داد';
      setSnackbarMessage(message);
    },
    onSettled: () => setToggleActiveTarget(null),
  });

  useEffect(() => {
    document.title = "مدیریت کاربران";
  }, []);

  // <<< جدید: Debounce effect برای جستجو
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500 میلی‌ثانیه تأخیر

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);


  // <<< جدید: فیلتر کردن کاربران بر اساس عبارت جستجو
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!debouncedSearchTerm) return users;

    const lowercasedSearchTerm = debouncedSearchTerm.toLowerCase();

    return users.filter(user =>
      user.first_name?.toLowerCase().includes(lowercasedSearchTerm) ||
      user.last_name?.toLowerCase().includes(lowercasedSearchTerm) ||
      user.phone_number?.toLowerCase().includes(lowercasedSearchTerm) ||
      user.plan?.name?.toLowerCase().includes(lowercasedSearchTerm) ||
      user.id.toString().includes(lowercasedSearchTerm)
      // می‌توانید فیلدهای دیگری را نیز اضافه کنید
    );
  }, [users, debouncedSearchTerm]);


  // Column definitions for the DataGrid
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ش', width: 90 },
    { field: "first_name", headerName: "نام.ک"},
    { field: "last_name", headerName: "نام.خ"},
    {
      field: 'phone_number',
      headerName: 'شماره',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Link href={`/admin/users/${params.row.id}`}>
          {params.row.phone_number}
        </Link>
      ),
    },
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
      width: 180,
      getActions: ({ row }) => [
        <Tooltip title="تغییر پلن">
            <GridActionsCellItem icon={<EditIcon />} label="Change Plan" onClick={() => setAssignPlanUser(row)} />
        </Tooltip>,
        <Tooltip title={row.is_active ? "غیرفعال کردن کاربر" : "فعال کردن کاربر"}>
          <GridActionsCellItem
            disabled={toggleActiveMutation.isPending}
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

        {/* <<< جدید: فیلد جستجو */}
        <TextField
          label="جستجو در کاربران"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }} // فاصله از جدول
        />

        <Paper sx={{ height: 650, width: '100%' }}>
          <DataGrid
            rows={filteredUsers}
            columns={columns}
            getRowId={(row: UserResponse) => row.id}
            loading={isLoading || deleteMutation.isPending || toggleActiveMutation.isPending}
            localeText={localeText}
            initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
            pageSizeOptions={[10, 25, 50]}
            slots={{
              noRowsOverlay: CustomNoRowsOverlay,
            }}
            density="compact"
            disableColumnFilter
            disableColumnSelector
          />
        </Paper>
      </Box>

      {/* Modals and Dialogs for actions */}
      <ConfirmationDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title={`حذف کاربر ${deleteTarget?.phone_number}`}
        description="آیا از حذف کامل این کاربر اطمینان دارید؟ این عمل غیرقابل بازگشت است و تمام لینک‌های او نیز حذف خواهد شد."
      />
      <ConfirmationDialog
        open={!!toggleActiveTarget}
        onClose={() => setToggleActiveTarget(null)}
        onConfirm={() =>
          toggleActiveTarget &&
          toggleActiveMutation.mutate({
            userId: toggleActiveTarget.id,
            isActive: !toggleActiveTarget.is_active,
          })
        }
        title={`تغییر وضعیت کاربر ${toggleActiveTarget?.phone_number}`}
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
