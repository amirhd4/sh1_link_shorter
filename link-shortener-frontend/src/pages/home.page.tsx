// home.page.tsx
import React from "react";
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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import CheckIcon from "@mui/icons-material/Check";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Link as RouterLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";

/**
 * نسخهٔ پیشرفته و زیباسازی‌شدهٔ صفحه‌ی خانگی.
 * - از Grid item xs/sm/md استفاده شده (مطابق درخواست)
 * - بدون تغییر header/footer پروژه
 * - نیاز به: @mui/material, framer-motion, recharts, react-helmet-async
 */

/* ----------------- Utilities & Small Components ----------------- */

type ChartPoint = { day: string; links: number; clicks: number };

const fauxChartData: ChartPoint[] = [
  { day: "دوشنبه", links: 120, clicks: 450 },
  { day: "سه‌شنبه", links: 200, clicks: 670 },
  { day: "چهارشنبه", links: 180, clicks: 590 },
  { day: "پنج‌شنبه", links: 240, clicks: 720 },
  { day: "جمعه", links: 300, clicks: 910 },
  { day: "شنبه", links: 260, clicks: 800 },
  { day: "یکشنبه", links: 310, clicks: 980 },
];

const features = [
  {
    title: "داشبورد حرفه‌ای",
    desc: "آمار دقیق، نمودارها، فیلترها و صادرات CSV برای هر لینک.",
    icon: "📊",
  },
  {
    title: "API سریع و ایمن",
    desc: "ایجاد لینک با Api-Key، پاسخ JSON استاندارد و خطای یکنواخت.",
    icon: "⚡",
  },
  {
    title: "احراز هویت پیشرفته",
    desc: "JWT، OTP و Turnstile برای فرم‌ها و عملیات حساس.",
    icon: "🔐",
  },
  {
    title: "پلن‌ها و پرداخت",
    desc: "مدیریت اشتراک، وب‌هوک پرداخت و تاریخچهٔ تراکنش‌ها.",
    icon: "💳",
  },
];

const techStack = [
  "FastAPI",
  "React",
  "PostgreSQL",
  "Redis",
  "Docker",
  "MUI",
  "TypeScript",
  "Framer Motion",
];

const codeExamples = [
  {
    label: "cURL",
    code: `curl -X POST "https://l1s.ir/api/v1/shorten" \\
  -H "Api-Key: sk_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"long_url":"https://example.com"}'`,
  },
  {
    label: "fetch",
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
    label: "axios",
    code: `import axios from "axios";

axios.post("https://l1s.ir/api/v1/shorten", {
  long_url: "https://example.com"
}, {
  headers: { "Api-Key": "sk_your_api_key_here" }
}).then(res => console.log(res.data));`,
  },
];

/* Simple animated number (no dependency) */
const useAnimatedNumber = (target: number, duration = 900) => {
  const [value, setValue] = React.useState(0);
  React.useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const loop = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // easeInOutQuad-ish
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
};

/* Sparkline mini-chart component */
const Sparkline: React.FC<{ data: { v: number }[]; color?: string }> = ({ data, color = "#a855f7" }) => {
  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.24} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area dataKey="v" stroke={color} fill="url(#g)" strokeWidth={2} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

/* ----------------- Main Component ----------------- */

const HomePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [tab, setTab] = React.useState(0);
  const [copied, setCopied] = React.useState(false);
  const [demoOpen, setDemoOpen] = React.useState(false);

  // faux KPIs (animated)
  const totalLinks = useAnimatedNumber(124000, 1100);
  const totalClicks = useAnimatedNumber(3400000, 1200);
  const activeUsers = useAnimatedNumber(18000, 1000);
  const uptime = useAnimatedNumber(999, 900); // 99.9 -> we'll format

  const smallSeries = [
    { v: 10 },
    { v: 18 },
    { v: 14 },
    { v: 22 },
    { v: 28 },
    { v: 24 },
    { v: 30 },
  ];

  const copyToClipboard = async (txt: string) => {
    try {
      await navigator.clipboard.writeText(txt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // ignore
    }
  };

  return (
    <>
      <Helmet>
        <title>کوتاه‌کننده لینک L1s — سریع، امن و طراحی‌شده برای توسعه‌دهنده‌ها</title>
        <meta
          name="description"
          content="L1s سرویس کوتاه‌کننده لینک با داشبورد حرفه‌ای، API و آمار زنده — مناسب تیم‌ها و توسعه‌دهندگان."
        />
      </Helmet>

      <GlobalStyles
        styles={{
          body: { background: "#070816", color: "#e6eef8", overflowX: "hidden", WebkitFontSmoothing: "antialiased" },
          "::selection": { background: "#a855f7", color: "#fff" },
        }}
      />

      {/* Aurora decorative blobs */}
      <Box sx={{ position: "relative", overflow: "hidden" }}>
        <Box
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          sx={{
            position: "absolute",
            left: "-10%",
            top: "-20%",
            width: 650,
            height: 650,
            background: "radial-gradient(circle at 30% 30%, rgba(168,85,247,0.18), rgba(236,72,153,0) 40%)",
            filter: "blur(48px)",
            transform: "rotate(15deg)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <Box
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          sx={{
            position: "absolute",
            right: "-8%",
            bottom: "-18%",
            width: 480,
            height: 480,
            background: "radial-gradient(circle at 70% 70%, rgba(99,102,241,0.12), rgba(99,102,241,0) 30%)",
            filter: "blur(36px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2, pt: { xs: 6, md: 10 } }}>
          {/* HERO */}
          <Box sx={{ textAlign: "center", pb: { xs: 4, md: 6 } }}>
            <motion.div initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7 }}>
              <Typography
                component="h1"
                sx={{
                  fontSize: { xs: "2.4rem", md: "3.6rem" },
                  fontWeight: 900,
                  letterSpacing: "-1px",
                  mb: 2,
                  background: "linear-gradient(90deg, #f0abfc, #d946ef)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                کوتاه‌کننده لینک نسل جدید — L1s
              </Typography>

              <Typography sx={{ color: "#9fb0c8", maxWidth: 900, mx: "auto", mb: 3 }}>
                سریع، امن و مخصوص توسعه‌دهندگان. API قدرتمند، داشبورد تحلیلی و تجربهٔ کاربری بی‌نهایت روان.
              </Typography>

              <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
                <Button
                  component={RouterLink}
                  to="/register"
                  size="large"
                  variant="contained"
                  sx={{
                    px: 5,
                    py: 1.6,
                    borderRadius: "999px",
                    fontWeight: 800,
                    boxShadow: "0 12px 30px rgba(168,85,247,0.22)",
                    background: "linear-gradient(90deg,#a855f7,#d946ef)",
                    "&:hover": { transform: "translateY(-3px)", filter: "brightness(1.02)" },
                  }}
                >
                  ثبت‌نام رایگان
                </Button>

                <Button
                  component={RouterLink}
                  to="/pages/docs"
                  variant="outlined"
                  size="large"
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: "999px",
                    color: "#cfe7ff",
                    borderColor: "rgba(255,255,255,0.06)",
                    "&:hover": { background: "rgba(255,255,255,0.02)" },
                  }}
                >
                  مستندات API
                </Button>

                <Button
                  onClick={() => setDemoOpen(true)}
                  variant="text"
                  size="large"
                  startIcon={<InfoOutlinedIcon />}
                  sx={{ color: "#cbd5e1", textTransform: "none" }}
                >
                  مشاهدهٔ دموی سریع
                </Button>
              </Box>

              <Box sx={{ mt: 4, display: "flex", gap: 2, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
                <Chip label="99.9% Uptime" sx={{ background: "rgba(255,255,255,0.03)", color: "#9fb0c8" }} />
                <Chip label="Rate-limit per key" sx={{ background: "rgba(255,255,255,0.03)", color: "#9fb0c8" }} />
                <Chip label="GDPR-ready" sx={{ background: "rgba(255,255,255,0.03)", color: "#9fb0c8" }} />
              </Box>
            </motion.div>
          </Box>

          {/* FEATURES */}
          <Box sx={{ pb: { xs: 6, md: 10 } }}>
            <Grid container spacing={isMobile ? 2 : 4}>
              {features.map((f, idx) => (
                <Grid item xs={12} sm={6} md={3} key={f.title}>
                  <motion.div
                    whileHover={{ translateY: -8 }}
                    transition={{ type: "spring", stiffness: 200, damping: 18 }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        minHeight: 150,
                        position: "relative",
                        overflow: "hidden",
                        background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
                        border: "1px solid rgba(255,255,255,0.03)",
                        boxShadow: "0 10px 30px rgba(2,6,23,0.6)",
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 1 }}>
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "linear-gradient(135deg, rgba(168,85,247,0.12), rgba(236,72,153,0.06))",
                            fontSize: 28,
                          }}
                          aria-hidden
                        >
                          {f.icon}
                        </Box>
                        <Box>
                          <Typography fontWeight={800}>{f.title}</Typography>
                          <Typography sx={{ color: "#94a3b8", fontSize: 13 }}>{f.desc}</Typography>
                        </Box>
                      </Box>

                      <Box sx={{ position: "absolute", right: 12, bottom: 12, left: 12 }}>
                        <Sparkline data={smallSeries} color={idx % 2 === 0 ? "#a855f7" : "#ec4899"} />
                      </Box>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* STATS (KPI) */}
          <Box sx={{ mb: { xs: 4, md: 8 } }}>
            <Typography variant="h5" fontWeight={900} sx={{ mb: 3 }}>
              آمار سرویس
            </Typography>

            <Grid container spacing={3} mb={3}>
              {/* KPIs */}
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 3, borderRadius: 3, background: "#0b1220" }}>
                  <Typography sx={{ fontSize: 13, color: "#93a6bf" }}>کل لینک‌ها</Typography>
                  <Typography sx={{ fontSize: 28, fontWeight: 900, mt: 1 }}>
                    {totalLinks >= 1000 ? `${Math.floor(totalLinks / 1000)}K+` : totalLinks}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Sparkline data={smallSeries} color="#a855f7" />
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 3, borderRadius: 3, background: "#0b1220" }}>
                  <Typography sx={{ fontSize: 13, color: "#93a6bf" }}>کلیک‌ها</Typography>
                  <Typography sx={{ fontSize: 28, fontWeight: 900, mt: 1 }}>
                    {totalClicks >= 1000000 ? `${Math.floor(totalClicks / 1000000)}M+` : totalClicks}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Sparkline data={smallSeries} color="#ec4899" />
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 3, borderRadius: 3, background: "#0b1220" }}>
                  <Typography sx={{ fontSize: 13, color: "#93a6bf" }}>کاربران فعال</Typography>
                  <Typography sx={{ fontSize: 28, fontWeight: 900, mt: 1 }}>{activeUsers >= 1000 ? `${Math.floor(activeUsers / 1000)}K+` : activeUsers}</Typography>
                  <Box sx={{ mt: 2 }}>
                    <Sparkline data={smallSeries} color="#22c55e" />
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 3, borderRadius: 3, background: "#0b1220" }}>
                  <Typography sx={{ fontSize: 13, color: "#93a6bf" }}>Uptime</Typography>
                  <Typography sx={{ fontSize: 28, fontWeight: 900, mt: 1 }}>{(uptime / 10).toFixed(1)}%</Typography>
                  <Box sx={{ mt: 2 }}>
                    <Sparkline data={smallSeries} color="#60a5fa" />
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            {/* Big Chart */}
            <Paper sx={{ p: 3, borderRadius: 3, background: "#071427" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Box>
                  <Typography fontWeight={800}>روند هفتگی</Typography>
                  <Typography sx={{ color: "#93a6bf", fontSize: 13 }}>مقایسهٔ لینک‌ها و کلیک‌ها در هفتهٔ اخیر</Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Chip label="Links" size="small" sx={{ background: "rgba(168,85,247,0.12)", color: "#d6bbff" }} />
                  <Chip label="Clicks" size="small" sx={{ background: "rgba(236,72,153,0.08)", color: "#ffd5e6" }} />
                </Box>
              </Box>

              <Box sx={{ width: "100%", height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={fauxChartData} margin={{ top: 10, right: 18, left: 8, bottom: 8 }}>
                    <CartesianGrid stroke="#0e1a2a" vertical={false} strokeDasharray="4 4" />
                    <XAxis dataKey="day" stroke="#7f95a8" />
                    <YAxis stroke="#7f95a8" />
                    <ReTooltip wrapperStyle={{ borderRadius: 8, border: "none", background: "#0b1220" }} />
                    <Line type="monotone" dataKey="links" stroke="#a855f7" strokeWidth={3} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="clicks" stroke="#ec4899" strokeWidth={3} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Box>

          {/* API Examples */}
          <Box sx={{ py: { xs: 4, md: 6 } }}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="h6" fontWeight={900} mb={1}>
                  API برای توسعه‌دهندگان
                </Typography>
                <Typography sx={{ color: "#93a6bf", mb: 2 }}>
                  با Api-Key امن ایجاد لینک کنید. نمونه‌درخواست‌ها را ببینید و آن‌ها را سریع copy کنید.
                </Typography>

                <Tabs
                  value={tab}
                  onChange={(_, v) => setTab(v)}
                  textColor="primary"
                  indicatorColor="primary"
                  sx={{ mb: 2 }}
                >
                  {codeExamples.map((c) => (
                    <Tab key={c.label} label={c.label} />
                  ))}
                </Tabs>

                <Paper sx={{ p: 2, position: "relative", background: "#071427", borderRadius: 2 }}>
                  <Box component="pre" sx={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, monospace", fontSize: 13, color: "#dbeafe", m: 0, whiteSpace: "pre-wrap" }}>
                    {codeExamples[tab].code}
                  </Box>

                  <Tooltip title={copied ? "کپی شد" : "کپی کن"}>
                    <IconButton
                      aria-label="copy example"
                      onClick={() => copyToClipboard(codeExamples[tab].code)}
                      sx={{ position: "absolute", right: 8, top: 8, color: copied ? "#22c55e" : "#cbd5e1" }}
                    >
                      {copied ? <CheckIcon fontSize="small" /> : <ContentCopyOutlinedIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                </Paper>

                <Typography sx={{ color: "#93a6bf", fontSize: 13, mt: 2 }}>
                  نکتهٔ امنیتی: Api-Key را تنها در سرور نگهدارید و هرگز در کد کلاینت منتشر نکنید.
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, borderRadius: 3, background: "linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.005))" }}>
                  <Typography fontWeight={800} mb={2}>
                    نمونهٔ پاسخ
                  </Typography>
                  <Box component="pre" sx={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, monospace", m: 0, color: "#e6eef8", fontSize: 13 }}>
{`{
  "long_url": "https://example.com",
  "short_url": "https://l1s.ir/Ab12Xy",
  "created_at": "2025-09-01T12:34:56Z",
  "owner_id": 12345
}`}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          {/* Tech Stack + CTA */}
          <Grid container spacing={4} alignItems="center" sx={{ mt: { xs: 4, md: 8 }, mb: { xs: 6, md: 12 } }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" fontWeight={900} mb={2}>
                تکنولوژی‌هایی که دوست داریم
              </Typography>
              <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                {techStack.map((t) => (
                  <Paper key={t} sx={{ px: 2, py: 0.6, borderRadius: 2, background: "rgba(255,255,255,0.02)", color: "#dbeafe" }}>
                    {t}
                  </Paper>
                ))}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 3, background: "#071427" }}>
                <Typography fontWeight={900} mb={1}>
                  آماده‌اید لینک‌ها را کوتاه کنید؟
                </Typography>
                <Typography sx={{ color: "#93a6bf", mb: 2 }}>همین حالا ثبت‌نام کنید و Api-Key خود را دریافت کنید — ادغام ساده با اپ یا سرور شما.</Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button component={RouterLink} to="/register" variant="contained" sx={{ background: "linear-gradient(90deg,#a855f7,#d946ef)", px: 4 }}>
                    ثبت‌نام و دریافت Api-Key
                  </Button>
                  <Button component={RouterLink} to="/pages/docs" variant="outlined" sx={{ color: "#cbd5e1" }}>
                    خواندن مستندات
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Demo Dialog (fake demo) */}
      <Dialog open={demoOpen} onClose={() => setDemoOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>دموی سریع API</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "#64748b", mb: 2 }}>
            این دموی سریع خروجی نمونه را نشان می‌دهد — برای تست واقعی از Api-Key خود در سرور استفاده کنید.
          </Typography>
          <Paper sx={{ p: 2, background: "#071427", borderRadius: 2 }}>
            <Box component="pre" sx={{ m: 0, color: "#e6eef8", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, monospace" }}>
{`{
  "long_url": "https://example.com",
  "short_url": "https://l1s.ir/Ab12Xy",
  "analytics": {
    "clicks": 23,
    "last_24h": 8
  }
}`}
            </Box>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDemoOpen(false)} color="inherit">بستن</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default HomePage;
