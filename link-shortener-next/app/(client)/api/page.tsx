"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Box, Card, CardContent, Typography, Divider, TextField, IconButton, Tooltip,
  Alert, Stack, LinearProgress, useTheme, useMediaQuery, Snackbar, Chip
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CodeIcon from "@mui/icons-material/Code";
import LanguageIcon from "@mui/icons-material/Language";
import { apiService } from "@/services/apiService";
import { useUserStore } from "@/store/userStore";

// ========================================================================
// نمایش کد با قابلیت کپی
// ========================================================================
function CodeBlock({ title, code, language }: { title: string, code: string, language: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Card variant="outlined" sx={{ mb: 2, borderRadius: 2, bgcolor: "#f5f5f5" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" p={1} sx={{ bgcolor: "#e0e0e0" }}>
        <Typography variant="subtitle2" fontWeight="bold">{title} ({language})</Typography>
        <Tooltip title={copied ? "کپی شد!" : "کپی کردن"}>
          <IconButton size="small" onClick={handleCopy} color={copied ? "success" : "default"}>
            {copied ? <CheckCircleIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Stack>
      <Box sx={{ p: 1, overflowX: "auto" }}>
        <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontSize: "0.8rem", fontFamily: "monospace" }}>
          <code>{code}</code>
        </pre>
      </Box>
    </Card>
  );
}

// ========================================================================
// صفحه اصلی مستندات API
// ========================================================================
export default function ApiPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user } = useUserStore();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: "" });

  const fetchKey = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiService.getApiKey();
      setApiKey(res.api_key);
    } catch {
      setApiKey(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const regenerateKey = async () => {
    setLoading(true);
    try {
      const res = await apiService.regenerateApiKey();
      setApiKey(res.api_key);
      setSnackbar({ open: true, message: "کلید جدید با موفقیت تولید شد." });
    } catch {
      setSnackbar({ open: true, message: "خطا در تولید مجدد کلید." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchKey(); }, [fetchKey]);

  const copyKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setSnackbar({ open: true, message: "API Key کپی شد." });
    }
  };

  // =========================================================================
  // نمونه کدها
  // =========================================================================
  const baseUrl = "https://l1s.ir/api/v1/shorten";
  const authHeader = apiKey ? `Api-Key: ${apiKey}` : `Api-Key: YOUR_API_KEY`;

  const exampleSimple = { long_url: "https://example.com" };
  const exampleCustomDomain = { long_url: "https://your-website.com", domain_id: 42 };
  const examplePassword = { long_url: "https://secure-page.com", password: "1234" };
  const exampleUTM = {
    long_url: "https://mysite.com/offer",
    utm_source: "instagram",
    utm_medium: "bio",
    utm_campaign: "black_friday"
  };
  const exampleAds = { long_url: "https://target.com", show_ads: true };

  const curlExample = (data: any) => {
    const json = JSON.stringify(data).replace(/"/g, '\\"'); // escape " for Windows
    return `curl -X POST "${baseUrl}" \\\n-H "${authHeader}" \\\n-H "Content-Type: application/json" \\\n-d "${json}"`;
  };

  const pythonExample = (data: any) => {
    const json = JSON.stringify(data, null, 2);
    return `import requests\n\nres = requests.post("${baseUrl}",\n  headers={"Api-Key": "${apiKey || 'YOUR_API_KEY'}", "Content-Type": "application/json"},\n  json=${json}\n)\nprint(res.json())`;
  };

  const jsExample = (data: any) => {
    const json = JSON.stringify(data, null, 2);
    return `fetch("${baseUrl}", {\n  method: "POST",\n  headers: {\n    "Content-Type": "application/json",\n    "Api-Key": "${apiKey || 'YOUR_API_KEY'}"\n  },\n  body: JSON.stringify(${json})\n})\n.then(r => r.json())\n.then(console.log);`;
  };

  // =========================================================================
  // رندر صفحه
  // =========================================================================
  useEffect(() => {
    document.title = "مدیریت API";
  }, []);

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", p: isMobile ? 1 : 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: theme.palette.primary.main }}>
        مستندات و کلید API
      </Typography>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* بخش کلید API */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 4 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
            <CodeIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h6" fontWeight="bold">کلید دسترسی API</Typography>
          </Stack>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body2" sx={{ mb: 1 }}>
            از این کلید برای احراز هویت در درخواست‌های API استفاده کنید. <b>هرگز آن را عمومی نکنید.</b>
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField fullWidth size="small" value={apiKey || "هنوز تولید نشده"} InputProps={{ readOnly: true }} />
            <Tooltip title="کپی">
              <IconButton onClick={copyKey} disabled={!apiKey}><ContentCopyIcon /></IconButton>
            </Tooltip>
            <Tooltip title="تولید مجدد (کلید قبلی باطل می‌شود)">
              <IconButton color="error" onClick={regenerateKey}><RefreshIcon /></IconButton>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>

      {/* بخش مستندات */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            <LanguageIcon color="secondary" sx={{ fontSize: 30 }} />
            <Typography variant="h6" fontWeight="bold">مستندات: ساخت لینک کوتاه (`/v1/shorten`)</Typography>
          </Stack>
          <Divider sx={{ mb: 2 }} />
          <Alert severity="info" sx={{ mb: 2 }}>
            برای هر درخواست، هدر <b>`Api-Key`</b> الزامی است.
          </Alert>

          <Typography variant="h5" sx={{ mt: 3, mb: 2, color: theme.palette.success.dark }}>۱. لینک ساده</Typography>
          <CodeBlock title="Curl" code={curlExample(exampleSimple)} language="bash" />
          <CodeBlock title="JavaScript" code={jsExample(exampleSimple)} language="js" />
          <CodeBlock title="Python" code={pythonExample(exampleSimple)} language="python" />

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" sx={{ mb: 2, color: theme.palette.secondary.dark }}>۲. دامنه سفارشی</Typography>
          <Alert severity="warning" sx={{ mb: 2 }}>
            برای استفاده از دامنه سفارشی، باید آن را در پنل کاربری ثبت و تایید کرده باشید.
          </Alert>
          <CodeBlock title="Curl" code={curlExample(exampleCustomDomain)} language="bash" />
          <CodeBlock title="JavaScript" code={jsExample(exampleCustomDomain)} language="js" />

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" sx={{ mb: 2, color: theme.palette.error.dark }}>۳. لینک رمزدار</Typography>
          <Alert severity="error" sx={{ mb: 2 }}>
            لینک‌های رمزدار در پایگاه داده به‌صورت <b>هش‌شده</b> ذخیره می‌شوند و رمز واقعی قابل بازیابی نیست.
          </Alert>
          <CodeBlock title="Curl" code={curlExample(examplePassword)} language="bash" />
          <CodeBlock title="Python" code={pythonExample(examplePassword)} language="python" />

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" sx={{ mb: 2, color: theme.palette.info.dark }}>۴. لینک با UTM Parameters</Typography>
          <CodeBlock title="Curl" code={curlExample(exampleUTM)} language="bash" />
          <CodeBlock title="JavaScript" code={jsExample(exampleUTM)} language="js" />

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" sx={{ mb: 2, color: theme.palette.warning.dark }}>۵. لینک با تبلیغات</Typography>
          <CodeBlock title="Curl" code={curlExample(exampleAds)} language="bash" />
          <CodeBlock title="Python" code={pythonExample(exampleAds)} language="python" />
        </CardContent>
      </Card>

      {/* بخش محدودیت پلن */}
      <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>⚡ محدودیت‌های پلن</Typography>
          <Divider sx={{ mb: 1 }} />
          <Typography component="span">
  پلن فعلی: <Chip label={user?.plan?.name || "رایگان"} color="primary" />
</Typography>

          <Typography>سقف لینک ماهانه: {user?.plan?.link_limit_per_month || "-"} لینک</Typography>
          <Typography>تاریخ انقضا: {user?.subscription_end_date ? new Date(user.subscription_end_date).toLocaleDateString('fa-IR') : "-"}</Typography>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ open: false, message: "" })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
