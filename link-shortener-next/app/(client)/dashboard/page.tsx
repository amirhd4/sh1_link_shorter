"use client";

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { linkService } from '@/services/linkService';
import { DataGrid, type GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import {
    Alert, Box, Typography, Button, Snackbar, Container, Paper, Stack, Tooltip,
    useMediaQuery, useTheme, Card, CardContent, CardActions, IconButton, Divider,
    Link as MuiLink, Skeleton, alpha,
    TextField,
    InputAdornment,
    Chip,
    MenuItem
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { CreateLinkForm } from '@/components/client-dashboard/CreateLinkForm';
import { EditLinkForm } from '@/components/client-dashboard/EditLinkForm';
import { ConfirmationDialog } from '@/components/molecules/ConfirmationDialog';
import type { LinkDetails } from '@/types/api';
import { useRouter } from 'next/navigation';
import { normalizeUrl } from "@/lib/utils";

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
import { usePersianDataGridLocale } from '@/hooks/usePersianDataGridLocale';
import {InfiniteData} from "@tanstack/query-core";
import { useUserStore } from "@/store/userStore";
import { getDaysRemaining } from "@/utils/dateUtils";

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


const MobileLinkCard = ({ link, index, onDetailsClick, onEditClick, onDeleteClick, isDeleting, onToggleMutation }: {
    link: LinkDetails,
    index: number,
    onDetailsClick: () => void,
    onEditClick: () => void,
    onDeleteClick: () => void,
    onToggleMutation: () => void,
    isDeleting: boolean,
}) => {
    const theme = useTheme();
    const shortUrl = `${normalizeUrl(link.domain_name)}/${link.short_code}`;
    const isLocked = link.deactivated_by_admin;

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
                    <Box>
                      {link.deactivated_by_admin ? (
                        <Alert severity="error" sx={{ mb: 1 }}>
                          این لینک توسط ادمین غیرفعال شده
                          {link.deactivation_reason && (
                            <> — {link.deactivation_reason}</>
                          )}
                        </Alert>
                      ) : !link.is_active ? (
                        <Alert severity="warning" sx={{ mb: 1 }}>
                          این لینک غیرفعال است
                        </Alert>
                      ) : null}
                    </Box>
                    {/* شماره ردیف */}
                    <Typography variant="caption" color="text.secondary">ردیف: {index + 1}</Typography>

                    {/* لینک کوتاه */}
                    <Box>
                        <Typography variant="caption" color="text.secondary">لینک کوتاه شما</Typography>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">

                            <MuiLink
                              href={link.is_active && !link.deactivated_by_admin ? shortUrl : undefined}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                pointerEvents: link.is_active && !link.deactivated_by_admin ? 'auto' : 'none',
                                opacity: link.is_active && !link.deactivated_by_admin ? 1 : 0.5
                              }}
                            >
                              {link.domain_name}/{link.short_code}
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
                        <span><IconButton onClick={onEditClick} disabled={isDeleting || isLocked}><EditIcon /></IconButton></span>
                    </Tooltip>
                    <Tooltip title="حذف لینک">
                        <span><IconButton onClick={onDeleteClick} color="error" disabled={isDeleting || link.deactivated_by_admin}><DeleteIcon /></IconButton></span>
                    </Tooltip>
                    <Tooltip title="تغییر وضعیت">
                        <span><IconButton
                          onClick={onToggleMutation}
                          // disabled={link.deactivated_by_admin}
                        >
                          {link.is_active ? <LinkOffIcon /> : <LinkIcon />}
                        </IconButton>
                        </span>
                    </Tooltip>
                </Box>
            </CardActions>
        </Card>
    );
};

// =================================================================
// Main Dashboard
// =================================================================
type DeleteTarget = { shortCode: string; domainId: string };


export type Cursor = {
  created_at: string;
  id: number;
};

export type LinkListPage = {
  items: LinkDetails[];
  has_more: boolean;
  next_cursor: Cursor | null;
};
import { useMemo } from 'react';
import {Link, SearchIcon } from "lucide-react";
import {InitialPasswordCard} from "@/components/client-dashboard/SecretPasswordCard";
import SupportSection from "@/components/support/SupportSection";
import FloatingSupportButton from "@/components/support/FloatingSupportButton";
import { VideoCall } from "@mui/icons-material";
import BioLink from "@mui/icons-material/Pages";

