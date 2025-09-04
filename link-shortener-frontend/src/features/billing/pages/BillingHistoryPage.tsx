import { useQuery } from '@tanstack/react-query';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Box, Typography, Chip } from '@mui/material';
import { billingService } from '../../../services/billingService';
import {usePersianDataGridLocale} from "../../../hooks/usePersianDataGridLocale.ts"; // مثال برای MUI


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
  { field: 'plan', headerName: 'پلن خریداری شده', width: 180, valueGetter: (_, row) => row.plan.name },
  {
  field: 'amount',
  headerName: 'مبلغ (ریال)',
  width: 150,
  valueFormatter: (value: any) => {
    if (typeof value === 'number') {
      return value.toLocaleString('fa-IR');
    }
    return '---';
  }
},
  { field: 'status', headerName: 'وضعیت', width: 120, renderCell: (params) => <StatusChip status={params.value} /> },
  { field: 'created_at', headerName: 'تاریخ', flex: 1, valueFormatter: (value) => new Date(value as string).toLocaleString('fa-IR') },
];

export function BillingHistoryPage() {
  const localeText = usePersianDataGridLocale();

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
          localeText={localeText}
        />
      </Box>
    </Box>
  );
}