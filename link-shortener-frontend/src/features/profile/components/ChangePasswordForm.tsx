import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextField, Button, Box, Alert } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../../../services/authService';

// Schema با اعتبارسنجی تطابق رمز جدید
const passwordSchema = z.object({
  current_password: z.string().min(1, 'رمز عبور فعلی الزامی است.'),
  new_password: z.string().min(6, 'رمز عبور جدید باید حداقل ۶ کاراکتر باشد.'),
  confirm_password: z.string(),
}).refine(data => data.new_password === data.confirm_password, {
  message: "رمز عبور جدید و تکرار آن مطابقت ندارند.",
  path: ["confirm_password"], // نمایش خطا زیر فیلد تکرار رمز
});

type PasswordFormInputs = z.infer<typeof passwordSchema>;

export function ChangePasswordForm() {
  const { control, handleSubmit, formState: { errors }, reset } = useForm<PasswordFormInputs>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current_password: '', new_password: '', confirm_password: '' },
  });

  const changePasswordMutation = useMutation({
    mutationFn: authService.changePassword,
    onSuccess: () => {
      reset(); // ریست کردن فرم پس از موفقیت
    },
  });

  const onSubmit = (data: PasswordFormInputs) => {
    changePasswordMutation.mutate({
      current_password: data.current_password,
      new_password: data.new_password,
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
      {changePasswordMutation.isSuccess && <Alert severity="success">رمز عبور با موفقیت تغییر کرد.</Alert>}
      {changePasswordMutation.isError && <Alert severity="error">خطا: رمز عبور فعلی اشتباه است.</Alert>}

      <Controller name="current_password" control={control} render={({ field }) => (
        <TextField {...field} type="password" required fullWidth label="رمز عبور فعلی" sx={{ mt: 2 }} error={!!errors.current_password} helperText={errors.current_password?.message} />
      )} />
      <Controller name="new_password" control={control} render={({ field }) => (
        <TextField {...field} type="password" required fullWidth label="رمز عبور جدید" sx={{ mt: 2 }} error={!!errors.new_password} helperText={errors.new_password?.message} />
      )} />
      <Controller name="confirm_password" control={control} render={({ field }) => (
        <TextField {...field} type="password" required fullWidth label="تکرار رمز عبور جدید" sx={{ mt: 2 }} error={!!errors.confirm_password} helperText={errors.confirm_password?.message} />
      )} />

      <Button type="submit" variant="contained" sx={{ mt: 3 }} disabled={changePasswordMutation.isPending}>
        {changePasswordMutation.isPending ? 'در حال تغییر...' : 'تغییر رمز عبور'}
      </Button>
    </Box>
  );
}