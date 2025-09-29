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
  Chip,
  GlobalStyles,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import CheckIcon from "@mui/icons-material/Check";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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
} from "recharts";

/* ---------------- Data ---------------- */
const chartData = [
  { day: "دوشنبه", links: 120, clicks: 450 },
  { day: "سه‌شنبه", links: 200, clicks: 670 },
  { day: "چهارشنبه", links: 180, clicks: 590 },
  { day: "پنج‌شنبه", links: 240, clicks: 720 },
  { day: "جمعه", links: 300, clicks: 910 },
  { day: "شنبه", links: 260, clicks: 800 },
  { day: "یکشنبه", links: 310, clicks: 980 },
];

const features = [
  { title: "داشبورد پیشرفته", desc: "آمار کامل و نمودارهای زنده برای هر لینک.", icon: "📊" },
  { title: "API سریع و ایمن", desc: "ساخت لینک با Api-Key و پاسخ JSON استاندارد.", icon: "⚡" },
  { title: "احراز هویت چندلایه", desc: "JWT، OTP و کپچا برای امنیت بیشتر.", icon: "🔐" },
  { title: "پلن‌ها و پرداخت", desc: "مدیریت اشتراک و تراکنش‌ها با یک کلیک.", icon: "💳" },
];

const techStack = ["FastAPI", "React", "PostgreSQL", "Redis", "Docker", "MUI", "TypeScript", "Framer Motion"];

