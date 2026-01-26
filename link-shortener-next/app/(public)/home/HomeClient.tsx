"use client";

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
  Link as MuLink,
} from "@mui/material";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import CheckIcon from "@mui/icons-material/Check";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import DomainIcon from "@mui/icons-material/Domain";
import SecurityIcon from "@mui/icons-material/Security";
import ShareIcon from "@mui/icons-material/Share";
import InsightsIcon from "@mui/icons-material/Insights";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  CartesianGrid,
} from "recharts";
import HomeLinkShortener from "@/components/home/HomeLinkShortener";
import Image from "next/image";


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

const techStack = ["FastAPI", "React", "PostgreSQL", "Redis", "Docker", "MUI", "TypeScript", "Framer Motion", "Next.js"];

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
    code: `curl -X POST "https://l1s.ir/api/v1/shorten" \\\n  -H "Api-Key: sk_your_api_key_here" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "long_url": "https://example.com/project",\n    "domain_id": 42,\n    "utm_source": "twitter",\n    "utm_medium": "social",\n    "utm_campaign": "launch"\n  }'`,
    response: `{
    "long_url": "https://example.com/project",
    "short_url": "https://customdomain.com/Xy12Ab"
}`,
  },
  // 🔹 این رو اضافه کن
  {
    label: "لینک محافظت‌شده با پسورد 🔒",
    code: `curl -X POST "https://l1s.ir/api/v1/shorten" \\\n  -H "Api-Key: sk_your_api_key_here" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "long_url": "https://example.com/secret",\n    "password": "mypassword123"\n  }'`,
    response: `{
    "long_url": "https://example.com/secret",
    "short_url": "https://l1s.ir/SeCrEt1"
}`,
  },
];

