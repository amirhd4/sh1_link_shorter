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
  Divider,
  Stack,
  Link,
} from "@mui/material";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import CheckIcon from "@mui/icons-material/Check";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import DomainIcon from "@mui/icons-material/Domain";
import SecurityIcon from "@mui/icons-material/Security";
import ShareIcon from "@mui/icons-material/Share";
import InsightsIcon from "@mui/icons-material/Insights";
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
    label: "cURL (پیش‌فرض)",
    code: `curl -X POST "https://l1s.ir/api/v1/shorten" \\\n  -H "Api-Key: sk_your_api_key_here" \\\n  -H "Content-Type: application/json" \\\n  -d '{"long_url":"https://example.com"}'`,
    response: `{
    "long_url": "https://example.com",
    "short_url": "https://l1s.ir/Ab12Xy"
}`,
  },
  {
    label: "دامنه سفارشی + پارامترهای UTM",
    // در درخواست باید پارامترهای UTM را به صورت جداگانه بفرستید
    code: `curl -X POST "https://l1s.ir/api/v1/shorten" \\\n  -H "Api-Key: sk_your_api_key_here" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "long_url": "https://example.com/project",\n    "domain_id": 42,\n    "utm_source": "twitter",\n    "utm_medium": "social",\n    "utm_campaign": "launch"\n  }'`,
    // مدل خروجی شما فقط شامل long_url و short_url است
    response: `{
    "long_url": "https://example.com/project",
    "short_url": "https://customdomain.com/Xy12Ab"
}`,
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
    a: "بله، در داشبورد می‌توانید نمودارها و آمار دقیق کلیک‌ها را مشاهده کنید از جمله شهر، کشور، Referrer و fingerprint.",
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
        <title>L1s | کوتاه‌کننده لینک سریع، امن و قابل درآمدزایی</title>
        <meta
          name="description"
          content="L1s سرویس کوتاه‌کننده لینک با داشبورد پیشرفته، دامنه اختصاصی، تنظیم UTM، آمار تفصیلی (شهر، کشور، Referrer، fingerprint) و قابلیت کسب درآمد — بدون تبلیغات یا ریدایرکت اجباری."
        />
        <link rel="canonical" href="https://l1s.ir/" />

        {/* Open Graph */}
        <meta property="og:title" content="L1s | کوتاه‌کننده لینک سریع، امن و قابل درآمدزایی" />
        <meta property="og:description" content="داشبورد حرفه‌ای، API سریع، دامنه اختصاصی، تنظیم UTM و آمار کامل برای بازاریابان و توسعه‌دهندگان." />
        <meta property="og:url" content="https://l1s.ir/" />
        <meta property="og:type" content="website" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="L1s | کوتاه‌کننده لینک" />
        <meta name="twitter:description" content="سرویس کوتاه‌کننده لینک مخصوص توسعه‌دهندگان با امکان کسب درآمد و آمار دقیق." />

        {/* Structured Data: FAQ + SoftwareApplication + Breadcrumb */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "L1s",
            url: "https://l1s.ir/",
            description:
              "L1s سرویس کوتاه‌کننده لینک با داشبورد پیشرفته، API امن، دامنه اختصاصی، تنظیم UTM، آمار تفصیلی و امکانات کسب درآمد.",
            applicationCategory: "DeveloperTool",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: 0,
              priceCurrency: "IRR",
              url: "https://l1s.ir/register",
            },
            potentialAction: [
              {
                "@type": "Action",
                name: "ShortenURL",
              },
            ],
            breadcrumb: {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "خانه", item: "https://l1s.ir/" },
              ],
            },
            mainEntity: faqItems.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          })}
        </script>
      </Helmet>

      <GlobalStyles
        styles={{
          body: { background: "#0f172a", color: "#e2e8f0", WebkitFontSmoothing: "antialiased" },
          "::selection": { background: "#a855f7", color: "#fff" },
        }}
      />

      {/* Hero */}
      <Box sx={{ textAlign: "center", py: { xs: 6, md: 10 }, px: 2 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
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
            کوتاه‌کننده لینک نسل بعدی — امن، قابل سفارشی و درآمدزا 🚀
          </Typography>

          <Typography sx={{ maxWidth: 800, mx: "auto", mb: 3, color: "#94a3b8" }}>
            سریع، بدون تبلیغات اجباری، با امکان دامنه اختصاصی، تنظیم UTM، آمار دقیق (شهر/کشور/Referrer) و ابزار کسب درآمد برای سازنده‌ها.
          </Typography>

          <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
            <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              size="large"
              sx={{ borderRadius: "50px", px: 5, background: "linear-gradient(45deg,#a855f7,#d946ef)" }}
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
            <Button
              component={RouterLink}
              to="/pricing"
              variant="text"
              size="large"
              sx={{ color: "#cbd5e1" }}
            >
              پلن‌ها
            </Button>
          </Stack>
        </motion.div>
      </Box>

     {/* Key new features banner – نسخه ارتقا یافته */}
    <Container sx={{ py: { xs: 4, md: 6 }, px: { xs: 2, md: 0 } }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Paper
          component="section"
          aria-label="ویژگی‌های جدید"
          sx={{
            position: "relative",
            overflow: "hidden",
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            background: "rgba(255,255,255,0.05)",
            backgroundImage:
              "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Grid container spacing={2} alignItems="center">
            {/* توضیحات */}
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography
                variant="h6"
                fontWeight={800}
                sx={{ color: "#f1f5f9" }}
              >
                ویژگی‌های برجسته
              </Typography>
              <Typography sx={{ color: "#94a3b8", mt: 0.5, lineHeight: 1.8 }}>
                امکانات جدید: کسب درآمد، دامنه اختصاصی، UTM، بدون ریدایرکت
                اجباری و آمار جغرافیایی.
              </Typography>
            </Grid>

            {/* چپ‌ها */}
            <Grid size={{ xs: 12, md: 9 }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.2}
                alignItems="center"
                justifyContent={{ xs: "flex-start", sm: "flex-end" }}
                flexWrap="wrap"
                sx={{ mt: { xs: 2, md: 0 } }}
              >
                <Chip
                  icon={<MonetizationOnIcon />}
                  label="کسب درآمد"
                  clickable
                  component={Link}
                  href="/pages/monetize"
                  sx={{
                    color: "#fff",
                    background: "linear-gradient(90deg, #a855f7, #d946ef)",
                    fontWeight: 700,
                    "&:hover": {
                      background: "linear-gradient(90deg, #d946ef, #a855f7)",
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                />
                <Chip
                  icon={<DomainIcon />}
                  label="دامنه اختصاصی"
                  clickable
                  component={Link}
                  href="/pages/domains"
                  sx={{
                    color: "#fff",
                    background: "linear-gradient(90deg, #06b6d4, #3b82f6)",
                    fontWeight: 700,
                    "&:hover": {
                      background: "linear-gradient(90deg, #3b82f6, #06b6d4)",
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                />
                <Chip
                  icon={<ShareIcon />}
                  label="بدون ریدایرکت (No-Ads Flow)"
                  clickable
                  component={Link}
                  href="/pages/no-ads"
                  sx={{
                    color: "#fff",
                    background: "linear-gradient(90deg, #f97316, #f59e0b)",
                    fontWeight: 700,
                    "&:hover": {
                      background: "linear-gradient(90deg, #f59e0b, #f97316)",
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                />
                <Chip
                  icon={<InsightsIcon />}
                  label="آمار پیشرفته (شهر/کشور/Referrer)"
                  clickable
                  component={Link}
                  href="/pages/analytics"
                  sx={{
                    color: "#fff",
                    background: "linear-gradient(90deg, #10b981, #14b8a6)",
                    fontWeight: 700,
                    "&:hover": {
                      background: "linear-gradient(90deg, #14b8a6, #10b981)",
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                />
                <Chip
                  icon={<SecurityIcon />}
                  label="امنیت و حریم خصوصی"
                  clickable
                  component={Link}
                  href="/pages/security"
                  sx={{
                    color: "#fff",
                    background: "linear-gradient(90deg, #64748b, #475569)",
                    fontWeight: 700,
                    "&:hover": {
                      background: "linear-gradient(90deg, #475569, #64748b)",
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                />
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>
    </Container>


      {/* Features */}
      <Container sx={{ py: { xs: 6, md: 10 } }}>
        <Typography variant="h4" align="center" fontWeight={800} mb={6}>
          امکانات کلیدی
        </Typography>
        <Grid container spacing={4}>
          {features.map((f, i) => (
            <Grid size={{xs: 12, sm: 6, md: 3}} key={i}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    textAlign: "center",
                    background: "rgba(255,255,255,0.04)",
                    color: "#fff",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    "&:hover": { transform: "translateY(-6px)", transition: "0.25s" },
                  }}
                >
                  <Typography fontSize={34}>{f.icon}</Typography>
                  <Box>
                    <Typography fontWeight={700} mt={1}>
                      {f.title}
                    </Typography>
                    <Typography sx={{ color: "#94a3b8", mt: 1 }}>{f.desc}</Typography>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          ))}

          {/* New detailed feature: Monetization explanation */}
          <Grid size={{xs: 12, md: 6}}>
            <Paper sx={{ p: 3, borderRadius: 3, background: "rgba(255,255,255,0.03)" }}>
              <Typography fontWeight={800} mb={1} sx={{color: "#fff"}}>
                کسب درآمد از لینک‌ها
              </Typography>
              <Typography sx={{ color: "#94a3b8", mb: 2 }}>
                می‌توانید لینک‌ها را به‌صورت درآمدزا فعال کنید. پرداخت‌ها بر اساس پلن‌ها و تنظیمات شما در پنل انجام می‌شود. امکان فعال‌سازی on-click یا pre-roll وجود دارد. (قابل تنظیم برای هر لینک)
              </Typography>
              <Button component={RouterLink} to="/pages/monetize" variant="outlined" size="small">
                جزئیات کسب درآمد
              </Button>
            </Paper>
          </Grid>

          <Grid size={{xs: 12, md: 6}}>
            <Paper sx={{ p: 3, borderRadius: 3, background: "rgba(255,255,255,0.03)" }}>
              <Typography fontWeight={800} mb={1} sx={{color: "#fff"}}>
                عملکرد بدون تبلیغات اجباری (No-Ads Flow)
              </Typography>
              <Typography sx={{ color: "#94a3b8", mb: 2 }}>
                می‌توانید لینک‌هایی بسازید که بدون ریدایرکت تبلیغاتی کاربر را به مقصد هدایت کنند — مناسب زمانی که می‌خواهید مخاطب حس اعتماد بیشتری داشته باشد.
              </Typography>
              <Button component={RouterLink} to="/pages/no-ads" variant="outlined" size="small">
                اطلاعات بیشتر
              </Button>
            </Paper>
          </Grid>
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
              <LineChart data={chartData} aria-label="نمودار آمار هفته">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <ReTooltip contentStyle={{ background: "#1e293b", borderRadius: 8, border: "none" }} />
                <Line type="monotone" dataKey="links" stroke="#a855f7" strokeWidth={3} />
                <Line type="monotone" dataKey="clicks" stroke="#ec4899" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>

            <Divider sx={{ my: 3 }} />

            {/* 🔹 Advanced Analytics Features Section - نسخه ارتقا یافته */}
<Container sx={{ py: { xs: 6, md: 10 } }}>
  <Typography
    variant="h4"
    fontWeight={800}
    align="center"
    mb={5}
    sx={{
      background: "linear-gradient(90deg,#a855f7,#ec4899)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    }}
  >
    آمار و تحلیل پیشرفته
  </Typography>

  <Grid container spacing={4}>
    {/* کارت ۱ */}
    <Grid size={{xs: 12, md: 4}}>
      <motion.div
        whileHover={{ y: -6, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 4,
            height: "100%",
            background:
              "linear-gradient(135deg, rgba(168,85,247,0.08) 0%, rgba(236,72,153,0.08) 100%)",
            border: "1px solid rgba(255,255,255,0.06)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Typography
            variant="h6"
            fontWeight={800}
            sx={{ color: "#f1f5f9", mb: 1.5 }}
          >
            🌍 آمار جغرافیایی
          </Typography>
          <Typography sx={{ color: "#94a3b8", lineHeight: 1.7 }}>
            نمایش شهر، استان و کشور بازدیدکنندگان به‌صورت دقیق و تفکیک‌شده برای
            تحلیل مخاطبان هدف.
          </Typography>
        </Paper>
      </motion.div>
    </Grid>

    {/* کارت ۲ */}
    <Grid size={{xs: 12, md: 4}}>
      <motion.div
        whileHover={{ y: -6, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 4,
            height: "100%",
            background:
              "linear-gradient(135deg, rgba(56,189,248,0.08) 0%, rgba(59,130,246,0.08) 100%)",
            border: "1px solid rgba(255,255,255,0.06)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Typography
            variant="h6"
            fontWeight={800}
            sx={{ color: "#f1f5f9", mb: 1.5 }}
          >
            🔍 Referrer & Fingerprint
          </Typography>
          <Typography sx={{ color: "#94a3b8", lineHeight: 1.7 }}>
            مشاهده‌ی منبع ترافیک (Referrer)، مرورگر، دستگاه، IP و fingerprint برای
            شناسایی رفتار کاربران و تشخیص ترافیک مشکوک.
          </Typography>
        </Paper>
      </motion.div>
    </Grid>

    {/* کارت ۳ */}
    <Grid size={{xs: 12, md: 4}}>
      <motion.div
        whileHover={{ y: -6, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 4,
            height: "100%",
            background:
              "linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(16,185,129,0.08) 100%)",
            border: "1px solid rgba(255,255,255,0.06)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Typography
            variant="h6"
            fontWeight={800}
            sx={{ color: "#f1f5f9", mb: 1.5 }}
          >
            📊 UTM & Campaigns
          </Typography>
          <Typography sx={{ color: "#94a3b8", lineHeight: 1.7 }}>
            امکان ساخت و ردیابی خودکار پارامترهای UTM و فیلتر داده‌ها بر اساس
            کمپین، منبع یا رسانه برای بررسی عملکرد بازاریابی.
          </Typography>
        </Paper>
      </motion.div>
    </Grid>
  </Grid>
</Container>

          </Paper>
        </Container>
      </Box>

      {/* API Examples */}
      {/* 🔹 API Examples - نسخه ارتقایافته و ریسپانسیو‌تر */}
<Container sx={{ py: { xs: 6, md: 10 } }}>
  <Grid
    container
    spacing={6}
    alignItems="stretch"
    justifyContent="center"
    direction={{ xs: "column-reverse", md: "row" }}
  >
    {/* 🔸 سمت راست: توضیحات و نمونه API */}
    <Grid size={{xs: 12, md: 6}}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Typography
          variant="h5"
          fontWeight={900}
          mb={2}
          sx={{
            background: "linear-gradient(90deg,#a855f7,#ec4899)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          API توسعه‌دهندگان
        </Typography>

        <Typography sx={{ color: "#94a3b8", mb: 3, lineHeight: 1.8 }}>
          با استفاده از <strong>API Key</strong> امن، لینک کوتاه بسازید.
          پشتیبانی از دامنه سفارشی، پارامترهای UTM و گزینه‌های <strong>No-Ads</strong> یا <strong>کسب درآمد</strong>.
        </Typography>

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            mb: 2,
            "& .MuiTab-root": {
              color: "#cbd5e1",
              fontWeight: 700,
              fontSize: 14,
              transition: "0.3s",
            },
            "& .Mui-selected": {
              color: "#fff !important",
              borderBottom: "2px solid #a855f7",
            },
          }}
          variant="scrollable"
          scrollButtons="auto"
        >
          {examples.map((ex, i) => (
            <Tab key={i} label={ex.label} />
          ))}
        </Tabs>

        {/* 🔹 کد نمونه */}
        <Paper
          sx={{
            p: 2,
            background: "#1e293b",
            borderRadius: 3,
            position: "relative",
            overflowX: "auto",
            direction: "ltr", // 👈 برای چپ‌به‌راست بودن کد
          }}
        >
          <Box
            component="pre"
            sx={{
              fontSize: 13,
              m: 0,
              color: "#ffffff",
              fontFamily: "monospace",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {examples[tab].code}
          </Box>

          <Tooltip title={copied ? "کپی شد!" : "کپی"}>
            <IconButton
              onClick={() => copyToClipboard(examples[tab].code, setCopied)}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                color: copied ? "#22c55e" : "#cbd5e1",
                transition: "0.3s",
              }}
              aria-label="کپی کد نمونه"
            >
              {copied ? (
                <CheckIcon fontSize="small" />
              ) : (
                <ContentCopyOutlinedIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </Paper>
      </motion.div>
    </Grid>

    {/* 🔸 سمت چپ: نمونه خروجی JSON */}
    <Grid size={{xs: 12, md: 6 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            background: "rgba(255,255,255,0.05)",
            height: "100%",
            border: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Typography
            fontWeight={800}
            mb={1.5}
            sx={{
              color: "#cbd6e8",
              fontSize: 15,
            }}
          >
            نمونه پاسخ JSON
          </Typography>
          <Box
            component="pre"
            sx={{
              fontSize: 13,
              color: "#e2e8f0",
              m: 0,
              p: 1.5,
              background: "#0f172a",
              borderRadius: 2,
              overflowX: "auto",
              direction: "ltr", // 👈 برای راست به چپ نبودن کد
            }}
          >
            {examples[tab].response}
          </Box>
        </Paper>
      </motion.div>
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
          <Accordion key={i} sx={{ background: "rgba(255,255,255,0.03)", color: "#fff", fontWeight: 900, mb: 1, borderRadius: 2 }}>
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
        <Typography sx={{ color: "#94a3b8", mb: 3 }}>ثبت‌نام کنید و اولین لینک کوتاه خود را بسازید — حتی به‌صورت رایگان.</Typography>
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