const examples = [
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

/* ---------------- FAQ ---------------- */
const faqItems = [
  {
    q: "آیا استفاده از L1s رایگان است؟",
    a: "بله! شما می‌توانید به صورت رایگان ثبت‌نام کنید و لینک کوتاه بسازید. پلن‌های حرفه‌ای برای امکانات بیشتر موجود هستند.",
  },
  {
    q: "آیا API محدودیت دارد؟",
    a: "بله، هر Api-Key دارای محدودیت درخواست (Rate Limit) مشخص است تا از سوءاستفاده جلوگیری شود.",
  },
  {
    q: "آیا لینک‌های کوتاه تاریخ انقضا دارند؟",
    a: "خیر، لینک‌های کوتاه به صورت دائمی فعال هستند مگر اینکه توسط کاربر حذف شوند.",
  },
  {
    q: "آیا می‌توانم آمار کلیک‌ها را ببینم؟",
    a: "بله، در داشبورد می‌توانید نمودارها و آمار دقیق کلیک‌ها را مشاهده کنید.",
  },
];

/* ---------------- Helpers ---------------- */
const copyToClipboard = async (txt: string, setCopied: React.Dispatch<React.SetStateAction<boolean>>) => {
  try {
    await navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  } catch {
    // ignore
  }
};

/* ---------------- Component ---------------- */
export const HomePage: React.FC = () => {
  const [tab, setTab] = React.useState(0);
  const [copied, setCopied] = React.useState(false);

  return (
    <>
      <Helmet>
        <title>L1s | کوتاه‌کننده لینک سریع و امن</title>
        <meta
          name="description"
          content="L1s یک سرویس کوتاه‌کننده لینک حرفه‌ای با داشبورد پیشرفته، API عمومی و آمار دقیق برای تیم‌ها و توسعه‌دهندگان است."
        />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqItems.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: {
                "@type": "Answer",
                text: f.a,
              },
            })),
          })}
        </script>
      </Helmet>

      <GlobalStyles
        styles={{
          body: { background: "#0f172a", color: "#e2e8f0" },
          "::selection": { background: "#a855f7", color: "#fff" },
        }}
      />

      {/* Hero */}
      <Box sx={{ textAlign: "center", py: { xs: 8, md: 12 } }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              background: "linear-gradient(90deg,#f0abfc,#d946ef)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 2,
            }}
          >
            کوتاه‌کننده لینک نسل جدید 🚀
          </Typography>
          <Typography sx={{ maxWidth: 640, mx: "auto", mb: 4, color: "#94a3b8" }}>
            سریع، امن و مخصوص توسعه‌دهندگان — با داشبورد حرفه‌ای و API کامل.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              size="large"
              sx={{
                borderRadius: "50px",
                px: 5,
                background: "linear-gradient(45deg,#a855f7,#d946ef)",
              }}
            >
              شروع رایگان
            </Button>
            <Button
              component={RouterLink}
              to="/pages/docs"
              variant="outlined"
              size="large"
              sx={{ borderRadius: "50px", px: 5, color: "#cbd5e1", borderColor: "#475569" }}
            >
              مستندات API
            </Button>
          </Box>
        </motion.div>
      </Box>

      {/* Features */}
      <Container sx={{ py: { xs: 6, md: 10 } }}>
        <Typography variant="h4" align="center" fontWeight={800} mb={6}>
          امکانات کلیدی
        </Typography>
        <Grid container spacing={4}>
          {features.map((f, i) => (
            <Grid size={{xs: 12, sm:6, md: 3}} key={i}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
              >
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    textAlign: "center",
                    background: "rgba(255,255,255,0.04)",
                    color: "#fff",
                    "&:hover": { transform: "translateY(-6px)", transition: "0.3s" },
                  }}
                >
                  <Typography fontSize={34}>{f.icon}</Typography>
                  <Typography fontWeight={700} mt={1}>
                    {f.title}
                  </Typography>
                  <Typography sx={{ color: "#94a3b8", mt: 1 }}>{f.desc}</Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Stats */}
      <Box sx={{ py: { xs: 6, md: 10 }, background: "rgba(255,255,255,0.02)" }}>
        <Container>
          <Typography variant="h4" align="center" fontWeight={800} mb={6}>
            آمار کلی سرویس
          </Typography>
          <Paper sx={{ p: 3, borderRadius: 3, background: "#0f172a" }}>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <ReTooltip contentStyle={{ background: "#1e293b", borderRadius: 8, border: "none" }} />
                <Line type="monotone" dataKey="links" stroke="#a855f7" strokeWidth={3} />
                <Line type="monotone" dataKey="clicks" stroke="#ec4899" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Container>
      </Box>

      {/* API Examples */}
      <Container sx={{ py: { xs: 6, md: 10 } }}>
        <Grid container spacing={6} alignItems="center">
          <Grid size={{xs: 12, md: 6}}>
            <Typography variant="h5" fontWeight={800} mb={2}>
              API توسعه‌دهندگان
            </Typography>
            <Typography sx={{ color: "#94a3b8", mb: 3 }}>
              با Api-Key امن لینک کوتاه بسازید. پاسخ JSON استاندارد و محدودیت Rate-limit.
            </Typography>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
              {examples.map((ex, i) => (
                <Tab key={i} label={ex.label} sx={{ mb: 2, color: "#ffffff" }}/>
              ))}
            </Tabs>
            <Paper sx={{ p: 2, background: "#1e293b", borderRadius: 2, position: "relative" }}>
              <Box component="pre" sx={{ fontSize: 13, m: 0, color: "#ffffff" }}>
                {examples[tab].code}
              </Box>
              <Tooltip title={copied ? "کپی شد!" : "کپی"}>
                <IconButton
                  onClick={() => copyToClipboard(examples[tab].code, setCopied)}
                  sx={{ position: "absolute", top: 8, right: 8, color: copied ? "#22c55e" : "#cbd5e1" }}
                >
                  {copied ? <CheckIcon fontSize="small" /> : <ContentCopyOutlinedIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            </Paper>
          </Grid>

          <Grid size={{xs: 12, md: 6}}>
            <Paper sx={{ p: 3, borderRadius: 3, background: "rgba(255,255,255,0.04)" }}>
              <Typography fontWeight={700} mb={1} sx={{ color: "#cbd6e8", fontWeight: 800}}>
                نمونه پاسخ JSON
              </Typography>
              <Box component="pre" sx={{ fontSize: 13, color: "#e2e8f0", m: 0 }}>
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
      <Box sx={{ py: { xs: 6, md: 10 }, textAlign: "center", background: "rgba(255,255,255,0.02)" }}>
        <Typography variant="h5" fontWeight={800} mb={3}>
          تکنولوژی‌ها
        </Typography>
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", justifyContent: "center" }}>
          {techStack.map((t) => (
            <Paper key={t} sx={{ px: 2, py: 1, borderRadius: 2, color: "#cbd5e1", background: "#1e293b" }}>
              {t}
            </Paper>
          ))}
        </Box>
      </Box>

      {/* FAQ */}
      <Container sx={{ py: { xs: 6, md: 10 } }}>
        <Typography variant="h4" align="center" fontWeight={800} mb={6}>
          سوالات متداول
        </Typography>
        {faqItems.map((f, i) => (
          <Accordion key={i} sx={{ background: "rgba(255,255,255,0.03)", color: "#fff", fontWeight:900, mb: 1, borderRadius: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "#cbcbd1" }} />}>
              <Typography fontWeight={700}>{f.q}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography sx={{ color: "#d7dbe8" }}>{f.a}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Container>

      {/* CTA */}
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="h5" fontWeight={800} mb={1}>
          آماده شروع هستید؟
        </Typography>
        <Typography sx={{ color: "#94a3b8", mb: 3 }}>ثبت‌نام کنید و اولین لینک کوتاه خود را بسازید.</Typography>
        <Button
          component={RouterLink}
          to="/register"
          variant="contained"
          size="large"
          sx={{ borderRadius: 3, px: 5, background: "linear-gradient(90deg,#a855f7,#d946ef)" }}
        >
          ثبت‌نام رایگان
        </Button>
      </Box>
    </>
  );
};

export default HomePage;
