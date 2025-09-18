import { useQuery } from '@tanstack/react-query';
import { faIR as dataGridFaIR } from '@mui/x-data-grid/locales';

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
} from '@mui/material';
import { billingService } from '../../../services/billingService';
import { useTheme } from '@mui/material/styles';
import { usePersianDataGridLocale } from '../../../hooks/usePersianDataGridLocale.ts';

const StatusChip = ({ status }: { status: 'pending' | 'completed' | 'failed' }) => {
  const statusMap = {
    completed: { label: 'موفق', color: 'success' as const },
    pending: { label: 'در انتظار', color: 'warning' as const },
    failed: { label: 'ناموفق', color: 'error' as const },
  };
  return (
    <Chip
      label={statusMap[status].label}
      color={statusMap[status].color}
      sx={{ fontWeight: 'bold', px: 1.5 }}
    />
  );
};

const columns: GridColDef[] = [
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
    valueFormatter: (value: any) =>
      typeof value === 'number' ? value.toLocaleString('fa-IR') : '---',
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
    valueFormatter: (value) =>
      new Date(value as string).toLocaleString('fa-IR'),
  },
];

export function BillingHistoryPage() {
  const localeText = usePersianDataGridLocale();
  const { data, isLoading } = useQuery({
    queryKey: ['billing-history'],
    queryFn: billingService.getMyTransactions,
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 6, sm: 10 }, mb: 6 }}>
      <Grid container spacing={4} justifyContent="center">
        <Grid size={{xs:12}}>
          <Typography
            variant={isMobile ? 'h5' : 'h4'}
            textAlign="center"
            fontWeight="bold"
            gutterBottom
            color="primary"
          >
            تاریخچه صورتحساب‌ها
          </Typography>
        </Grid>

        <Grid size={{xs:12}}>
          <Paper
            elevation={4}
            sx={{
              p: { xs: 2, sm: 4 },
              borderRadius: 4,
              backgroundColor: theme.palette.background.paper,
              boxShadow: theme.shadows[3],
            }}
          >
            <Box sx={{ height: 450, width: '100%' }}>
              <DataGrid
                rows={data || []}
                columns={columns}
                loading={isLoading}
                localeText={localeText}
                sx={{
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: theme.palette.grey[100],
                    fontWeight: 'bold',
                  },
                  '& .MuiDataGrid-cell': {
                    fontSize: '0.95rem',
                  },
                  '& .MuiDataGrid-footerContainer': {
                    justifyContent: 'center',
                    py: 1,
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
