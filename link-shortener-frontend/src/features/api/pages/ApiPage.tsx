import { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, Button, Divider, TextField, IconButton, Tooltip } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RefreshIcon from "@mui/icons-material/Refresh";
import { apiService } from "../../../services/apiService"; // سرویس مربوط به API Key
import { useUserStore } from "../../../store/userStore";

export function ApiPage() {
  const { user } = useUserStore();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchKey = async () => {
    setLoading(true);
    try {
      const res = await apiService.getApiKey();
      setApiKey(res.api_key);
    } finally {
      setLoading(false);
    }
  };

  const regenerateKey = async () => {
    setLoading(true);
    try {
      const res = await apiService.regenerateApiKey();
      setApiKey(res.api_key);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKey();
  }, []);

  const copyToClipboard = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto" }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: "#6b21a8" }}>
        مدیریت API Key
      </Typography>

      <Card sx={{ mb: 3, border: "1px solid #ede9fe", borderRadius: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            API Key شما:
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TextField
              size="small"
              fullWidth
              value={apiKey || ""}
              placeholder="هنوز API Key تولید نشده"
              InputProps={{ readOnly: true }}
            />
            <Tooltip title="کپی کردن">
              <IconButton onClick={copyToClipboard}>
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="تولید مجدد کلید">
              <IconButton color="secondary" onClick={regenerateKey} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3, border: "1px solid #ede9fe", borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            📖 مستندات استفاده
          </Typography>

          <Typography variant="body2" sx={{ mb: 1 }}>
            برای استفاده از API در درخواست‌های خود باید هدر <code>Api-Key</code> را ارسال کنید.
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" sx={{ mb: 1 }}>مثال Curl:</Typography>
          <pre style={{ background: "#f3f4f6", padding: "10px", borderRadius: "8px" }}>
{`curl -X POST "https://l1s.ir/api/v1/shorten" \\
-H "Api-Key: ${apiKey || "YOUR_API_KEY"}" \\
-H "Content-Type: application/json" \\
-d '{"long_url": "https://google.com"}'`}
          </pre>

          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>مثال JavaScript (fetch):</Typography>
          <pre style={{ background: "#f3f4f6", padding: "10px", borderRadius: "8px" }}>
{`fetch("https://l1s.ir/api/v1/shorten", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Api-Key": "${apiKey || "YOUR_API_KEY"}"
  },
  body: JSON.stringify({ long_url: "https://google.com" })
})
.then(res => res.json())
.then(console.log);`}
          </pre>

          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>مثال Python (requests):</Typography>
          <pre style={{ background: "#f3f4f6", padding: "10px", borderRadius: "8px" }}>
{`import requests

res = requests.post(
    "https://l1s.ir/api/v1/shorten",
    headers={"Api-Key": "${apiKey || "YOUR_API_KEY"}"},
    json={"long_url": "https://google.com"}
)
print(res.json())`}
          </pre>
        </CardContent>
      </Card>

      <Card sx={{ border: "1px solid #ede9fe", borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1 }}>
            ⚡ محدودیت‌ها
          </Typography>
          <Typography variant="body2">پلن فعلی: {user?.plan?.name || "رایگان"}</Typography>
          <Typography variant="body2">سقف لینک در ماه: {user?.plan?.link_limit_per_month || "-"}</Typography>
          <Typography variant="body2">تاریخ انقضا: {user?.subscription_end_date || "-"}</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
