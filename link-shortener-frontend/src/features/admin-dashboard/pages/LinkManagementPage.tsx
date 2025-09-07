import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataGrid, type GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Alert, Box, CircularProgress, Typography, Snackbar } from '@mui/material';
import { adminService } from '../../../services/adminService';
import type { LinkDetailsForAdmin } from '../../../types/api';
import { ConfirmationDialog } from '../../../components/molecules/ConfirmationDialog';

import DeleteIcon from '@mui/icons-material/Delete';
import { usePersianDataGridLocale } from '../../../hooks/usePersianDataGridLocale';


export function LinkManagementPage() {
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const localeText = usePersianDataGridLocale();

  const { data: links, isLoading, isError, error } = useQuery({
    queryKey: ['admin-all-links'],
    queryFn: adminService.getAllLinks,
  });

  const deleteMutation = useMutation({
    mutationFn: adminService.deleteLink,
    onSuccess: () => {
      setSnackbarMessage("لینک با موفقیت توسط ادمین حذف شد.");
      queryClient.invalidateQueries({ queryKey: ['admin-all-links'] });
    },
    onError: () => {
      setSnackbarMessage("خطا در حذف لینک.");
    },
    onSettled: () => {
      setDeleteTarget(null);
    },
  });

  const handleDeleteClick = (shortCode: string) => () => {
    setDeleteTarget(shortCode);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget);
    }
  };

  const columns: GridColDef[] = [
    { field: 'short_code', headerName: 'کد کوتاه', width: 150 },
    {
      field: 'owner',
      headerName: 'صاحب لینک',
      width: 250,
      valueGetter: (value, row) => row.owner?.email || '---',
    },
    { field: 'long_url', headerName: 'آدرس اصلی', flex: 1, minWidth: 250 },
    { field: 'clicks', headerName: 'تعداد کلیک', type: 'number', width: 100 },
    {
      field: 'created_at',
      headerName: 'تاریخ ایجاد',
      width: 150,
      valueFormatter: (value) => new Date(value).toLocaleDateString('fa-IR'),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'عملیات',
      width: 80,
      getActions: ({ row }) => [
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={handleDeleteClick(row.short_code as string)}
          color="inherit"
        />,
      ],
    },
  ];

  if (isLoading) return <CircularProgress />;
  if (isError) return <Alert severity="error">خطا در دریافت لیست لینک‌ها: {error.message}</Alert>;

  return (
    <>
      <Box>
        <Typography variant="h4" gutterBottom>
          مدیریت تمام لینک‌ها
        </Typography>
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={links || []}
            columns={columns}
            getRowId={(row: LinkDetailsForAdmin) => row.short_code}
            loading={isLoading || deleteMutation.isPending}
            initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
            localeText={localeText}
            pageSizeOptions={[10, 25, 50]}
          />
        </Box>
      </Box>

      <ConfirmationDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="تایید حذف لینک"
        description="آیا از حذف این لینک از کل سیستم اطمینان دارید؟ این عمل غیرقابل بازگشت است."
      />

      <Snackbar
        open={!!snackbarMessage}
        autoHideDuration={6000}
        onClose={() => setSnackbarMessage(null)}
        message={snackbarMessage}
      />
    </>
  );
}