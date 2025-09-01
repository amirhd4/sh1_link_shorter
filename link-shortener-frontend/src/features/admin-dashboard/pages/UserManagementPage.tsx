import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataGrid, type GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import { adminService } from '../../../services/adminService';
import type { UserResponse } from '../../../types/api';
import EditIcon from '@mui/icons-material/Edit';
import { AssignPlanModal } from '../components/AssignPlanModal';

export function UserManagementPage() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);

  const { data: users, isLoading, isError, error } = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminService.getAllUsers,
  });

  const handleOpenModal = (user: UserResponse) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'email', headerName: 'ایمیل', flex: 1, minWidth: 200 },
    { field: 'role', headerName: 'نقش', width: 130 },
    {
      field: 'plan',
      headerName: 'پلن فعلی',
      width: 150,
      valueGetter: (value, row) => row.plan?.name || '---',
    },
    {
      field: 'subscription_end_date',
      headerName: 'تاریخ انقضای اشتراک',
      width: 180,
      valueFormatter: (value) => value ? new Date(value).toLocaleDateString('fa-IR') : '---',
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'عملیات',
      width: 100,
      getActions: ({ row }) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Change Plan"
          onClick={() => handleOpenModal(row as UserResponse)}
        />,
      ],
    },
  ];

  if (isLoading) return <CircularProgress />;
  if (isError) return <Alert severity="error">خطا در دریافت لیست کاربران: {error.message}</Alert>;

  return (
    <>
      <Box>
        <Typography variant="h4" gutterBottom>مدیریت کاربران</Typography>
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={users || []}
            columns={columns}
            getRowId={(row: UserResponse) => row.id}
            loading={isLoading}
            initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
            pageSizeOptions={[10, 25, 50]}
          />
        </Box>
      </Box>
      <AssignPlanModal
        open={isModalOpen}
        onClose={handleCloseModal}
        user={selectedUser}
      />
    </>
  );
}