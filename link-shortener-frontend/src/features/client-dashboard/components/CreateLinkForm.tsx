import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextField, Button, Box, Typography, Alert, Modal, CircularProgress, Autocomplete } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { linkService } from '../../../services/linkService';
import { domainService } from '../../../services/domainService';
import type { DomainResponse } from '../../../types/api';

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
  domain: z
    .object({
      id: z.number(),
      name: z.string(),
      is_verified: z.boolean(),
      is_primary: z.boolean(),
      created_at: z.string(),
    })
    .optional()
    .nullable(),
});

type CreateLinkFormInputs = z.infer<typeof createLinkSchema>;

interface CreateLinkFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateLinkForm({ isOpen, onClose }: CreateLinkFormProps) {
  const queryClient = useQueryClient();

  // const { data: domains } = useQuery(['domains'], domainService.getDomains);

  const { data: domains } = useQuery<DomainResponse[]>({
      queryKey: ['domains'],
      queryFn: domainService.getDomains,
    });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateLinkFormInputs>({
    resolver: zodResolver(createLinkSchema),
    defaultValues: { longUrl: '', domain: null },
  });

  const createLinkMutation = useMutation({
    mutationFn: (payload: { long_url: string; domain_id?: number | null }) =>
      linkService.createShortLink(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-links'] });
      handleClose();
    },
  });

  const onSubmit = (data: CreateLinkFormInputs) => {
    createLinkMutation.mutate({
      long_url: data.longUrl,
      domain_id: data.domain?.id,
    });
  };

  const handleClose = () => {
    reset();
    createLinkMutation.reset();
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={handleClose} aria-labelledby="create-link-modal-title">
      <Box sx={modalStyle}>
        <Typography id="create-link-modal-title" variant="h6" component="h2">
          ایجاد لینک کوتاه جدید
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 2 }}>
          {createLinkMutation.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {createLinkMutation.error.message || 'خطا در ایجاد لینک.'}
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

          <Controller
            name="domain"
            control={control}
            render={({ field }) => (
              <Autocomplete
                {...field}
                options={(domains || []).filter((d) => d.is_verified)}
                getOptionLabel={(opt) => opt.name}
                value={field.value}
                onChange={(_, v) => field.onChange(v)}
                renderInput={(params) => <TextField {...params} label="دامنه (اختیاری)" />}
                isOptionEqualToValue={(option, value) => option.id === value?.id}
                sx={{ mb: 2 }}
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