/* ---------------- FAQ ---------------- */
const faqItems = [
  {
    q: "آیا استفاده از لِس (L1s) به عنوان کوتاه‌کننده لینک رایگان است؟",
    a: "بله، استفاده از L1s کاملاً رایگان است. شما می‌توانید بدون هیچ هزینه‌ای ثبت‌نام کنید و لینک‌های خود را به راحتی کوتاه کنید. در کنار پلن رایگان، پلن‌های حرفه‌ای نیز برای کاربران پرمصرف و برندها ارائه شده‌اند که امکاناتی مثل دامنه سفارشی، رمزگذاری لینک، و آمار تحلیلی پیشرفته را شامل می‌شوند.",
  },
  {
    q: "آیا API کوتاه‌کننده لینک لِس (L1s) محدودیت دارد؟",
    a: "بله، برای هر کاربر یک Api-Key اختصاصی صادر می‌شود که دارای محدودیت درخواست در دقیقه (Rate Limit) است تا از سوء‌استفاده جلوگیری شود. در پلن‌های بالاتر، محدودیت‌ها بیشتر شده و امکان استفاده حرفه‌ای از API برای اتوماسیون، ربات‌ها و وب‌سرویس‌ها فراهم است.",
  },
  {
    q: "آیا لینک‌های کوتاه ساخته‌شده در لِس (L1s) تاریخ انقضا دارند؟",
    a: "خیر، لینک‌های کوتاه به صورت دائمی فعال می‌مانند مگر این‌که توسط کاربر حذف یا غیرفعال شوند. همچنین می‌توانید برای هر لینک، در صورت نیاز، زمان انقضا تعیین کنید تا پس از تاریخ مشخصی دیگر فعال نباشد.",
  },
  {
    q: "آیا می‌توانم آمار دقیق کلیک‌های هر لینک را مشاهده کنم؟",
    a: "بله، لِس (l1s) یک داشبورد تحلیلی کامل دارد که اطلاعات دقیق هر لینک را نشان می‌دهد؛ از جمله تعداد کلیک‌ها، موقعیت جغرافیایی کاربران (شهر و کشور)، دستگاه و مرورگر، Referrer، و حتی اثرانگشت (Fingerprint) کاربران. این ابزار به شما کمک می‌کند تا رفتار مخاطبان خود را بهتر تحلیل کنید.",
  },
  {
    q: "آیا امکان ساخت لینک با رمز یا دسترسی خصوصی وجود دارد؟",
    a: "بله، شما می‌توانید هنگام ایجاد لینک، یک رمز عبور تعریف کنید تا فقط افرادی که آن را دارند بتوانند به مقصد دسترسی پیدا کنند. این قابلیت برای لینک‌های خصوصی، محتوای آموزشی پولی یا فایل‌های مهم بسیار کاربردی است.",
  },
  {
    q: "آیا می‌توان از طریق لینک‌ها در لِس (l1s) کسب درآمد کرد؟",
    a: "بله، سیستم لِس (l1s) قابلیت نمایش تبلیغات بین مسیر را دارد. کاربران می‌توانند هنگام ساخت لینک، گزینه «نمایش تبلیغ» را فعال کنند تا از بازدید لینک‌هایشان درآمد کسب کنند. اگر این گزینه غیرفعال باشد، لینک مستقیماً کاربر را به مقصد هدایت می‌کند.",
  },
  {
    q: "آیا لِس (l1s) از دامنه سفارشی پشتیبانی می‌کند؟",
    a: "بله، شما می‌توانید دامنه اختصاصی خودتان را به حساب کاربری متصل کنید تا لینک‌های کوتاه‌تان با نام برند خودتان ساخته شوند. این ویژگی برای شرکت‌ها، کسب‌وکارهای محتوامحور و برندهای شخصی بسیار مفید است.",
  },
  {
    q: "امنیت لینک‌های کوتاه در لِس (l1s) چگونه تضمین می‌شود؟",
    a: "تمام لینک‌ها قبل از کوتاه شدن با سیستم هوشمند بررسی می‌شوند تا از سالم بودن و غیر‌مخرب بودن آن‌ها اطمینان حاصل شود. همچنین داده‌ها با رمزگذاری امن نگهداری می‌شوند و شما می‌توانید با تنظیم رمز یا محدودیت زمانی، امنیت بیشتری برای لینک‌های خود ایجاد کنید.",
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
const HomeClient: React.FC = () => {
  const [tab, setTab] = React.useState(0);
  const [copied, setCopied] = React.useState(false);

  return (
    <>
      <GlobalStyles
        styles={{
          body: { background: "#0f172a", color: "#e2e8f0", WebkitFontSmoothing: "antialiased" },
          "::selection": { background: "#a855f7", color: "#fff" },
        }}
      />

      {/* Hero */}
      <Box sx={{ textAlign: "center", py: { xs: 6, md: 10 }, px: 2 }}>
          <Image
  src="/images/hero-dashboard.webp"
  alt="کوتاه‌کننده لینک لس - l1s با داشبورد تحلیلی و قابلیت کسب درآمد"
  width={1200}
  height={630}
  priority
/>
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
            کوتاه‌کننده لینک لِس، نسل بعدی — امن، قابل سفارشی و درآمدزا 🚀
          </Typography>

          <Typography sx={{ maxWidth: 800, mx: "auto", mb: 3, color: "#94a3b8" }}>
            سریع، بدون تبلیغات اجباری، با امکان دامنه اختصاصی، تنظیم UTM، آمار دقیق (شهر/کشور/Referrer) و ابزار کسب درآمد برای سازنده‌ها.
          </Typography>

          <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
            <Button
              component={Link}
              href="/register"
              variant="contained"
              size="large"
              sx={{ borderRadius: "50px", px: 5, background: "linear-gradient(45deg,#a855f7,#d946ef)" }}
            >
              شروع رایگان
            </Button>
            <Button
              component={Link}
              href="/url-shortener"
              variant="outlined"
              size="large"
              sx={{ borderRadius: "50px", px: 5, color: "#cbd5e1", borderColor: "#475569" }}
            >
              مستندات API
            </Button>
            <Button
              component={Link}
              href="/plans"
              variant="text"
              size="large"
              sx={{ color: "#cbd5e1" }}
            >
              پلن‌ها
            </Button>
          </Stack>
        </motion.div>
      </Box>

        <Box
  sx={{
    mt: 4,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 3,
  }}
>
  <HomeLinkShortener />

  <Image
    src="/images/link-shortener-example.webp"
    alt="تبدیل لینک بلند به لینک کوتاه در l1s"
    width={900}
    height={450}
    loading="lazy"
    style={{ borderRadius: 12 }}
  />
</Box>



{/* SEO Optimized Content Section */}
<section
  style={{
    marginTop: "5rem",
    padding: "0 1rem",
    maxWidth: "64rem",
    marginInline: "auto",
    color: "#e2e8f0",
    lineHeight: "2",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  }}
>
  <h1 style={{ fontSize: "2.25rem", fontWeight: "bold", marginBottom: "2rem", color: "#fff" }}>
    بهترین کوتاه‌کننده لینک رایگان و حرفه‌ای
  </h1>
    <Image
  src="/images/url-shortener-seo.webp"
  alt="بهترین کوتاه‌کننده لینک رایگان با آمار دقیق"
  width={900}
  height={500}
  loading="lazy"
/>

  <p style={{ marginBottom: "1.5rem", fontSize: "1.125rem" }}>
    آیا لینک‌های شما طولانی و نامرتب هستند؟ با استفاده از کوتاه‌کننده لینک حرفه‌ای ما، می‌توانید لینک‌های بلند خود را به URLهای کوتاه، جذاب و قابل اشتراک‌گذاری تبدیل کنید. این کار باعث می‌شود لینک‌ها ظاهر حرفه‌ای داشته باشند و نرخ کلیک (CTR) شما افزایش یابد.
  </p>

  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: "1rem" }}>
  <Image
    src="/images/link-benefits.webp"
    alt="مزایای کوتاه کردن لینک و افزایش نرخ کلیک"
    width={40}
    height={40}
    loading="lazy"
  />
  <h2 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "#fff" }}>
    چرا کوتاه کردن لینک مهم است؟
  </h2>
