import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Box, Typography, Button, FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert } from '@mui/material';
import { plansService } from '../../../services/plansService';
import { adminService } from '../../../services/adminService';
import { useState } from 'react';
import type { UserResponse } from '../../../types/api';

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

interface AssignPlanModalProps {
  open: boolean;
  onClose: () => void;
  user: UserResponse | null;
}

export function AssignPlanModal({ open, onClose, user }: AssignPlanModalProps) {
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState('');

  // واکشی لیست تمام پلن‌ها برای نمایش در منوی کشویی
  const { data: plans, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['plans'],
    queryFn: plansService.getAllPlans,
  });

  const assignPlanMutation = useMutation({
    mutationFn: adminService.assignPlanToUser,
    onSuccess: () => {
      // رفرش کردن لیست کاربران برای نمایش پلن جدید
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      onClose();
    },
  });

  const handleSubmit = () => {
    if (user && selectedPlan) {
      assignPlanMutation.mutate({ userId: user.id, planName: selectedPlan });
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6">تغییر پلن برای {user?.email}</Typography>
        {isLoadingPlans ? <CircularProgress sx={{mt: 2}} /> : (
          <FormControl fullWidth sx={{ mt: 3 }}>
            <InputLabel id="plan-select-label">انتخاب پلن</InputLabel>
            <Select
              labelId="plan-select-label"
              value={selectedPlan}
              label="انتخاب پلن"
              onChange={(e) => setSelectedPlan(e.target.value)}
            >
              {plans?.map(plan => <MenuItem key={plan.id} value={plan.name}>{plan.name}</MenuItem>)}
            </Select>
          </FormControl>
        )}
        {assignPlanMutation.isError && <Alert severity="error" sx={{mt: 2}}>خطا در تخصیص پلن.</Alert>}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={onClose}>انصراف</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!selectedPlan || assignPlanMutation.isPending}
          >
            {assignPlanMutation.isPending ? <CircularProgress size={24} /> : 'ذخیره'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}