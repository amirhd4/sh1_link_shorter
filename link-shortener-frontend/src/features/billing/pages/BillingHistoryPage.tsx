import { useQuery } from '@tanstack/react-query';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Alert, Box, CircularProgress, Typography, Chip } from '@mui/material';
import { billingService } from '../../../services/billingService';
import { faIR } from '@mui/x-data-grid/locales';

// کامپوننت برای نمایش وضعیت با رنگ‌های مختلف
const StatusChip = ({ status }: { status: 'pending' | 'completed' | 'failed' }) => {
  const statusMap = {
    completed: { label: 'موفق', color: 'success' as const },
    pending: { label: 'در انتظار', color: 'warning' as const },
    failed: { label: 'ناموفق', color: 'error' as const },
  };
  return <Chip label={statusMap[status].label} color={statusMap[status].color} />;
};

const columns: GridColDef[] = [
  { field: 'id', headerName: 'شماره فاکتور', width: 120 },
  { field: 'plan', headerName: 'پلن خریداری شده', width: 180, valueGetter: (value, row) => row.plan.name },
  { field: 'amount', headerName: 'مبلغ (ریال)', width: 150, valueFormatter: (value) => value.toLocaleString('fa-IR') },
  { field: 'status', headerName: 'وضعیت', width: 120, renderCell: (params) => <StatusChip status={params.value} /> },
  { field: 'created_at', headerName: 'تاریخ', flex: 1, valueFormatter: (value) => new Date(value).toLocaleString('fa-IR') },
];

export function BillingHistoryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['billing-history'],
    queryFn: billingService.getMyTransactions,
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>تاریخچه صورتحساب‌ها</Typography>
      <Box sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={data || []}
          columns={columns}
          loading={isLoading}
          localeText={faIR.components.MuiDataGrid.defaultProps.localeText}
        />
      </Box>
    </Box>
  );
}