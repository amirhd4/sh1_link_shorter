import { useQuery } from '@tanstack/react-query';
import {
  DataGrid,
  type GridColDef,
} from '@mui/x-data-grid';
import {
  Box,
  Typography,
  Chip,
  Grid,
  Container,
  Paper,
  useMediaQuery,
  Stack,
  Skeleton,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { usePersianDataGridLocale } from '../../../hooks/usePersianDataGridLocale.ts';
import { billingService } from '../../../services/billingService';

// آیکون برای زیبایی بیشتر
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

// تعریف یک نوع (Type) برای داده‌های هر سطر تا کد خواناتر شود
type TransactionRow = {
  id: number;
  plan: { name: string };
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
};

// =================================================================
// کامپوننت چیپ وضعیت (بدون تغییر)
// =================================================================
const StatusChip = ({ status }: { status: TransactionRow['status'] }) => {
  const statusMap = {
    completed: { label: 'موفق بود', color: 'success' as const },
    pending: { label: 'در انتظار', color: 'warning' as const },
    failed: { label: 'ناموفق', color: 'error' as const },
  };
  return (
    <Chip
      label={statusMap[status].label}
      color={statusMap[status].color}
      size="small"
      sx={{ fontWeight: 'bold' }}
    />
  );
};

// =================================================================
// ستون‌های دیتاگرید برای نمایش دسکتاپ
// =================================================================
const columns: GridColDef<TransactionRow>[] = [
  { field: 'id', headerName: 'شماره فاکتور', width: 120 },
  {
    field: 'plan',
    headerName: 'پلن خریداری شده',
    width: 180,
    valueGetter: (_, row) => row.plan.name,
  },
  {
    field: 'amount',
    headerName: 'مبلغ (ریال)',
    width: 150,
    valueFormatter: (value: number) => value.toLocaleString('fa-IR'),
  },
  {
    field: 'status',
    headerName: 'وضعیت',
    width: 120,
    renderCell: (params) => <StatusChip status={params.value} />,
  },
  {
    field: 'created_at',
    headerName: 'تاریخ',
    flex: 1,
    minWidth: 160,
    valueFormatter: (value: string) =>
      new Date(value).toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
  },
];

// =================================================================
// کامپوننت جدید: کارت نمایش اطلاعات برای موبایل ✨
// =================================================================
const MobileBillingCard = ({ row }: { row: TransactionRow }) => {
  const theme = useTheme();
  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        borderRadius: 3,
        borderLeft: `5px solid ${theme.palette.primary.main}`,
        backgroundColor: alpha(theme.palette.primary.light, 0.05),
      }}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            شماره فاکتور
          </Typography>
          <Typography fontWeight="bold">#{row.id}</Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            پلن
          </Typography>
          <Typography fontWeight="bold">{row.plan.name}</Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            مبلغ
          </Typography>
          <Typography fontWeight="bold" color="primary.main">
            {row.amount.toLocaleString('fa-IR')} ریال
          </Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            تاریخ
          </Typography>
          <Typography variant="body2">
            {new Date(row.created_at).toLocaleDateString('fa-IR')}
          </Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between" alignItems="center" pt={1}>
          <Typography variant="body2" color="text.secondary">
            وضعیت
          </Typography>
          <StatusChip status={row.status} />
        </Stack>
      </Stack>
    </Paper>
  );
};

// =================================================================
// کامپوننت جدید: اسکلت لودینگ برای حالت موبایل 💀
// =================================================================
const MobileSkeleton = () => (
  <Stack spacing={2}>
    {[...Array(3)].map((_, index) => (
      <Paper key={index} elevation={2} sx={{ p: 2, borderRadius: 3 }}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Skeleton variant="text" width="40%" />
            <Skeleton variant="text" width="20%" />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Skeleton variant="text" width="30%" />
            <Skeleton variant="text" width="50%" />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Skeleton variant="text" width="25%" />
            <Skeleton variant="circular" width={60} height={24} />
          </Box>
        </Stack>
      </Paper>
    ))}
  </Stack>
);

// =================================================================
// کامپوننت اصلی صفحه
// =================================================================
export function BillingHistoryPage() {
  const localeText = usePersianDataGridLocale();
  const { data, isLoading, isError } = useQuery<TransactionRow[]>({
    queryKey: ['billing-history'],
    queryFn: billingService.getMyTransactions,
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const renderContent = () => {
    // حالت لودینگ
    if (isLoading) {
      return isMobile ? <MobileSkeleton /> : <DataGrid rows={[]} columns={columns} loading />;
    }
    
    // حالت خطا
    if (isError) {
      return <Typography textAlign="center" color="error">خطا در دریافت اطلاعات.</Typography>;
    }
    
    // حالت داده خالی
    if (!data || data.length === 0) {
      return <Typography textAlign="center" color="text.secondary">موردی برای نمایش وجود ندارد.</Typography>;
    }

    // نمایش محتوا بر اساس سایز صفحه
    if (isMobile) {
      return (
        <Stack spacing={2}>
          {data.map((row) => (
            <MobileBillingCard key={row.id} row={row} />
          ))}
        </Stack>
      );
    } else {
      return (
        <Box sx={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={data}
            columns={columns}
            localeText={localeText}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 5 },
              },
            }}
            pageSizeOptions={[5, 10, 20]}
            sx={{
              border: 'none',
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                fontWeight: 'bold',
              },
              '& .MuiDataGrid-cell': {
                fontSize: '0.9rem',
              },
            }}
          />
        </Box>
      );
    }
  };

  return (
    <Container maxWidth="lg" sx={{ my: { xs: 4, sm: 6 } }}>
      <Stack spacing={4} alignItems="center">
        <Stack direction="row" spacing={2} alignItems="center" color="primary.main">
          <ReceiptLongIcon sx={{ fontSize: { xs: 30, sm: 40 } }} />
          <Typography
            variant={isMobile ? 'h5' : 'h4'}
            fontWeight="bold"
          >
            تاریخچه صورتحساب‌ها
          </Typography>
        </Stack>

        {/* نکته: اینجا از Grid item به جای size استفاده شده */}
        <Grid size={{xs:12, md: 10, lg: 8}} sx={{ width: '100%' }}>
          <Paper
            elevation={isMobile ? 0 : 4}
            sx={{
              p: { xs: 1, sm: 3 },
              borderRadius: 4,
              backgroundColor: isMobile ? 'transparent' : 'background.paper',
            }}
          >
            {renderContent()}
          </Paper>
        </Grid>
      </Stack>
    </Container>
  );
}