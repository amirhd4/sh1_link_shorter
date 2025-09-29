import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Paper,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  SvgIcon,
  useTheme,
  useMediaQuery,
  GlobalStyles,
} from '@mui/material';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import CheckIcon from '@mui/icons-material/Check';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as ReTooltip, CartesianGrid } from 'recharts';

// --- Custom icons ---
const ApiIcon = (props: React.ComponentProps<typeof SvgIcon>) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path d="M4 7H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 4V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 4V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="3" y="12" width="18" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/>
  </SvgIcon>
);

// --- Data ---
const features = [
  { title: 'داشبورد حرفه‌ای', desc: 'ایجاد، ویرایش و مشاهده آمار هر لینک با نمودارهای زنده.', icon: '📊' },
  { title: 'API سریع و امن', desc: 'کوتاه‌سازی لینک با Api-Key اختصاصی برای توسعه‌دهندگان.', icon: '⚡' },
  { title: 'احراز هویت پیشرفته', desc: 'پشتیبانی از JWT، OTP و Turnstile.', icon: '🔐' },
  { title: 'پلن‌ها و پرداخت', desc: 'مدیریت اشتراک و تاریخچه تراکنش‌ها.', icon: '💳' },
];

const techStack = ['FastAPI', 'React', 'PostgreSQL', 'Redis', 'Docker', 'MUI', 'TypeScript', 'Framer Motion'];

// Fake stats
const stats = [
  { label: 'کل لینک‌ها', value: '124K+' },
  { label: 'کلیک‌ها', value: '3.4M+' },
  { label: 'کاربران فعال', value: '18K+' },
  { label: 'درصد Uptime', value: '99.9%' },
];

// Fake chart data
const chartData = [
  { day: 'دوشنبه', links: 120, clicks: 450 },
  { day: 'سه‌شنبه', links: 200, clicks: 670 },
  { day: 'چهارشنبه', links: 180, clicks: 590 },
  { day: 'پنج‌شنبه', links: 240, clicks: 720 },
  { day: 'جمعه', links: 300, clicks: 910 },
  { day: 'شنبه', links: 260, clicks: 800 },
  { day: 'یکشنبه', links: 310, clicks: 980 },
];

