import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Modal,
  CircularProgress,
  Autocomplete,
  Grid,
  Stack,
  useMediaQuery,
  useTheme,
  IconButton,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { linkService } from '@/services/linkService';
import { domainService } from '@/services/domainService';
import type { DomainResponse, URLCreate, URLResponse } from '@/types/api';
import CloseIcon from '@mui/icons-material/Close';
import LinkIcon from '@mui/icons-material/Link';
import {useState} from "react";

// 🧠 Schema با اعتبارسنجی کد دلخواه
const createLinkSchema = z.object({
  longUrl: z.string().url('لطفاً یک آدرس اینترنتی معتبر وارد کنید.'),
  shortCode: z
    .string()
    .regex(/^[a-zA-Z0-9_-]*$/, 'فقط حروف، عدد، خط فاصله و زیرخط مجاز است.')
    .optional(),
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
  utmSource: z.string().nullable().optional(),
  utmMedium: z.string().nullable().optional(),
  utmCampaign: z.string().nullable().optional(),
  utmTerm: z.string().nullable().optional(),
  utmContent: z.string().nullable().optional(),
  showAds: z.boolean(),
  password: z.string().nullable().optional(),
});

type CreateLinkFormInputs = z.infer<typeof createLinkSchema>;

interface CreateLinkFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_DOMAIN_OBJECT: DomainResponse = {
  id: 0,
  name: "(دامنه پیش‌فرض)",
  is_verified: true,
  is_primary: false,
  created_at: new Date().toISOString(),
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
    watch,
  } = useForm<CreateLinkFormInputs>({
    resolver: zodResolver(createLinkSchema),
    defaultValues: {
      longUrl: '',
      shortCode: '',
      domain: DEFAULT_DOMAIN_OBJECT,
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmTerm: null,
      utmContent: null,
      showAds: true,
      password: null,
    },
  });

  const [errorAlias, setErrorAlias] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const selectedDomain = watch('domain');
  const customAlias = watch('shortCode');

  const createLinkMutation = useMutation<URLResponse, any, URLCreate>({
  mutationFn: (payload) => linkService.createShortLink(payload),
  onSuccess: () => {
    queryClient.invalidateQueries({queryKey: ['my-links']}).then(r => null);
    handleClose();
  },
  onError: (error: any) => {
    // اگر سرور پیام خاصی فرستاده بود، اون رو نشون بده
    const detail = error.response?.data?.detail;
    if (detail?.field === "custom_alias" || detail === "این نام قبلاً استفاده شده است.") {
      setErrorAlias("این کد قبلاً استفاده شده است. لطفاً مورد دیگری انتخاب کنید.");
    } else {
      setGlobalError(detail?.message || detail || "خطایی رخ داد در ایجاد لینک.");
    }
  },
});


  const onSubmit = (data: CreateLinkFormInputs) => {
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
      custom_alias: data.shortCode?.trim() || null, // ✅ اضافه شد
      ...utmPayload,
    };

    if (data.password) {
      payload.password = data.password;
    }

    Object.keys(payload).forEach((key) => {
  const k = key as keyof URLCreate;
  if (payload[k] === undefined) {
    delete payload[k];
  }
});


    createLinkMutation.mutate(payload);
  };

  const handleClose = () => {
    reset();
    createLinkMutation.reset();
    onClose();
  };

  const availableDomains = [
    DEFAULT_DOMAIN_OBJECT,
    ...(domains || []).filter((d) => d.is_verified),
  ];

  // لینک پیش‌نمایش (preview)
  const previewDomain =
    selectedDomain?.name && selectedDomain.name !== "(دامنه پیش‌فرض)"
      ? selectedDomain.name
      : "l1s.ir";
  const previewLink = customAlias
    ? `https://${previewDomain}/${customAlias}`
    : `https://${previewDomain}/abc123`;

  return (
    <Modal open={isOpen} onClose={handleClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '95%', sm: 650 },
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >

          {globalError && (
  <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
    {globalError}
  </Alert>
)}

        <IconButton
          onClick={handleClose}
          sx={{ position: 'absolute', top: 8, right: 8, color: 'grey.700' }}
        >
          <CloseIcon />
        </IconButton>

        <Typography variant="h5" mb={3}>
          ایجاد لینک کوتاه جدید
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          {createLinkMutation.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {/* @ts-ignore */}
              {createLinkMutation.error.response?.data?.detail ||
                createLinkMutation.error.message ||
                'خطا در ایجاد لینک.'}
            </Alert>
          )}

          <Grid container spacing={2}>
            {/* Long URL */}
            <Grid size={{ xs :12 }}>
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

            {/* دامنه و کد کوتاه دلخواه */}
            <Grid size={{xs: 12, sm: 6}}>
              <Controller
                name="domain"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    value={field.value || DEFAULT_DOMAIN_OBJECT}
                    onChange={(_, v) => field.onChange(v)}
                    options={availableDomains}
                    getOptionLabel={(opt) => opt.name}
                    isOptionEqualToValue={(opt, val) => opt.id === val.id}
                    renderInput={(params) => (
                      <TextField {...params} label="دامنه" />
                    )}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs :12 , sm: 6}}>
              <Controller
                name="shortCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="کد دلخواه (اختیاری)"
                    placeholder="مثلاً my-link"
                    error={!!errors.shortCode || !!errorAlias}
                    helperText={
                      errors.shortCode?.message ||
                      'اگر خالی بماند، به‌صورت خودکار ساخته می‌شود.'
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LinkIcon fontSize="small" color="disabled" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>

          {/* ✨ پیش‌نمایش لینک نهایی */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 1,
              fontStyle: 'italic',
              direction: 'ltr',
              textAlign: 'left',
              userSelect: 'text',
            }}
          >
            🔗 پیش‌نمایش: {previewLink}
          </Typography>

          {/* بقیه فرم (UTM + تنظیمات) */}
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 3, mb: 1 }}>
            پارامترهای UTM (اختیاری)
          </Typography>

          <Grid container spacing={2}>
            {[
              { name: 'utmSource', label: 'Source (منبع: utm_source)' },
              { name: 'utmMedium', label: 'Medium (واسط: utm_medium)' },
              { name: 'utmCampaign', label: 'Campaign (کمپین: utm_campaign)' },
              { name: 'utmTerm', label: 'Term (کلمات کلیدی: utm_term)' },
              { name: 'utmContent', label: 'Content (محتوا: utm_content)' },
            ].map(({ name, label }) => (
              <Grid size={{ xs :12 , sm: 2}} key={name}>
                <Controller
                  name={name as keyof CreateLinkFormInputs}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value || null)}
                      fullWidth
                      label={label}
                    />
                  )}
                />
              </Grid>
            ))}
          </Grid>

        <Grid size={{ xs :12}} mt={2}>
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
                  <label htmlFor="showAds">
                    نمایش صفحه تبلیغاتی قبل از انتقال (show_ads)
                  </label>
                </Stack>
              )}
            />
          </Grid>

          <Grid size={{ xs :12  }} mt={2}>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="password"
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value || null)}
                  fullWidth
                  label="رمز عبور لینک (اختیاری)"
                  placeholder="اگر می‌خواهید لینک رمزدار باشد، رمز را وارد کنید"
                />
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
            {createLinkMutation.isPending ? (
              <CircularProgress size={24} />
            ) : (
              'ایجاد لینک کوتاه'
            )}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