</Box>
  <ul style={{ marginBottom: "1.5rem", paddingInlineStart: "1.25rem", fontSize: "1.125rem" }}>
    <li>لینک‌های کوتاه و مرتب ظاهر حرفه‌ای به کسب‌وکار شما می‌دهند.</li>
    <li>اشتراک‌گذاری آسان در شبکه‌های اجتماعی و پیام‌رسان‌ها.</li>
    <li>امکان ردیابی دقیق کلیک‌ها و تحلیل عملکرد لینک‌ها —
      <a href="/url-shortener" style={{ color: "#a855f7" }}>جزئیات آمار</a>
    </li>
    <li>کسب درآمد اختیاری از هر لینک کوتاه —
      <a href="/best-url-shortener" style={{ color: "#a855f7" }}>آموزش درآمدزایی</a>
    </li>
    <li>ساخت لینک با دامنه اختصاصی —
      <a href="/short-url-generator" style={{ color: "#a855f7" }}>اطلاعات بیشتر</a>
    </li>
    <li>بدون تبلیغات اجباری و تجربه کاربری عالی —
      <a href="/free-url-shortener" style={{ color: "#a855f7" }}>بیشتر بخوانید</a>
    </li>
    <li>امنیت و حفاظت لینک با رمز عبور —
      <a href="/link-shortener" style={{ color: "#a855f7" }}>اطلاعات امنیتی</a>
    </li>
  </ul>

  <h2 style={{ fontSize: "1.875rem", fontWeight: "bold", marginBottom: "1rem", color: "#fff" }}>
    چگونه لینک خود را کوتاه کنیم؟
  </h2>
  <ol style={{ paddingInlineStart: "1.25rem", marginBottom: "1.5rem", lineHeight: "2", fontSize: "1.125rem" }}>
    <li>لینک بلند خود را در کادر بالای صفحه وارد کنید.</li>
    <li>بر روی دکمه «کوتاه کن» کلیک کنید.</li>
    <li>لینک کوتاه شده را کپی کرده و در شبکه‌های اجتماعی یا وبسایت خود استفاده کنید.</li>
  </ol>

  <h2 style={{ fontSize: "1.875rem", fontWeight: "bold", marginBottom: "1rem", color: "#fff" }}>
    صفحات مرتبط و آموزش‌ها
  </h2>
  <p style={{ marginBottom: "1.5rem", fontSize: "1.125rem" }}>
    برای دسترسی به امکانات بیشتر و یادگیری نکات حرفه‌ای، صفحات زیر را مشاهده کنید:
  </p>
  <ul style={{ marginBottom: "1.5rem", paddingInlineStart: "1.25rem", fontSize: "1.125rem" }}>
    <li><a href="/link-shortener" style={{ color: "#a855f7" }}>کوتاه‌کننده لینک حرفه‌ای</a></li>
    <li><a href="/free-url-shortener" style={{ color: "#a855f7" }}>کوتاه‌کننده لینک رایگان</a></li>
    <li><a href="/best-url-shortener" style={{ color: "#a855f7" }}>بهترین روش‌های کوتاه کردن لینک</a></li>
    <li><a href="/url-shortener" style={{ color: "#a855f7" }}>API کوتاه‌کننده لینک برای توسعه‌دهندگان</a></li>
    <li><a href="/short-url-generator" style={{ color: "#a855f7" }}>تولید لینک کوتاه با دامنه اختصاصی</a></li>
  </ul>

  <h2 style={{ fontSize: "1.875rem", fontWeight: "bold", marginBottom: "1rem", color: "#fff" }}>
    پرسش‌های متداول
  </h2>
  <p style={{ marginBottom: "1rem", fontSize: "1.125rem" }}>
    پاسخ به سوالات بیشتر و جزئیات کامل در <a href="/faq" style={{ color: "#a855f7" }}>صفحه سوالات متداول</a> موجود است.
  </p>
