import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { linkService } from '../../../services/linkService';
import { DataGrid, type GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Alert, Box, CircularProgress, Typography, Button, Snackbar } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { CreateLinkForm } from './CreateLinkForm';
import { EditLinkForm } from './EditLinkForm';
import { ConfirmationDialog } from '../../../components/molecules/ConfirmationDialog';
import type { LinkDetails } from '../../../types/api';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import { useNavigate } from 'react-router-dom';

import { Link as MuiLink, Tooltip } from '@mui/material';
import config from '../../../config';
import { usePersianDataGridLocale } from '../../../hooks/usePersianDataGridLocale';
// ✅ تلاش برای گرفتن locale رسمی از پکیج MUI/X
// import * as gridLocales from '@mui/x-data-grid/locales';


export function LinksDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();
  const localeText = usePersianDataGridLocale();


  // State Management
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<LinkDetails | null>(null);
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
          setSnackbarMessage("خطا در حذف لینک.");
      },
      onSettled: () => {
          setDeleteTarget(null);
      }
  });

  const handleDetailsClick = (shortCode: string) => () => {
    navigate(`/links/${shortCode}`); // هدایت به صفحه جزئیات لینک
  };

  // Handlers
  const handleDeleteClick = (shortCode: string) => () => {
    setDeleteTarget(shortCode);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
        deleteMutation.mutate(deleteTarget);
    }
  };

  const handleEditClick = (link: LinkDetails) => () => {
      setEditTarget(link); // <<<< باز کردن مودال ویرایش با اطلاعات لینک
  };

  const columns: GridColDef[] = [
    {
      field: 'short_code',
      headerName: 'کد کوتاه',
      width: 150,
      renderCell: (params) => (
        <MuiLink
          href={`${config.backendBaseUrl}/${params.value}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {params.value}
        </MuiLink>
      ),
    },
    { field: 'long_url', headerName: 'آدرس اصلی', flex: 1, minWidth: 250 },
    { field: 'clicks', headerName: 'تعداد کلیک', type: 'number', width: 130 },
    {
      field: 'created_at',
      headerName: 'تاریخ ایجاد',
      width: 180,
      valueFormatter: (value) => new Date(value).toLocaleDateString('fa-IR'),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'عملیات',
      width: 120,
      getActions: ({ row }) => [
        <Tooltip title="مشاهده آمار و جزئیات">
          <GridActionsCellItem
            icon={<AnalyticsIcon />}
            label="Details"
            onClick={handleDetailsClick(row.short_code)}
          />
        </Tooltip>,
        <Tooltip title="ویرایش لینک">
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            onClick={handleEditClick(row as LinkDetails)}
          />
        </Tooltip>,
        <Tooltip title="حذف لینک">
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(row.short_code as string)}
          />
        </Tooltip>,
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
          loading={isLoading || deleteMutation.isPending}
          initialState={{
            pagination: { paginationModel: { page: 0, pageSize: 5 } },
          }}
          localeText={localeText}
          pageSizeOptions={[5, 10]}
        />
      </Box>

      <CreateLinkForm isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} />

      <EditLinkForm
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        link={editTarget}
      />

      <ConfirmationDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="تایید حذف لینک"
        description="آیا از حذف این لینک اطمینان دارید؟ این عمل غیرقابل بازگشت است."
      />

      <Snackbar
        open={!!snackbarMessage}
        autoHideDuration={4000}
        onClose={() => setSnackbarMessage(null)}
        message={snackbarMessage}
      />
    </>
  );
}