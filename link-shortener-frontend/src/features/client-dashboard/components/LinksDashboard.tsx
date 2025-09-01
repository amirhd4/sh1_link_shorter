import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { linkService } from '../../../services/linkService';
import { DataGrid, type GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Alert, Box, CircularProgress, Typography, Button, Snackbar } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { CreateLinkForm } from './CreateLinkForm';
import { ConfirmationDialog } from '../../../components/molecules/ConfirmationDialog';
import type { LinkDetails } from '../../../types/api';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

export function LinksDashboard() {
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();

  // State Management
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  // Data Fetching Query
  const { data: links, isLoading, isError, error } = useQuery({
    queryKey: ['my-links'],
    queryFn: linkService.getMyLinks,
  });

  // Delete Mutation
  const deleteMutation = useMutation({
      mutationFn: linkService.deleteLink,
      onSuccess: () => {
          setSnackbarMessage("لینک با موفقیت حذف شد.");
          queryClient.invalidateQueries({ queryKey: ['my-links'] });
      },
      onError: () => {
          setSnackbarMessage("خطا در حذف لینک. لطفاً دوباره تلاش کنید.");
      },
      onSettled: () => {
          setDeleteTarget(null);
      }
  });

  // Handlers
  const handleDeleteClick = (shortCode: string) => () => {
    setDeleteTarget(shortCode);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
        deleteMutation.mutate(deleteTarget);
    }
  };

  const handleEditClick = (shortCode: string) => () => {
      // TODO: منطق باز کردن مودال ویرایش در اینجا پیاده‌سازی خواهد شد
      console.log("Edit requested for:", shortCode);
      setSnackbarMessage("قابلیت ویرایش به زودی اضافه خواهد شد!");
  };

  const columns: GridColDef[] = [
    { field: 'short_code', headerName: 'کد کوتاه', width: 150 },
    { field: 'long_url', headerName: 'آدرس اصلی', flex: 1, minWidth: 250 },
    { field: 'clicks', headerName: 'تعداد کلیک', type: 'number', width: 130 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'عملیات',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={handleEditClick(id as string)}
          color="inherit"
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={handleDeleteClick(id as string)}
          color="inherit"
        />,
      ],
    },
  ];

  if (isLoading) {
    return <CircularProgress />;
  }

  if (isError) {
    return <Alert severity="error">{t('messages.error')}: {error.message}</Alert>;
  }

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">
            لینک‌های من
        </Typography>
        <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateModalOpen(true)}
        >
            ایجاد لینک جدید
        </Button>
      </Box>

      <Box sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={links || []}
          columns={columns}
          getRowId={(row: LinkDetails) => row.short_code}
          loading={deleteMutation.isPending}
          initialState={{
            pagination: { paginationModel: { page: 0, pageSize: 5 } },
          }}
          pageSizeOptions={[5, 10]}
        />
      </Box>

      <CreateLinkForm isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} />

      <ConfirmationDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="تایید حذف لینک"
        description="آیا از حذف این لینک اطمینان دارید؟ این عمل غیرقابل بازگشت است."
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