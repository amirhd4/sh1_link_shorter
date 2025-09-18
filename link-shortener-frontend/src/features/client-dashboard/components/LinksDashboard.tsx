import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { linkService } from '../../../services/linkService';
import { DataGrid, type GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { 
    Alert, 
    Box, 
    CircularProgress, 
    Typography, 
    Button, 
    Snackbar,
    Container, // ✨ NEW: For better layout and margins
    Paper,     // ✨ NEW: To elevate the main content
    Stack,     // ✨ NEW: For easier header layout
    Tooltip,
    useMediaQuery, // 📱 NEW: For responsive logic
    useTheme,      // 📱 NEW: To access breakpoints
    Card,          // 📱 NEW: For mobile view
    CardContent,   // 📱 NEW: For mobile view
    CardActions,   // 📱 NEW: For mobile view
    IconButton,    // 📱 NEW: For mobile action buttons
    Divider,       // ✨ NEW: For visual separation in mobile view
    Link as MuiLink 
} from '@mui/material';
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

import config from '../../../config';
import { usePersianDataGridLocale } from '../../../hooks/usePersianDataGridLocale';

// 📱 A new component for rendering a single link on mobile devices
const MobileLinkCard = ({ link, onDetailsClick, onEditClick, onDeleteClick }: {
    link: LinkDetails,
    onDetailsClick: () => void,
    onEditClick: () => void,
    onDeleteClick: () => void,
}) => (
    <Card sx={{ mb: 2 }}>
        <CardContent>
            <Stack spacing={1.5}>
                <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>کد کوتاه</Typography>
                    <MuiLink href={`${config.backendBaseUrlOrigin}/${link.short_code}`} target="_blank" rel="noopener noreferrer" sx={{ fontWeight: 'bold' }}>
                        {link.short_code}
                    </MuiLink>
                </Box>
                <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>آدرس اصلی</Typography>
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            wordBreak: 'break-all', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                        }}
                    >
                        {link.long_url}
                    </Typography>
                </Box>
                <Stack direction="row" justifyContent="space-between">
                     <Box>
                        <Typography variant="body2" color="text.secondary">تعداد کلیک</Typography>
                        <Typography variant="body1">{link.clicks}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="body2" color="text.secondary">تاریخ ایجاد</Typography>
                        <Typography variant="body1">{new Date(link.created_at).toLocaleDateString('fa-IR')}</Typography>
                    </Box>
                </Stack>
            </Stack>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
            <Tooltip title="مشاهده آمار و جزئیات">
                <IconButton onClick={onDetailsClick}><AnalyticsIcon /></IconButton>
            </Tooltip>
            <Tooltip title="ویرایش لینک">
                <IconButton onClick={onEditClick}><EditIcon /></IconButton>
            </Tooltip>
            <Tooltip title="حذف لینک">
                <IconButton onClick={onDeleteClick} color="error"><DeleteIcon /></IconButton>
            </Tooltip>
        </CardActions>
    </Card>
);


export function LinksDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();
  const localeText = usePersianDataGridLocale();
  
  // 📱 Responsive hook
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // State Management (unchanged)
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<LinkDetails | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  // Data Fetching Query (unchanged)
  const { data: links, isLoading, isError, error } = useQuery({
    queryKey: ['my-links'],
    queryFn: linkService.getMyLinks,
  });

  // Delete Mutation (unchanged)
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

  // Handlers (unchanged)
  const handleDetailsClick = (shortCode: string) => () => {
    navigate(`/links/${shortCode}`);
  };

  const handleDeleteClick = (shortCode: string) => () => {
    setDeleteTarget(shortCode);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
        deleteMutation.mutate(deleteTarget);
    }
  };

  const handleEditClick = (link: LinkDetails) => () => {
      setEditTarget(link);
  };

  const columns: GridColDef[] = [
    {
      field: 'short_code',
      headerName: 'کد کوتاه',
      width: 150,
      renderCell: (params) => (
        <MuiLink
          href={`${config.backendBaseUrlOrigin}/${params.value}`}
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
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  if (isError) {
    return <Container sx={{ py: 4 }}><Alert severity="error">{t('messages.error')}: {error.message}</Alert></Container>;
  }

  return (
    <>
      {/* ✨ NEW: Using Container for better spacing and max-width */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* ✨ NEW: Using Stack for responsive header */}
        <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
            mb={3}
        >
          <Typography variant="h5" component="h1" fontWeight="bold">
            لینک‌های من
          </Typography>
          <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateModalOpen(true)}
              sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}
          >
            ایجاد لینک جدید
          </Button>
        </Stack>
        
        {/* ✨ NEW: Using Paper for elevation and better UI */}
        <Paper sx={{ p: { xs: 1, sm: 2 }, borderRadius: 2 }} elevation={2}>
            {/* 📱 NEW: Conditional rendering based on screen size */}
            {isMobile ? (
                <Box>
                    {links && links.length > 0 ? links.map((link) => (
                        <MobileLinkCard 
                            key={link.short_code}
                            link={link}
                            onDetailsClick={handleDetailsClick(link.short_code)}
                            onEditClick={handleEditClick(link)}
                            onDeleteClick={handleDeleteClick(link.short_code)}
                        />
                    )) : (
                        <Typography align="center" sx={{ p: 4, color: 'text.secondary' }}>
                            هنوز لینکی ایجاد نکرده‌اید.
                        </Typography>
                    )}
                </Box>
            ) : (
                <DataGrid
                  rows={links || []}
                  columns={columns}
                  getRowId={(row: LinkDetails) => row.short_code}
                  loading={isLoading || deleteMutation.isPending}
                  initialState={{
                    pagination: { paginationModel: { page: 0, pageSize: 5 } },
                  }}
                  localeText={localeText}
                  pageSizeOptions={[5, 10, 20]}
                  // ✨ UX Improvement: autoHeight makes the grid fit its content
                  autoHeight 
                  // 🎨 STYLE: Remove borders for a cleaner look
                  sx={{ border: 'none' }}
                />
            )}
        </Paper>
      </Container>
      
      {/* Modals and Snackbar remain unchanged */}
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