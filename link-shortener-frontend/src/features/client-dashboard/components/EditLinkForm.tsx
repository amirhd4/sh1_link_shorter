import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextField, Button, Box, Typography, Alert, Modal, CircularProgress } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { linkService } from '../../../services/linkService';
import type { LinkDetails } from '../../../types/api';

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

const editLinkSchema = z.object({
  longUrl: z.string().url('لطفاً یک آدرس اینترنتی معتبر وارد کنید.'),
});

type EditLinkFormInputs = z.infer<typeof editLinkSchema>;

interface EditLinkFormProps {
    isOpen: boolean;
    onClose: () => void;
    link: LinkDetails | null; // لینک مورد نظر برای ویرایش
}

export function EditLinkForm({ isOpen, onClose, link }: EditLinkFormProps) {
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditLinkFormInputs>({
    resolver: zodResolver(editLinkSchema),
  });

  // با استفاده از useEffect، هر زمان که لینک ورودی تغییر کرد، فرم را با اطلاعات آن پر می‌کنیم
  useEffect(() => {
    if (link) {
      reset({ longUrl: link.long_url });
    }
  }, [link, reset]);

  const updateLinkMutation = useMutation({
    mutationFn: (data: { shortCode: string; longUrl: string }) => linkService.updateLink(data),
    onSuccess: () => {
      // دوباره از جادوی invalidateQueries استفاده می‌کنیم
      queryClient.invalidateQueries({ queryKey: ['my-links'] });
      onClose(); // بستن مودال پس از موفقیت
    },
  });

  const onSubmit = (data: EditLinkFormInputs) => {
    if (!link) return;
    updateLinkMutation.mutate({ shortCode: link.short_code, longUrl: data.longUrl });
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="edit-link-modal-title"
    >
      <Box sx={modalStyle}>
        <Typography id="edit-link-modal-title" variant="h6" component="h2">
          ویرایش لینک
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 2 }}>
          {updateLinkMutation.isError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {updateLinkMutation.error.message || "خطا در ویرایش لینک."}
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
                sx={{ mb: 2 }}
              />
            )}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={updateLinkMutation.isPending}
          >
            {updateLinkMutation.isPending ? <CircularProgress size={24} /> : 'ذخیره تغییرات'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}