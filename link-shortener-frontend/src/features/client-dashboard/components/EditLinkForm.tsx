import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {TextField, Button, Box, Typography, Alert, Modal, CircularProgress, Grid, Stack, IconButton} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { linkService } from '../../../services/linkService';
import type {LinkDetails, UpdateLinkPayload} from '../../../types/api';
import CloseIcon from "@mui/icons-material/Close";


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
  utmSource: z.string().nullable().optional(),
  utmMedium: z.string().nullable().optional(),
  utmCampaign: z.string().nullable().optional(),
  utmTerm: z.string().nullable().optional(),
  utmContent: z.string().nullable().optional(),
  showAds: z.boolean(),

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

  useEffect(() => {
        if (link) {
            reset({
                longUrl: link.long_url,
                utmSource: link.utm_source,
                utmMedium: link.utm_medium,
                utmCampaign: link.utm_campaign,
                utmTerm: link.utm_term,
                utmContent: link.utm_content,
                showAds: link.show_ads ?? true,
            });
        } else {
        reset({
            longUrl: '',
            utmSource: null,
            utmMedium: null,
            utmCampaign: null,
            utmTerm: null,
            utmContent: null,
            showAds: true,
        });
    }
    }, [link, reset]);

  const updateLinkMutation = useMutation({
    mutationFn: (data: UpdateLinkPayload) => linkService.updateLink(data),
    onSuccess: () => {
      // دوباره از جادوی invalidateQueries استفاده می‌کنیم
      queryClient.invalidateQueries({ queryKey: ['my-links'] });
      onClose(); // بستن مودال پس از موفقیت
    },
  });

  const onSubmit = (data: EditLinkFormInputs) => {
    if (!link) return;

    const domainIdToUse = link.domain_id || "0";

    // updateLinkMutation.mutate({ shortCode: link.short_code, longUrl: data.longUrl, domainId: domainIdToUse });
    updateLinkMutation.mutate({
            shortCode: link.short_code,
            long_url: data.longUrl,
            domainId: domainIdToUse,
            utm_source: data.utmSource,
            utm_medium: data.utmMedium,
            utm_campaign: data.utmCampaign,
            utm_term: data.utmTerm,
            utm_content: data.utmContent,
            show_ads: data.showAds,

        });
  };
const handleClose = () => {
    reset();
    updateLinkMutation.reset();
    onClose();
  };
  return (
    <Modal open={isOpen} onClose={onClose} aria-labelledby="edit-link-modal-title">
          <Box sx={{ ...modalStyle, width: { xs: '90%', sm: 600 } }}> {/* افزایش عرض برای فیلدهای UTM */}
              <IconButton
  onClick={handleClose}
  sx={{
    position: 'absolute',
    top: 8,
    right: 8,
    color: 'grey.700'
  }}
>
  <CloseIcon />
</IconButton>
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

              {/* ✨ بخش UTM Parameters */}
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 3, mb: 1 }}>
                پارامترهای UTM (اختیاری)
              </Typography>
              <Grid container spacing={2}> {/* استفاده از Grid برای چیدمان بهتر */}
                {/* UTM Source */}
                <Grid size={{xs: 12, sm: 6}}>
                  <Controller
                    name="utmSource"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Source (منبع: utm_source)"
                        error={!!errors.utmSource}
                        helperText={errors.utmSource?.message}
                      />
                    )}
                  />
                </Grid>
                {/* UTM Medium */}
                <Grid size={{xs: 12, sm: 6}}>
                  <Controller
                    name="utmMedium"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Medium (واسط: utm_medium)"
                        error={!!errors.utmMedium}
                        helperText={errors.utmMedium?.message}
                      />
                    )}
                  />
                </Grid>
                {/* UTM Campaign */}
                <Grid size={{xs: 12, sm: 12}}>
                  <Controller
                    name="utmCampaign"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Campaign (کمپین: utm_campaign)"
                        error={!!errors.utmCampaign}
                        helperText={errors.utmCampaign?.message}
                      />
                    )}
                  />
                </Grid>
                {/* UTM Term and Content */}
                <Grid size={{xs: 12, sm: 6}}>
                  <Controller
                    name="utmTerm"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Term (کلمات کلیدی: utm_term)"
                        error={!!errors.utmTerm}
                        helperText={errors.utmTerm?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{xs: 12, sm: 6}}>
                  <Controller
                    name="utmContent"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Content (محتوا: utm_content)"
                        error={!!errors.utmContent}
                        helperText={errors.utmContent?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name="showAds"
                control={control}
                render={({ field }) => (
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      id="showAdsEdit"
                    />
                    <label htmlFor="showAdsEdit">نمایش صفحه تبلیغاتی قبل از انتقال (show_ads)</label>
                  </Stack>
                )}
              />
            </Grid>


              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={updateLinkMutation.isPending}
                sx={{ mt: 3 }}
              >
                {updateLinkMutation.isPending ? <CircularProgress size={24} /> : 'ذخیره تغییرات'}
              </Button>
            </Box>
          </Box>
        </Modal>
    );
}