</section>




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
                  href="/monetize"
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
                  href="/domains"
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
                  href="/no-ads"
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
                  href="/analytics"
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
                  href="/security"
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
      کسب درآمد از لینک‌ها (اختیاری)
    </Typography>
    <Typography sx={{ color: "#94a3b8", mb: 2 }}>
      هر کاربر می‌تواند در پنل کاربری گزینه <strong>هدایت به صفحه تبلیغات </strong> را فعال کند تا لینک‌هایش به‌صورت اختیاری از مسیر تبلیغاتی نمایش داده شوند.
      با هر بازدید تبلیغ، امتیاز و درآمد کسب می‌کند 💰
      اگر این گزینه خاموش باشد، لینک بدون تبلیغ مستقیماً به مقصد می‌رود.
    </Typography>
    <Button component={Link} href="/monetize" variant="outlined" size="small">
      نحوه فعال‌سازی درآمدزایی
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
              <Button component={Link} href="/no-ads" variant="outlined" size="small">
                اطلاعات بیشتر
              </Button>
            </Paper>
          </Grid>
        </Grid>

          <Box mt={4} />
          <Grid size={{xs: 12, md: 6}}>
  <Paper sx={{ p: 3, borderRadius: 3, background: "rgba(255,255,255,0.03)" }}>
    <Typography fontWeight={800} mb={1} sx={{color: "#fff"}}>
      لینک‌های محافظت‌شده با رمز 🔒
    </Typography>
    <Typography sx={{ color: "#94a3b8", mb: 2 }}>
      هنگام ساخت لینک، می‌توانید گزینه <strong>password</strong> را تنظیم کنید تا فقط افرادی که رمز را دارند بتوانند به مقصد دسترسی داشته باشند.
      این قابلیت برای لینک‌های خصوصی یا محرمانه بسیار کاربردی است.
    </Typography>
    <Button component={Link} href="/security" variant="outlined" size="small">
      درباره امنیت بیشتر بخوانید
    </Button>
  </Paper>
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
          component={Link}
          href="/register"
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

export default HomeClient;