export default function LinksDashboard() {
    const navigate = useRouter();
    useEffect(() => {
        document.title = "میزکار کاربر";
      }, []);
    const { t } = useTranslation('common');
    const queryClient = useQueryClient();
    const localeText = usePersianDataGridLocale();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [isCreateModalOpen, setCreateModalOpen] = useState(false);

    const [editTarget, setEditTarget] = useState<LinkDetails | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
    // const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

    const [snackbarMessage, setSnackbarMessage] = useState<{ text: string; severity: "success" | "error" } | null>(null);

    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'admin'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const { user } = useUserStore();

    const daysRemaining = getDaysRemaining(user?.subscription_end_date);
    const isExpired = daysRemaining !== null && daysRemaining <= 0;
    const isLastDay = daysRemaining === 1;

   const {data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage} = useInfiniteQuery<
      LinkListPage,          // TQueryFnData
      Error,                 // TError
      InfiniteData<LinkListPage>, // TData ← خیلی مهم
      ['my-links'],          // TQueryKey
      Cursor | undefined     // TPageParam
    >({
      queryKey: ['my-links'],
      queryFn: ({ pageParam }) =>
        linkService.getMyLinks({
          limit: 5,
          cursor_created_at: pageParam?.created_at,
          cursor_id: pageParam?.id,
        }),
      initialPageParam: undefined,
      getNextPageParam: (lastPage) =>
        lastPage.has_more ? lastPage.next_cursor ?? undefined : undefined,
    });

  const links = data?.pages.flatMap(page => page.items) ?? [];

  const filteredLinks = useMemo(() => {
      let result = links;

      // فیلتر جستجو
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();

        result = result.filter(link =>
          link.short_code.toLowerCase().includes(term) ||
          link.long_url.toLowerCase().includes(term) ||
          link.domain_name.toLowerCase().includes(term)
        );
      }

      // فیلتر وضعیت
      if (statusFilter !== 'all') {
        result = result.filter(link => {
          if (statusFilter === 'active') {
            return link.is_active && !link.deactivated_by_admin;
          }

          if (statusFilter === 'inactive') {
            return !link.is_active && !link.deactivated_by_admin;
          }

          if (statusFilter === 'admin') {
            return link.deactivated_by_admin;
          }

          return true;
        });
      }

      return result;

    }, [links, searchTerm, statusFilter]);


   useEffect(() => {
    try {
        const msgStr = localStorage.getItem("welcome_msg");
        if (msgStr) {
        const msg = JSON.parse(msgStr);
        setSnackbarMessage(msg);
        localStorage.removeItem("welcome_msg");
        }
    } catch (e) {
        console.error("Invalid welcome_msg JSON:", e);
        localStorage.removeItem("welcome_msg");
    }
    }, []);

    const deleteMutation = useMutation({
        mutationFn: (variables: DeleteTarget) =>
            linkService.deleteLink(variables.shortCode, variables.domainId),
        onSuccess: () => {
            setSnackbarMessage({ text: "لینک با موفقیت حذف شد.", severity: "success" });

            // setSnackbarMessage("لینک با موفقیت حذف شد.");
            queryClient.invalidateQueries({ queryKey: ['my-links'] });
        },
        onError: () => setSnackbarMessage({ text: "خطا در حذف لینک.", severity: "error" }),
        onSettled: () => setDeleteTarget(null),
    });

    const handleDetailsClick = (shortCode: string, domainId: string) => () => navigate.push(`/links/${domainId}/${shortCode}/`);
    const handleDeleteClick = (shortCode: string, domainId: string) => () => setDeleteTarget({ shortCode, domainId });
    const handleConfirmDelete = () => { if(deleteTarget) deleteMutation.mutate(deleteTarget); };
    const handleEditClick = (link: LinkDetails) => () => setEditTarget(link);

    const toggleMutation = useMutation({
           mutationFn: (link: LinkDetails) =>
            linkService.toggleLinkStatus(
              link.short_code,
              link.domain_id?.toString() || "0",
              link.is_active
            ),
          onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['my-links']}).then(r => null);
            setSnackbarMessage({
              text: "وضعیت لینک با موفقیت تغییر کرد.",
              severity: "success"
            });
          },
          onError: () => {
            setSnackbarMessage({
              text: "خطا در تغییر وضعیت لینک.",
              severity: "error"
            });
          }
        });


    const columns: GridColDef<LinkDetails>[] = [
        {
  field: 'copy',
  headerName: '',
  width: 60,
  sortable: false,
  renderCell: ({ row }) => {
    const shortUrl = `${normalizeUrl(row.domain_name)}/${row.short_code}`;
    return <CopyButton textToCopy={shortUrl} />;
  }
},
        {
          field: 'status',
          headerName: 'وضعیت',
          width: 60,
          sortable: false,
          renderCell: ({ row }) => {
            if (row.deactivated_by_admin) {
              return (
                <Tooltip title={row.deactivation_reason || "این لینک توسط ادمین غیرفعال شده"}>
                  <Chip label="غیرفعال توسط ادمین" color="error" size="small" />
                </Tooltip>
              );
            }

            if (!row.is_active) {
              return (
                <Chip label="غیرفعال" color="warning" size="small" />
              );
            }

            return <Chip label="فعال" color="success" size="small" />;
          },
        },
        {
            field: 'domain_name',
            headerName: 'دامنه',
            width: 150,
            renderCell: (params) => {

                // const finalUrl = `${normalizeUrl(params.row.domain_name)}/${params.value}`;
                return params.value

            },
        },
        {
            field: 'short_code',
            headerName: 'کد کوتاه',
            width: 150,
            renderCell: (params) => {

                const finalUrl = `${normalizeUrl(params.row.domain_name)}/${params.value}`;
                return <MuiLink href={`${finalUrl}`} target="_blank" rel="noopener noreferrer">
                    {params.value}
                </MuiLink>
            },
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
        { field: 'clicks', headerName: 'تعداد کلیک', type: 'number', width: 90 },
        {
            field: 'created_at',
            headerName: 'تاریخ ایجاد',
            width: 120,
            valueFormatter: (value) => new Date(value).toLocaleDateString('fa-IR'),
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'عملیات',
            width: 150,
            getActions: ({ row }) => {
              const disabled = row.deactivated_by_admin;

              return [
                <GridActionsCellItem
                  icon={<AnalyticsIcon />}
                  label="جزئیات"
                  // disabled={disabled}
                  onClick={handleDetailsClick(row.short_code, row.domain_id || "0")}
                />,
                <GridActionsCellItem
                  icon={<EditIcon />}
                  label="ویرایش"
                  disabled={disabled}
                  onClick={handleEditClick(row)}
                />,
                <GridActionsCellItem
                  icon={<DeleteIcon />}
                  label="حذف"
                  disabled={disabled}
                  onClick={handleDeleteClick(row.short_code, row.domain_id || "0")}
                />,
                  <GridActionsCellItem
                      icon={row.is_active ?
                          <Tooltip title={"غیر فعال کردن لینک"}>
                              <LinkOffIcon />
                          </Tooltip>
                      : <Tooltip title={"فعال کردن لینک"}>
                              <LinkIcon />
                          </Tooltip>
                    }
                      label={row.is_active ? "غیرفعال کردن" : "فعال کردن"}
                      disabled={disabled}
                      onClick={() => toggleMutation.mutate(row)}
                    />
              ];
            }

        },
    ];

    const renderContent = () => {
  if (isLoading) {
    return isMobile
      ? <Stack>{[...Array(3)].map((_, i) => <MobileLinkCardSkeleton key={i} />)}</Stack>
      : <DataGrid rows={[]} columns={columns} loading sx={{ height: 370 }} />;
  }

  if (isError) {
    return <Alert severity="error">{t('messages.error')}: {error.message}</Alert>;
  }

  if (!filteredLinks.length) {
  return searchTerm
    ? <Alert severity="info">نتیجه‌ای برای جستجوی شما پیدا نشد.</Alert>
    : <EmptyState />;
}


  // ✅ موبایل
  if (isMobile) {
    return (
      <Stack spacing={2}>
        {filteredLinks.map((link, idx) => (
          <MobileLinkCard
            key={`${link.domain_id}-${link.short_code}`}
            index={idx}
            link={link}
            onDetailsClick={handleDetailsClick(link.short_code, link.domain_id || "0")}
            onEditClick={handleEditClick(link)}
            onDeleteClick={handleDeleteClick(link.short_code, link.domain_id || "0")}
            isDeleting={deleteMutation.isPending}
            onToggleMutation={() => toggleMutation.mutate(link)}
          />
        ))}

        {hasNextPage && (
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? 'در حال بارگذاری...' : 'نمایش بیشتر'}
          </Button>
        )}
      </Stack>
    );
  }

  // ✅ دسکتاپ
  return (
    <>
      <DataGrid
        rows={filteredLinks}
        columns={columns}
        getRowId={(row) => `${row.domain_id}-${row.short_code}`}
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

      {hasNextPage && (
        <Box textAlign="center" mt={2}>
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            نمایش بیشتر
          </Button>
        </Box>
      )}
    </>
  );
};

    return (
        <>
            <Container maxWidth="lg" sx={{py: 4}}>
                <Stack direction={{xs: 'column', sm: 'row'}} justifyContent="space-between" alignItems="center"
                       spacing={2} mb={4}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <LinkIcon color="primary" sx={{fontSize: {xs: 28, sm: 32}}}/>
                        <Typography variant={isMobile ? 'h6' : 'h5'} component="h1" fontWeight="bold">
                            مدیریت لینک‌ها
                        </Typography>
                    </Stack>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon/>}
                        onClick={() => setCreateModalOpen(true)}
                        sx={{alignSelf: {xs: 'stretch', sm: 'auto'}}}
                    >
                        ایجاد لینک جدید
                    </Button>
                </Stack>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="جستجو در لینک‌ها (کد کوتاه یا آدرس)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small"/>
                                </InputAdornment>
                            ),
                        },
                    }}
                    sx={{mb: 2}}
                />

                {user?.plan && (isExpired || isLastDay) && (
                    <Alert
                        severity={isExpired ? "error" : "warning"}
                        sx={{mb: 2}}
                        action={
                            <Button
                                color="inherit"
                                size="small"
                                onClick={() => navigate.push("/plans")}
                            >
                                مشاهده پلن‌ها
                            </Button>
                        }
                    >
                        {isExpired
                            ? "اشتراک شما به پایان رسیده است. برای ادامه استفاده، لطفاً پلن خود را تمدید کنید."
                            : "امروز آخرین روز اشتراک شماست. برای جلوگیری از محدود شدن امکانات، پلن خود را تمدید کنید."}
                    </Alert>
                )}

                <InitialPasswordCard/>

                <TextField
                  select
                  size="small"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  sx={{ mb: 2, width: 200 }}
                >
                  <MenuItem value="all">همه لینک‌ها</MenuItem>
                  <MenuItem value="active">فعال</MenuItem>
                  <MenuItem value="inactive">غیرفعال</MenuItem>
                  <MenuItem value="admin">غیرفعال توسط ادمین</MenuItem>
                </TextField>
                <Paper sx={{p: {xs: 1, sm: 2}, borderRadius: 3}} elevation={3}>
                    {renderContent()}
                </Paper>
                <Paper sx={{ p: 2,
                        mt: 3,
                        mb: 3,
                        borderRadius: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 2,
                         }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <BioLink sx={{ fontSize: 40 }} color={"primary"} />
                        <Box>
                            <Typography variant="h6" fontWeight="bold">لینک در بیو</Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                همه لینک های خود را در یک لینک جایگذاری کنید!
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        variant="contained"
                        color="secondary"
                        target={"_blank"}
                        href="/bio-pages"
                        sx={{ fontWeight: 'bold', px: 3 }}
                    >
                        امتحان کن
                    </Button>
                </Paper>
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        mb: 3,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 2,
                        border: '1px solid rgba(255,255,255,0.2)'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <VideoCall sx={{ fontSize: 40 }} />
                        <Box>
                            <Typography variant="h6" fontWeight="bold">تجربه جلسه آنلاین حرفه‌ای!</Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                در اتاق جلسات ما با قابلیت چت و تماس صوتی/تصویری با کیفیت، ارتباط برقرار کنید.
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        variant="contained"
                        color="secondary"
                        target={"_blank"}
                        href="https://goftgokon.ir"
                        sx={{ fontWeight: 'bold', px: 3 }}
                    >
                        ورود به اتاق جلسه
                    </Button>
                </Paper>
            </Container>
            {/*<div className="yn-bnr" id="ynpos-18058"></div>*/}

            <CreateLinkForm isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)}/>
            <EditLinkForm isOpen={!!editTarget} onClose={() => setEditTarget(null)} link={editTarget}/>
            <ConfirmationDialog
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleConfirmDelete}
                title="تایید حذف لینک"
                description="آیا از حذف این لینک اطمینان دارید؟ این عمل غیرقابل بازگشت است."
            />
            {/* <Snackbar open={!!snackbarMessage} autoHideDuration={4000} onClose={() => setSnackbarMessage(null)} message={snackbarMessage} /> */}
            <Snackbar
                open={!!snackbarMessage}
                autoHideDuration={4000}
                onClose={() => setSnackbarMessage(null)}
            >
                {snackbarMessage ? (
                    <Alert severity={snackbarMessage.severity}>
                        {snackbarMessage.text}
                    </Alert>
                ) : undefined}
            </Snackbar>
            <SupportSection />
            <FloatingSupportButton />
        </>
    );
}
