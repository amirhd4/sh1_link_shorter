import { useEffect, useState, useCallback } from "react";
import {
  Box, Card, CardContent, Typography, Divider, TextField, IconButton, Tooltip,
  Alert, Stack, LinearProgress, useTheme, useMediaQuery, Collapse
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CodeIcon from "@mui/icons-material/Code";
import LanguageIcon from "@mui/icons-material/Language";
import { apiService } from "../../../services/apiService"; // سرویس مربوط به API Key
import { useUserStore } from "../../../store/userStore";

// =========================================================================
// کامپوننت مستقل برای نمایش کد
// =========================================================================
interface CodeBlockProps {
  title: string;
  code: string;
  language: string;
}

function CodeBlock({ title, code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card variant="outlined" sx={{ mb: 2, borderRadius: 2, bgcolor: '#f5f5f5' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" p={1} sx={{ bgcolor: '#e0e0e0' }}>
        <Typography variant="subtitle2" fontWeight="bold">
          {title} ({language})
        </Typography>
        <Tooltip title={copied ? "کپی شد!" : "کپی کردن کد"}>
          <IconButton size="small" onClick={handleCopy} color={copied ? "success" : "default"}>
            {copied ? <CheckCircleIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Stack>
      <Box sx={{ p: 1, overflowX: 'auto', maxHeight: '300px' }}>
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '0.8rem', fontFamily: 'monospace' }}>
          <code>{code}</code>
        </pre>
      </Box>
    </Card>
  );
}
// =========================================================================

export function ApiPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useUserStore();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string }>({ open: false, message: '' });

  const fetchKey = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiService.getApiKey();
      setApiKey(res.api_key);
    } catch (error) {
        setApiKey(null); // اگر کلیدی تولید نشده بود
    } finally {
      setLoading(false);
    }
  }, []);

  const regenerateKey = async () => {
    setLoading(true);
    try {
      const res = await apiService.regenerateApiKey();
      setApiKey(res.api_key);
      setSnackbar({ open: true, message: "کلید API با موفقیت تولید مجدد شد." });
    } catch (error) {
        setSnackbar({ open: true, message: "خطا در تولید مجدد کلید." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKey();
  }, [fetchKey]);

  const copyToClipboard = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setSnackbar({ open: true, message: "API Key کپی شد." });
    }
  };

  // =========================================================================
  // مثال‌های کد برای مستندات
  // =========================================================================
  const defaultBaseUrl = "https://l1s.ir/api/v1/shorten";
  const authHeader = `"Api-Key": "${apiKey || "YOUR_API_KEY"}"`;

  // 1. تولید لینک با دامنه پیش فرض (Default)
  const defaultDomainCode = `
{
  "long_url": "https://google.com"
}
`.trim();

  // 2. تولید لینک با دامنه سفارشی (Custom)
  const customDomainCode = `
{
  "long_url": "https://custom-target.com/page",
  "domain_id": 42 // شناسه دامنه‌ای که قبلاً ثبت و تایید کرده‌اید.
}
`.trim();

  const curlDefault = `curl -X POST "${defaultBaseUrl}" \\
-H ${authHeader} \\
-H "Content-Type: application/json" \\
-d '${defaultDomainCode}'`;

  const curlCustom = `curl -X POST "${defaultBaseUrl}" \\
-H ${authHeader} \\
-H "Content-Type: application/json" \\
-d '${customDomainCode}'`;

  const jsFetchDefault = `fetch("${defaultBaseUrl}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    ${authHeader}
  },
  body: JSON.stringify(${defaultDomainCode.replace(/\n/g, '').replace(/ /g, '')})
})
.then(res => res.json())
.then(console.log);`;

  const jsFetchCustom = `fetch("${defaultBaseUrl}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    ${authHeader}
  },
  body: JSON.stringify(${customDomainCode.replace(/\n/g, '').replace(/ /g, '')})
})
.then(res => res.json())
.then(console.log);`;

  const pythonDefault = `import requests

res = requests.post(
    "${defaultBaseUrl}",
    headers={${authHeader}},
    json={"long_url": "https://google.com"}
)
print(res.json())`;

  const pythonCustom = `import requests

res = requests.post(
    "${defaultBaseUrl}",
    headers={${authHeader}},
    json=${customDomainCode.replace(/\n/g, '').replace(/ /g, '')}
)
print(res.json())`;

  // =========================================================================
  // رندر
  // =========================================================================
  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", p: isMobile ? 1 : 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: theme.palette.primary.main }}>
        مدیریت API Key
      </Typography>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* بخش نمایش کلید */}
      <Card sx={{ mb: 4, border: "1px solid", borderColor: theme.palette.divider, borderRadius: 3, boxShadow: 6 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            <CodeIcon color="primary" sx={{ fontSize: 30 }} />
            <Typography variant="h6" fontWeight="bold">
              کلید دسترسی (API Key)
            </Typography>
          </Stack>
          <Divider sx={{ mb: 2 }} />

          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            کلید شما برای احراز هویت در تمامی درخواست‌های API. این کلید را محرمانه نگه دارید!
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TextField
              size="small"
              fullWidth
              value={apiKey || (loading ? "در حال بارگذاری..." : "هنوز API Key تولید نشده")}
              InputProps={{ readOnly: true }}
              disabled={loading || !apiKey}
            />
            <Tooltip title="کپی کردن">
              <IconButton onClick={copyToClipboard} disabled={!apiKey}>
                <ContentCopyIcon color="primary" />
              </IconButton>
            </Tooltip>
            <Tooltip title="تولید مجدد کلید (کلید قبلی را باطل می‌کند)">
              <IconButton color="error" onClick={regenerateKey} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>

      {/* بخش مستندات */}
      <Card sx={{ mb: 4, border: "1px solid", borderColor: theme.palette.divider, borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            <LanguageIcon color="secondary" sx={{ fontSize: 30 }} />
            <Typography variant="h6" fontWeight="bold">
              مستندات: کوتاه کردن لینک (`/v1/shorten`)
            </Typography>
          </Stack>
          <Divider sx={{ mb: 2 }} />

          <Alert severity="info" sx={{ mb: 2 }}>
            برای احراز هویت، هدر **`Api-Key`** را در تمام درخواست‌های خود با مقدار کلیدتان ارسال کنید.
          </Alert>

          {/* حالت پیش فرض */}
          <Typography variant="h5" sx={{ mt: 3, mb: 2, color: theme.palette.success.dark }}>
            ۱. تولید لینک با دامنه پیش‌فرض
          </Typography>

          <CodeBlock title="درخواست Curl" code={curlDefault} language="Bash" />
          <CodeBlock title="درخواست JavaScript" code={jsFetchDefault} language="JavaScript" />
          <CodeBlock title="درخواست Python" code={pythonDefault} language="Python" />

          <Divider sx={{ my: 4 }} />

          {/* حالت دامنه سفارشی */}
          <Typography variant="h5" sx={{ mb: 2, color: theme.palette.secondary.dark }}>
            ۲. تولید لینک با دامنه سفارشی (Custom Domain)
          </Typography>
          <Alert severity="warning" sx={{ mb: 2 }}>
            برای استفاده از دامنه سفارشی، باید فیلد **`domain_id`** را با شناسه دامنه‌ای که قبلاً **تایید کرده‌اید**، در بدنه JSON ارسال کنید.
          </Alert>

          <CodeBlock title="درخواست Curl" code={curlCustom} language="Bash" />
          <CodeBlock title="درخواست JavaScript" code={jsFetchCustom} language="JavaScript" />
          <CodeBlock title="درخواست Python" code={pythonCustom} language="Python" />

        </CardContent>
      </Card>

      {/* بخش محدودیت‌ها */}
      <Card sx={{ border: "1px solid", borderColor: theme.palette.divider, borderRadius: 3, boxShadow: 1 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
            ⚡ محدودیت‌های پلن شما
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Typography variant="body1">
            **پلن فعلی:** <Chip label={user?.plan?.name || "رایگان"} color="primary" size="small" />
          </Typography>
          <Typography variant="body1">
            **سقف لینک در ماه:** {user?.plan?.link_limit_per_month?.toLocaleString('fa-IR') || "-"}
          </Typography>
          <Typography variant="body1">
            **تاریخ انقضا اشتراک:** {user?.subscription_end_date ? new Date(user.subscription_end_date).toLocaleDateString('fa-IR') : "-"}
          </Typography>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ open: false, message: '' })} severity="success" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// برای استفاده از Chip در آخر ایمپورت می‌کنیم.
import { Chip, Snackbar } from "@mui/material";