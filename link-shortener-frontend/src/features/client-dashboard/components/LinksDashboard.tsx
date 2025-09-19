import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { linkService } from '../../../services/linkService';
import { DataGrid, type GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { 
    Alert, Box, Typography, Button, Snackbar, Container, Paper, Stack, Tooltip,
    useMediaQuery, useTheme, Card, CardContent, CardActions, IconButton, Divider,
    Link as MuiLink, Skeleton, alpha
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { CreateLinkForm } from './CreateLinkForm';
import { EditLinkForm } from './EditLinkForm';
import { ConfirmationDialog } from '../../../components/molecules/ConfirmationDialog';
import type { LinkDetails } from '../../../types/api';
import { useNavigate } from 'react-router-dom';

// Icons
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';

import config from '../../../config';
import { usePersianDataGridLocale } from '../../../hooks/usePersianDataGridLocale';

// =================================================================
// ✨ Copy Button Component
// =================================================================
const CopyButton = ({ textToCopy }: { textToCopy: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
    };

    useEffect(() => {
        if (copied) {
            const timer = setTimeout(() => setCopied(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [copied]);

    return (
        <Tooltip title={copied ? "کپی شد!" : "کپی لینک کوتاه"}>
            <IconButton onClick={handleCopy} size="small">
                {copied ? <CheckIcon color="success" fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
            </IconButton>
        </Tooltip>
    );
};

// =================================================================
// Skeleton برای موبایل
// =================================================================
const MobileLinkCardSkeleton = () => (
    <Card sx={{ mb: 2 }}>
        <CardContent>
            <Stack spacing={2}>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="90%" />
                <Skeleton variant="rounded" height={40} />
            </Stack>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
            <Skeleton variant="circular" width={34} height={34} />
            <Skeleton variant="circular" width={34} height={34} />
            <Skeleton variant="circular" width={34} height={34} />
        </CardActions>
    </Card>
);

// =================================================================
// EmptyState
// =================================================================
const EmptyState = () => (
    <Box textAlign="center" p={{ xs: 2, sm: 5 }}>
        <LinkOffIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
            هنوز لینکی ایجاد نکرده‌اید
        </Typography>
        <Typography variant="body2" color="text.disabled">
            برای شروع، روی دکمه "ایجاد لینک جدید" کلیک کنید.
        </Typography>
    </Box>
);

// =================================================================
// Mobile Link Card
// =================================================================
const MobileLinkCard = ({ link, index, onDetailsClick, onEditClick, onDeleteClick, isDeleting }: {
    link: LinkDetails,
    index: number,
    onDetailsClick: () => void,
    onEditClick: () => void,
    onDeleteClick: () => void,
    isDeleting: boolean,
}) => {
    const theme = useTheme();
    const shortUrl = `${config.backendBaseUrlOrigin}/${link.short_code}`;

    return (
        <Card 
            sx={{ 
                mb: 2, 
                transition: 'box-shadow 0.3s', 
                '&:hover': { boxShadow: theme.shadows[4] },
                borderLeft: `4px solid ${theme.palette.primary.main}`,
                opacity: isDeleting ? 0.6 : 1,
            }}
        >
            <CardContent>
                <Stack spacing={1.5}>
                    {/* شماره ردیف */}
                    <Typography variant="caption" color="text.secondary">ردیف: {index + 1}</Typography>

                    {/* لینک کوتاه */}
                    <Box>
                        <Typography variant="caption" color="text.secondary">لینک کوتاه شما</Typography>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <MuiLink href={shortUrl} target="_blank" rel="noopener noreferrer" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                                {link.short_code}
                            </MuiLink>
                            <CopyButton textToCopy={shortUrl} />
                        </Stack>
                    </Box>

                    {/* لینک اصلی */}
                    <Box>
                        <Stack direction="row" alignItems="center" spacing={0.5} color="text.secondary">
                            <SubdirectoryArrowRightIcon sx={{ fontSize: '1rem' }} />
                            <Typography variant="caption">هدایت می‌شود به:</Typography>
                        </Stack>
                        <Typography 
                            variant="body2" 
                            color="text.primary"
                            sx={{ wordBreak: 'break-all', pl: 2.5 }}
                        >
                            {link.long_url}
                        </Typography>
                    </Box>
                </Stack>
            </CardContent>
            <Divider />
            <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
                <Box>
                    <Typography variant="caption" color="text.secondary">کلیک: </Typography>
                    <Typography component="span" variant="body2" fontWeight="bold">{link.clicks.toLocaleString('fa-IR')}</Typography>
                </Box>
                <Box>
                    <Tooltip title="مشاهده جزئیات">
                        <span><IconButton onClick={onDetailsClick} disabled={isDeleting}><AnalyticsIcon /></IconButton></span>
                    </Tooltip>
                    <Tooltip title="ویرایش لینک">
                        <span><IconButton onClick={onEditClick} disabled={isDeleting}><EditIcon /></IconButton></span>
                    </Tooltip>
                    <Tooltip title="حذف لینک">
                        <span><IconButton onClick={onDeleteClick} color="error" disabled={isDeleting}><DeleteIcon /></IconButton></span>
                    </Tooltip>
                </Box>
            </CardActions>
        </Card>
    );
};

// =================================================================
// Main Dashboard
// =================================================================
export function LinksDashboard() {
    const navigate = useNavigate();
    const { t } = useTranslation('common');
    const queryClient = useQueryClient();
    const localeText = usePersianDataGridLocale();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<LinkDetails | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

    const [mobilePage, setMobilePage] = useState(0);
    const pageSize = 5;

    const { data: links, isLoading, isError, error } = useQuery({
        queryKey: ['my-links'],
        queryFn: linkService.getMyLinks,
    });

    const deleteMutation = useMutation({
        mutationFn: linkService.deleteLink,
        onSuccess: () => {
            setSnackbarMessage("لینک با موفقیت حذف شد.");
            queryClient.invalidateQueries({ queryKey: ['my-links'] });
        },
        onError: () => setSnackbarMessage("خطا در حذف لینک."),
        onSettled: () => setDeleteTarget(null),
    });

    const handleDetailsClick = (shortCode: string) => () => navigate(`/links/${shortCode}`);
    const handleDeleteClick = (shortCode: string) => () => setDeleteTarget(shortCode);
    const handleConfirmDelete = () => { if(deleteTarget) deleteMutation.mutate(deleteTarget); };
    const handleEditClick = (link: LinkDetails) => () => setEditTarget(link);

    const columns: GridColDef<LinkDetails>[] = [
        {
            field: 'short_code',
            headerName: 'کد کوتاه',
            width: 150,
            renderCell: (params) => (
                <MuiLink href={`${config.backendBaseUrlOrigin}/${params.value}`} target="_blank" rel="noopener noreferrer">
                    {params.value}
                </MuiLink>
            ),
        },
        { 
            field: 'long_url', 
            headerName: 'آدرس اصلی', 
            flex: 1, 
            minWidth: 250,
            renderCell: (params) => (
                <Tooltip title={params.value} placement="bottom-start">
                    <Typography noWrap variant="body2">{params.value}</Typography>
                </Tooltip>
            )
        },
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
            width: 150,
            getActions: ({ row }) => [
                <GridActionsCellItem icon={<AnalyticsIcon />} label="جزئیات" onClick={handleDetailsClick(row.short_code)} />,
                <GridActionsCellItem icon={<EditIcon />} label="ویرایش" onClick={handleEditClick(row)} />,
                <GridActionsCellItem icon={<DeleteIcon />} label="حذف" onClick={handleDeleteClick(row.short_code)} />,
            ],
        },
    ];

    const renderContent = () => {
        if (isLoading) return isMobile 
            ? <Stack>{[...Array(3)].map((_, i) => <MobileLinkCardSkeleton key={i} />)}</Stack>
            : <DataGrid rows={[]} columns={columns} loading sx={{ height: 370 }} />;

        if (isError) return <Alert severity="error">{t('messages.error')}: {error.message}</Alert>;
        if (!links || links.length === 0) return <EmptyState />;

        // موبایل با pagination ساده
        if (isMobile) {
            const start = mobilePage * pageSize;
            const end = start + pageSize;
            const pageLinks = links.slice(start, end);

            return (
                <Box>
                    {pageLinks.map((link, idx) => (
                        <MobileLinkCard 
                            key={link.short_code}
                            index={start + idx}
                            link={link}
                            onDetailsClick={handleDetailsClick(link.short_code)}
                            onEditClick={handleEditClick(link)}
                            onDeleteClick={handleDeleteClick(link.short_code)}
                            isDeleting={deleteMutation.isPending && deleteMutation.variables === link.short_code}
                        />
                    ))}
                    <Stack direction="row" justifyContent="center" spacing={2} mt={2}>
                        <Button disabled={mobilePage === 0} onClick={() => setMobilePage(p => p - 1)}>قبلی</Button>
                        <Typography variant="body2" mt={0.5}>{mobilePage + 1} / {Math.ceil(links.length / pageSize)}</Typography>
                        <Button disabled={end >= links.length} onClick={() => setMobilePage(p => p + 1)}>بعدی</Button>
                    </Stack>
                </Box>
            );
        }

        // دسکتاپ
        return (
            <DataGrid
                rows={links}
                columns={columns}
                getRowId={(row) => row.short_code}
                loading={deleteMutation.isPending}
                initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
                localeText={localeText}
                pageSizeOptions={[5, 10, 20]}
                autoHeight
                sx={{
                    border: 'none',
                    '& .MuiDataGrid-columnHeaders': { 
                        backgroundColor: alpha(theme.palette.primary.light, 0.1),
                        borderBottom: `1px solid ${theme.palette.divider}`
                    },
                    '& .MuiDataGrid-row:nth-of-type(odd)': {
                        backgroundColor: alpha(theme.palette.action.hover, 0.02),
                    },
                }}
            />
        );
    };

    return (
        <>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2} mb={4}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <LinkIcon color="primary" sx={{ fontSize: {xs: 28, sm: 32} }}/>
                        <Typography variant={isMobile ? 'h6' : 'h5'} component="h1" fontWeight="bold">
                            مدیریت لینک‌ها
                        </Typography>
                    </Stack>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setCreateModalOpen(true)}
                        sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}
                    >
                        ایجاد لینک جدید
                    </Button>
                </Stack>
                
                <Paper sx={{ p: { xs: 1, sm: 2 }, borderRadius: 3 }} elevation={3}>
                    {renderContent()}
                </Paper>
            </Container>

            <CreateLinkForm isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} />
            <EditLinkForm isOpen={!!editTarget} onClose={() => setEditTarget(null)} link={editTarget} />
            <ConfirmationDialog 
                open={!!deleteTarget} 
                onClose={() => setDeleteTarget(null)} 
                onConfirm={handleConfirmDelete} 
                title="تایید حذف لینک" 
                description="آیا از حذف این لینک اطمینان دارید؟ این عمل غیرقابل بازگشت است." 
            />
            <Snackbar open={!!snackbarMessage} autoHideDuration={4000} onClose={() => setSnackbarMessage(null)} message={snackbarMessage} />
        </>
    );
}
