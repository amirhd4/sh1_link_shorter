import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextField, Button, Box, Alert, CircularProgress } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../../../services/authService';
import { useUserStore } from '../../../store/userStore';
import type { UpdateProfilePayload } from '../../../types/auth';

// Schema برای اعتبارسنجی فرم
const profileSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone_number: z.string().optional(),
});

type ProfileFormInputs = z.infer<typeof profileSchema>;

export function UpdateProfileForm() {
  const queryClient = useQueryClient();
  const { setUser } = useUserStore();

  // واکشی اطلاعات فعلی کاربر برای پر کردن فرم
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['me'],
    queryFn: authService.getMe
  });

  const { control, handleSubmit, reset } = useForm<ProfileFormInputs>({
    resolver: zodResolver(profileSchema),
    // استفاده از اطلاعات واکشی شده برای مقادیر پیش‌فرض
    values: {
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        phone_number: user?.phone_number || '',
    },
    // اگر کاربر هنوز لود نشده، فرم را ریست نکن
    resetOptions: {
      keepValues: isUserLoading,
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => authService.updateMe(payload),
    onSuccess: (updatedUser) => {
      // به‌روزرسانی اطلاعات کاربر در همه جای برنامه
      queryClient.setQueryData(['me'], updatedUser);
      setUser(updatedUser);
      // می‌توانید یک پیام موفقیت (Snackbar) نمایش دهید
    },
  });

  const onSubmit = (data: ProfileFormInputs) => {
    updateMutation.mutate(data);
  };

  if (isUserLoading) {
      return <CircularProgress />;
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
      {updateMutation.isSuccess && <Alert severity="success">پروفایل با موفقیت به‌روز شد.</Alert>}
      {updateMutation.isError && <Alert severity="error">خطا در به‌روزرسانی پروفایل.</Alert>}

      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Controller name="first_name" control={control} render={({ field }) => <TextField {...field} fullWidth label="نام" />} />
        <Controller name="last_name" control={control} render={({ field }) => <TextField {...field} fullWidth label="نام خانوادگی" />} />
      </Box>
      <Controller name="phone_number" control={control} render={({ field }) => <TextField {...field} fullWidth label="شماره تلفن" sx={{ mt: 2 }} />} />

      <Button type="submit" variant="contained" sx={{ mt: 3 }} disabled={updateMutation.isPending}>
        {updateMutation.isPending ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
      </Button>
    </Box>
  );
}