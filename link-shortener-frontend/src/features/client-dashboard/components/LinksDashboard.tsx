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
// ✅ تلاش برای گرفتن locale رسمی از پکیج MUI/X
import * as gridLocales from '@mui/x-data-grid/locales';

const getFaGridLocale = () => {
  // برخی ورژن‌ها export مستقیم faIR دارند، برخی export کلی؛ با احتیاط دسترسی می‌دهیم
  const maybeFa = (gridLocales as any).faIR ?? (gridLocales as any).fa ?? (gridLocales as any).default?.faIR;
  if (maybeFa && maybeFa.components?.MuiDataGrid?.defaultProps?.localeText) {
    return maybeFa.components.MuiDataGrid.defaultProps.localeText;
  }
  // fallback: فقط کلیدهایی که مورد نیازیمان هستند را می‌سازیم
  return {
    // متن‌های رایج pagination و toolbar که معمولاً نیاز است
    MuiTablePagination: {
      labelDisplayedRows: ({ from, to, count }: { from: number; to: number; count: number }) =>
        `${from.toLocaleString('fa-IR')}–${to.toLocaleString('fa-IR')} از ${count !== -1 ? count.toLocaleString('fa-IR') : `بیش از ${to.toLocaleString('fa-IR')}`}`,
      labelRowsPerPage: 'تعداد سطرها در هر صفحه:',
    },
    // چند کلید دیگر که ممکن است نیاز داشته باشی (اضافه کن/ویرایش کن برحسب نیاز)
    noRowsLabel: 'بدون سطر',
    toolbarDensity: 'چگالی',
    toolbarFilters: 'فیلترها',
    toolbarExport: 'صدور',
    toolbarColumns: 'ستون‌ها',
    columnMenuLabel: 'منو',
    filterPanelOperators: 'عملگرها',
  } as any;
};


// const persianLocale = {
//     // از locale پیش‌فرض faIR استفاده می‌کنیم و فقط paginate را override می‌کنیم
//     ...faIR.components.MuiDataGrid.defaultProps.localeText,
//     // اگر خواستی بقیه کلیدها را هم بازنویسی کن
//     MuiTablePagination: {
//         // اگر faIR قبلاً شیئی داشت، آن را نگه‌دار
//         ...faIR.components.MuiDataGrid.defaultProps.localeText.MuiTablePagination,
//         labelDisplayedRows: ({from, to, count}: { from: number; to: number; count: number }) =>
//             `${from.toLocaleString('fa-IR')}–${to.toLocaleString('fa-IR')} از ${count !== -1 ? count.toLocaleString('fa-IR') : `بیش از ${to.toLocaleString('fa-IR')}`}`,
//         labelRowsPerPage: 'تعداد سطرها در هر صفحه:',
//     },
// };


export function LinksDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();

  // State Management
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<LinkDetails | null>(null); // <<<< وضعیت برای مودال ویرایش
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

  const faGridLocale = getFaGridLocale();
  const mergedLocaleText = {
    ...faGridLocale,
    // override/افزونهٔ خاص ما برای pagination
    paginationDisplayedRows: ({ from, to, count, estimated }: any) => {
      if (!estimated) {
        return `${from.toLocaleString('fa-IR')}–${to.toLocaleString('fa-IR')} از ${count !== -1 ? count.toLocaleString('fa-IR') : `بیش از ${to.toLocaleString('fa-IR')}`}`;
      }
      // اگر estimated ست شده، می‌تونیم برچسب متفاوتی بدهیم
      const estimateLabel = estimated && estimated > to ? `حدود ${estimated.toLocaleString('fa-IR')}` : `بیش از ${to.toLocaleString('fa-IR')}`;
      return `${from.toLocaleString('fa-IR')}–${to.toLocaleString('fa-IR')} از ${count !== -1 ? count.toLocaleString('fa-IR') : estimateLabel}`;
    },
    // کلید معمولیِ "Rows per page" هم مطمئناً ست کن:
    labelRowsPerPage: 'تعداد سطرها در هر صفحه:',
    // یا اگر mergedLocaleText قبلاً اینها را دارد، می‌توانی آنها را merge کنی
    ...(faGridLocale || {}),
  };
  console.log('mergedLocaleText:', mergedLocaleText);

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
  localeText={mergedLocaleText}
  // اگر خواستی backup با slotProps بذاری، اشکالی نیست، اما حذف componentsProps ضروریه:
  slotProps={{
    pagination: {
      // بعضی ورژن‌ها اینجا هم می‌پذیرند؛ ولی برای حل مشکل "of" نیازی نیست حتماً اینجا بنویسی
    },
  }}
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