// --- Helpers ---
async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// --- Main Page ---
export const HomePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // API Tabs
  const [tab, setTab] = React.useState(0);
  const [copied, setCopied] = React.useState(false);

  const examples = [
    {
      label: 'cURL',
      code: `curl -X POST "https://l1s.ir/api/v1/shorten" \\
  -H "Api-Key: sk_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"long_url":"https://example.com"}'`,
    },
    {
      label: 'fetch',
      code: `fetch("https://l1s.ir/api/v1/shorten", {
  method: "POST",
  headers: {
    "Api-Key": "sk_your_api_key_here",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ long_url: "https://example.com" })
})`,
    },
    {
      label: 'axios',
      code: `import axios from "axios";

axios.post("https://l1s.ir/api/v1/shorten", {
  long_url: "https://example.com"
}, {
  headers: { "Api-Key": "sk_your_api_key_here" }
}).then(res => console.log(res.data));`,
    },
  ];

  return (
    <>
      <Helmet>
        <title>L1s | کوتاه‌کننده لینک سریع و امن</title>
        <meta name="description" content="L1s یک سرویس کوتاه‌کننده لینک با API عمومی، داشبورد پیشرفته و آمار کامل برای تیم‌ها و توسعه‌دهندگان." />
      </Helmet>

      <GlobalStyles styles={{
        body: { background: '#0f172a', color: '#e2e8f0' },
        '::selection': { background: '#a855f7', color: '#fff' },
      }}/>

      {/* Hero */}
      <Box sx={{ textAlign: 'center', py: { xs: 8, md: 12 } }}>
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <Typography variant="h2" sx={{
            fontWeight: 800,
            background: 'linear-gradient(90deg,#f0abfc,#d8b4fe)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
          }}>
            کوتاه‌کننده لینک نسل جدید 🚀
          </Typography>
          <Typography sx={{ maxWidth: 600, mx: 'auto', color: '#94a3b8', mb: 4 }}>
            سریع، امن و مخصوص توسعه‌دهندگان — با داشبورد پیشرفته و API کامل.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button component={RouterLink} to="/register" variant="contained" size="large"
              sx={{ borderRadius: '50px', px: 5, background: 'linear-gradient(45deg,#a855f7,#d946ef)' }}>
              شروع رایگان
            </Button>
            <Button component={RouterLink} to="/pages/docs" variant="outlined" size="large"
              sx={{ borderRadius: '50px', px: 5, color: '#cbd5e1', borderColor: '#475569' }}>
              مستندات API
            </Button>
          </Box>
        </motion.div>
      </Box>

      {/* Features */}
      <Container sx={{ py: { xs: 6, md: 10 } }}>
        <Typography variant="h4" align="center" fontWeight={700} mb={6}>
          همه‌چیز برای مدیریت لینک
        </Typography>
        <Grid container spacing={isMobile ? 2 : 4}>
          {features.map((f, i) => (
            <Grid size={{xs: 12, sm: 6, md: 3}} key={i}>
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.6 }}>
                <Paper sx={{
                  p: 3,
                  borderRadius: 3,
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.04)',
                  '&:hover': { transform: 'translateY(-6px)', transition: '0.3s' },
                }}>
                  <Typography fontSize={32}>{f.icon}</Typography>
                  <Typography fontWeight={700} mt={1}>{f.title}</Typography>
                  <Typography sx={{ color: '#94a3b8', mt: 1 }}>{f.desc}</Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Stats + Chart */}
      <Box sx={{ py: { xs: 6, md: 10 }, background: 'rgba(255,255,255,0.02)' }}>
        <Container>
          <Typography variant="h4" align="center" fontWeight={700} mb={6}>
            آمار کلی سرویس
          </Typography>
          <Grid container spacing={4} mb={6}>
            {stats.map((s, i) => (
              <Grid size={{xs: 12, sm: 6, md: 3}} key={i}>
                <Paper sx={{
                  p: 3, textAlign: 'center', borderRadius: 3, background: '#1e293b',
                }}>
                  <Typography variant="h5" fontWeight={800}>{s.value}</Typography>
                  <Typography sx={{ color: '#94a3b8' }}>{s.label}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Paper sx={{ p: 3, borderRadius: 3, background: '#0f172a' }}>
            <Typography fontWeight={700} mb={2}>روند هفتگی</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <ReTooltip contentStyle={{ background: '#1e293b', borderRadius: 8, border: 'none' }} />
                <Line type="monotone" dataKey="links" stroke="#a855f7" strokeWidth={2} />
                <Line type="monotone" dataKey="clicks" stroke="#ec4899" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Container>
      </Box>

      {/* API Showcase */}
      <Container sx={{ py: { xs: 6, md: 10 } }}>
        <Grid container spacing={6} alignItems="center">
          <Grid size={{xs: 12, md: 6}}>
            <Typography variant="h5" fontWeight={800} mb={2}>API توسعه‌دهندگان</Typography>
            <Typography sx={{ color: '#94a3b8', mb: 3 }}>
              با Api-Key امن لینک کوتاه بسازید. پاسخ JSON استاندارد و محدودیت Rate-limit.
            </Typography>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
              {examples.map((ex, i) => <Tab key={i} label={ex.label} />)}
            </Tabs>
            <Paper sx={{ p: 2, background: '#1e293b', borderRadius: 2, position: 'relative' }}>
              <Box component="pre" sx={{ whiteSpace: 'pre-wrap', fontSize: 13, m: 0 }}>
                {examples[tab].code}
              </Box>
              <Tooltip title={copied ? 'Copied!' : 'Copy'}>
                <IconButton
                  onClick={async () => {
                    const ok = await copyToClipboard(examples[tab].code);
                    setCopied(ok);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  sx={{ position: 'absolute', top: 8, right: 8, color: copied ? '#22c55e' : '#cbd5e1' }}
                >
                  {copied ? <CheckIcon fontSize="small" /> : <ContentCopyOutlinedIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            </Paper>
            <Typography mt={2} fontSize={13} color="#94a3b8">
              نکته: Api-Key را هرگز در سمت کاربر (JS) نگه ندارید.
            </Typography>
          </Grid>

          <Grid size={{xs: 12, md: 6}}>
            <Paper sx={{ p: 3, borderRadius: 3, background: 'rgba(255,255,255,0.04)' }}>
              <Typography fontWeight={700} mb={1}>نمونه پاسخ JSON</Typography>
              <Box component="pre" sx={{ whiteSpace: 'pre-wrap', fontSize: 13, color: '#e2e8f0' }}>
{`{
  "long_url": "https://example.com",
  "short_url": "https://l1s.ir/Ab12Xy"
}`}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Tech Stack */}
      <Box sx={{ py: { xs: 6, md: 10 }, textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
        <Typography variant="h5" fontWeight={800} mb={3}>تکنولوژی‌ها</Typography>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'center' }}>
          {techStack.map(t => (
            <Paper key={t} sx={{ px: 2, py: 1, borderRadius: 2, color: '#cbd5e1', background: '#1e293b' }}>
              {t}
            </Paper>
          ))}
        </Box>
      </Box>

      {/* CTA */}
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" fontWeight={700} mb={1}>آماده شروع هستید؟</Typography>
        <Typography sx={{ color: '#94a3b8', mb: 3 }}>ثبت‌نام کنید و اولین لینک کوتاه خود را بسازید.</Typography>
        <Button component={RouterLink} to="/register" variant="contained" size="large"
          sx={{ borderRadius: 3, px: 5, background: 'linear-gradient(90deg,#a855f7,#d946ef)' }}>
          ثبت‌نام رایگان
        </Button>
      </Box>
    </>
  );
};

export default HomePage;
