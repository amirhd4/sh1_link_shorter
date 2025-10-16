import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    TextField, Button, Box, Typography, Alert, Modal, CircularProgress, Autocomplete, Grid, Stack,
    useMediaQuery, useTheme,
    IconButton
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { linkService } from '../../../services/linkService';
import { domainService } from '../../../services/domainService';
import type { DomainResponse, URLCreate, URLResponse } from '../../../types/api';
import CloseIcon from '@mui/icons-material/Close';


// 1. استایل برای قرارگیری مودال در مرکز صفحه (افزایش عرض برای فیلدهای UTM)
const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '95%', sm: 650 }, // افزایش عرض
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  maxHeight: '90vh',
  overflowY: 'auto'
};

// 2. ✨ تعریف Schema برای اعتبارسنجی با Zod (با UTM)
const createLinkSchema = z.object({
  longUrl: z.string().url('لطفاً یک آدرس اینترنتی معتبر وارد کنید.'),
  shortCode: z.string().optional(), // اضافه کردن فیلد shortCode
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

  // UTM Fields - مطابق با ساختار EditLinkForm
  utmSource: z.string().nullable().optional(),
  utmMedium: z.string().nullable().optional(),
  utmCampaign: z.string().nullable().optional(),
  utmTerm: z.string().nullable().optional(),
  utmContent: z.string().nullable().optional(),
  showAds: z.boolean(),

});

type CreateLinkFormInputs = z.infer<typeof createLinkSchema>;

interface CreateLinkFormProps {
  isOpen: boolean;
  onClose: () => void;
}

// برای مدیریت دامنه پیش‌فرض در Autocomplete
const DEFAULT_DOMAIN_OBJECT: DomainResponse = {
    id: 0,
    name: "(دامنه پیش‌فرض)",
    is_verified: true,
    is_primary: false,
    created_at: new Date().toISOString()
};


export function CreateLinkForm({ isOpen, onClose }: CreateLinkFormProps) {
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
    defaultValues: {
        longUrl: '',
        shortCode: '',
        domain: DEFAULT_DOMAIN_OBJECT, // برای حفظ Autocomplete
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
        utmTerm: null,
        utmContent: null,
        showAds: true,

    },
  });

  const createLinkMutation = useMutation<URLResponse, Error, URLCreate>({
    // 3. رفع خطای TS2339: استفاده از createShortLink
    mutationFn: (payload) => linkService.createShortLink(payload),
    // 4. رفع خطای TS2339: تعیین نوع داده خروجی (data: URLResponse)
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['my-links'] });
      // می‌توانید از short_url استفاده کنید:
      // console.log(`لینک ایجاد شد: ${data.short_url}`);
      handleClose();
    },
  });

  const onSubmit = (data: CreateLinkFormInputs) => {
    // تبدیل فیلدهای UTM خالی ('') به null برای سازگاری با بک‌اند
    const utmPayload = {
        utm_source: data.utmSource || null,
        utm_medium: data.utmMedium || null,
        utm_campaign: data.utmCampaign || null,
        utm_term: data.utmTerm || null,
        utm_content: data.utmContent || null,
    };

    const payload: URLCreate = {
      long_url: data.longUrl,
      domain_id: data.domain?.id,
      show_ads: data.showAds,
      ...utmPayload,
    };

    // فیلدهای اختیاری که در بک‌اند nullable هستند را حذف می‌کنیم اگر خالی باشند.
    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

    createLinkMutation.mutate(payload);
  };

  const handleClose = () => {
    reset();
    createLinkMutation.reset();
    onClose();
  };

  // دامنه پیش‌فرض را به لیست اضافه می‌کنیم
  const availableDomains = [
    DEFAULT_DOMAIN_OBJECT,
    ...(domains || []).filter((d) => d.is_verified)
  ];

  return (
    <Modal open={isOpen} onClose={handleClose} aria-labelledby="create-link-modal-title">
      <Box sx={modalStyle}>
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
        <Typography id="create-link-modal-title" variant="h5" component="h2" sx={{ mb: 3 }}>
          ایجاد لینک کوتاه جدید
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          {createLinkMutation.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {/* @ts-ignore */}
              {createLinkMutation.error.response?.data?.detail || createLinkMutation.error.message || 'خطا در ایجاد لینک.'}
            </Alert>
          )}

          <Grid container spacing={2}>
            {/* Long URL */}
            <Grid size={{xs: 12}}>
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
                        />
                    )}
                />
            </Grid>

            {/* Domain Select (Autocomplete) */}
            <Grid size={{xs: 12, sm: 6}}>

                <Controller
                    name="domain"
                    control={control}
                    render={({ field }) => (
                        <Autocomplete
                            {...field}
                            // اطمینان از مقداردهی field.value با یک آبجکت DomainResponse یا null
                            value={field.value || DEFAULT_DOMAIN_OBJECT}
                            onChange={(_, v) => field.onChange(v)}
                            options={availableDomains}
                            getOptionLabel={(opt) => opt.name}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            renderInput={(params) => <TextField {...params} label="دامنه" />}
                            sx={{ width: '100%' }}
                        />
                    )}
                />
            </Grid>
          </Grid>

          {/* ✨ بخش UTM Parameters */}
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 3, mb: 1 }}>
            پارامترهای UTM (اختیاری)
          </Typography>

          <Grid container spacing={2}>
            {/* UTM Source */}
            <Grid size={{xs: 12, sm: 6}}>
              <Controller
                name="utmSource"
                control={control}
                render={({ field }) => (
                  <TextField
                    // تبدیل null به '' برای نمایش در TextField و مدیریت توسط React Hook Form
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value || null)}
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
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value || null)}
                    fullWidth
                    label="Medium (واسط: utm_medium)"
                    error={!!errors.utmMedium}
                    helperText={errors.utmMedium?.message}
                  />
                )}
              />
            </Grid>
            {/* UTM Campaign */}
            <Grid size={{xs: 12}}>
              <Controller
                name="utmCampaign"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value || null)}
                    fullWidth
                    label="Campaign (کمپین: utm_campaign)"
                    error={!!errors.utmCampaign}
                    helperText={errors.utmCampaign?.message}
                  />
                )}
              />
            </Grid>
            {/* UTM Term */}
            <Grid size={{xs: 12, sm: 6}}>
              <Controller
                name="utmTerm"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value || null)}
                    fullWidth
                    label="Term (کلمات کلیدی: utm_term)"
                    error={!!errors.utmTerm}
                    helperText={errors.utmTerm?.message}
                  />
                )}
              />
            </Grid>
            {/* UTM Content */}
            <Grid size={{xs: 12, sm: 6}}>
              <Controller
                name="utmContent"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value || null)}
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
                      id="showAds"
                    />
                    <label htmlFor="showAds">نمایش صفحه تبلیغاتی قبل از انتقال (show_ads)</label>
                  </Stack>
                )}
              />
            </Grid>



          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={createLinkMutation.isPending}
            sx={{ mt: 3 }}
          >
            {createLinkMutation.isPending ? <CircularProgress size={24} /> : 'کوتاه کن'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}