import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextField, Button, Box, Typography, Alert, Modal, CircularProgress } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { linkService } from '../../../services/linkService';

// استایل برای قرارگیری مودال در مرکز صفحه
const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

// تعریف Schema برای اعتبارسنجی با Zod
const createLinkSchema = z.object({
  longUrl: z.string().url('لطفاً یک آدرس اینترنتی معتبر وارد کنید.'),
});

type CreateLinkFormInputs = z.infer<typeof createLinkSchema>;

interface CreateLinkFormProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateLinkForm({ isOpen, onClose }: CreateLinkFormProps) {
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateLinkFormInputs>({
    resolver: zodResolver(createLinkSchema),
    defaultValues: { longUrl: '' },
  });

  const createLinkMutation = useMutation({
    mutationFn: (longUrl: string) => linkService.createShortLink(longUrl),
    onSuccess: () => {
      // این بخش جادوی TanStack Query است!
      // پس از موفقیت، تمام کوئری‌های مربوط به 'my-links' را نامعتبر اعلام می‌کنیم.
      // این کار باعث می‌شود کامپوننت لیست لینک‌ها به طور خودکار داده‌های جدید را واکشی کند.
      queryClient.invalidateQueries({ queryKey: ['my-links'] }); // [cite: 796]
      handleClose(); // بستن مودال
    },
  });

  const onSubmit = (data: CreateLinkFormInputs) => {
    createLinkMutation.mutate(data.longUrl);
  };

  const handleClose = () => {
    reset(); // ریست کردن فرم
    createLinkMutation.reset(); // ریست کردن وضعیت خطا
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="create-link-modal-title"
    >
      <Box sx={modalStyle}>
        <Typography id="create-link-modal-title" variant="h6" component="h2">
          ایجاد لینک کوتاه جدید
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 2 }}>
          {createLinkMutation.isError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {createLinkMutation.error.message || "خطا در ایجاد لینک."}
              </Alert>
          )}

          <Controller
            name="longUrl"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                required
                fullWidth
                label="آدرس اصلی (URL)"
                autoFocus
                error={!!errors.longUrl}
                helperText={errors.longUrl?.message}
                // استفاده از ویژگی‌های منطقی برای استایل‌دهی مستقل از جهت
                sx={{ mb: 2 }} // margin-bottom
              />
            )}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={createLinkMutation.isPending}
          >
            {createLinkMutation.isPending ? <CircularProgress size={24} /> : 'کوتاه کن'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}