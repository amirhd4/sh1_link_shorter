"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    Paper,
    Chip,
    Stack,
    GlobalStyles,
    Divider,
    AccordionSummary,
    AccordionDetails,
    Accordion,
} from "@mui/material";

import {
  MonetizationOn,
  Insights,
  Security,
  Speed,
  Domain,
  RocketLaunch,
  Public,
  Api,
  TrendingUp,
  Verified,
  ExpandMore,
} from "@mui/icons-material";

import { motion } from "framer-motion";

import HomeLinkShortener from "@/components/home/HomeLinkShortener";

/* ------------------------------------------------ */
/* DATA */
/* ------------------------------------------------ */

const faqItems = [
  {
    q: "آیا استفاده از لِس به عنوان کوتاه‌کننده لینک رایگان است؟",
    a: "بله، استفاده از L1s کاملاً رایگان است. شما می‌توانید بدون هیچ هزینه‌ای ثبت‌نام کنید و لینک‌های خود را به راحتی کوتاه کنید. در کنار پلن رایگان، پلن‌های حرفه‌ای نیز برای کاربران پرمصرف و برندها ارائه شده‌اند که امکاناتی مثل دامنه سفارشی، رمزگذاری لینک، و آمار تحلیلی پیشرفته را شامل می‌شوند.",
  },
  {
    q: "آیا API کوتاه‌کننده لینک لِس محدودیت دارد؟",
    a: "بله، برای هر کاربر یک Api-Key اختصاصی صادر می‌شود که دارای محدودیت درخواست در دقیقه (Rate Limit) است تا از سوء‌استفاده جلوگیری شود. در پلن‌های بالاتر، محدودیت‌ها بیشتر شده و امکان استفاده حرفه‌ای از API برای اتوماسیون، ربات‌ها و وب‌سرویس‌ها فراهم است.",
  },
  {
    q: "آیا لینک‌های کوتاه ساخته‌شده در لِس تاریخ انقضا دارند؟",
    a: "خیر، لینک‌های کوتاه به صورت دائمی فعال می‌مانند مگر این‌که توسط کاربر حذف یا غیرفعال شوند. همچنین می‌توانید برای هر لینک، در صورت نیاز، زمان انقضا تعیین کنید تا پس از تاریخ مشخصی دیگر فعال نباشد.",
  },
  {
    q: "آیا می‌توانم آمار دقیق کلیک‌های هر لینک را مشاهده کنم؟",
    a: "بله، لِس یک داشبورد تحلیلی کامل دارد که اطلاعات دقیق هر لینک را نشان می‌دهد؛ از جمله تعداد کلیک‌ها، موقعیت جغرافیایی کاربران (شهر و کشور)، دستگاه و مرورگر، Referrer، و حتی اثرانگشت (Fingerprint) کاربران. این ابزار به شما کمک می‌کند تا رفتار مخاطبان خود را بهتر تحلیل کنید.",
  },
  {
    q: "آیا امکان ساخت لینک با رمز یا دسترسی خصوصی وجود دارد؟",
    a: "بله، شما می‌توانید هنگام ایجاد لینک، یک رمز عبور تعریف کنید تا فقط افرادی که آن را دارند بتوانند به مقصد دسترسی پیدا کنند. این قابلیت برای لینک‌های خصوصی، محتوای آموزشی پولی یا فایل‌های مهم بسیار کاربردی است.",
  },
  {
    q: "آیا می‌توان از طریق لینک‌ها در لِس کسب درآمد کرد؟",
    a: "بله، سیستم لِس قابلیت نمایش تبلیغات بین مسیر را دارد. کاربران می‌توانند هنگام ساخت لینک، گزینه «نمایش تبلیغ» را فعال کنند تا از بازدید لینک‌هایشان درآمد کسب کنند. اگر این گزینه غیرفعال باشد، لینک مستقیماً کاربر را به مقصد هدایت می‌کند.",
  },
  {
    q: "آیا لِس از دامنه سفارشی پشتیبانی می‌کند؟",
    a: "بله، شما می‌توانید دامنه اختصاصی خودتان را به حساب کاربری متصل کنید تا لینک‌های کوتاه‌تان با نام برند خودتان ساخته شوند. این ویژگی برای شرکت‌ها، کسب‌وکارهای محتوامحور و برندهای شخصی بسیار مفید است.",
  },
  {
    q: "امنیت لینک‌های کوتاه در لِس چگونه تضمین می‌شود؟",
    a: "تمام لینک‌ها قبل از کوتاه شدن با سیستم هوشمند بررسی می‌شوند تا از سالم بودن و غیر‌مخرب بودن آن‌ها اطمینان حاصل شود. همچنین داده‌ها با رمزگذاری امن نگهداری می‌شوند و شما می‌توانید با تنظیم رمز یا محدودیت زمانی، امنیت بیشتری برای لینک‌های خود ایجاد کنید.",
  },
  {
    q: "ویژگی بیو لینک چیست و چگونه کار می‌کند؟",
    a: "بیو لینک به شما این امکان را می‌دهد که تمامی لینک‌های خود را در یک صفحه واحد جمع‌آوری کنید و آنها را با دیگران به اشتراک بگذارید. این ویژگی برای افرادی که نیاز دارند چندین لینک را در یک مکان خاص ارائه دهند، بسیار مفید است. این قابلیت در لس موجود است",
  },
];

const stats = [
  {
    value: "10M+",
    title: "کلیک ثبت‌شده",
    icon: <TrendingUp />,
  },
  {
    value: "500K+",
    title: "لینک کوتاه",
    icon: <RocketLaunch />,
  },
  {
    value: "99.99%",
    title: "پایداری سرویس",
    icon: <Verified />,
  },
  {
    value: "24/7",
    title: "در دسترس",
    icon: <Public />,
  },
];

const coreFeatures = [
  {
    icon: <Speed fontSize="large" />,
    title: "سرعت فوق‌العاده",
    description: "کوتاه‌سازی لینک در کمتر از چند میلی‌ثانیه با زیرساخت بهینه و پایدار.",
  },
  {
    icon: <Insights fontSize="large" />,
    title: "تحلیل دقیق",
    description: "نمایش کلیک‌ها، کشور، شهر، Referrer، دستگاه و مرورگر کاربران.",
  },
  {
    icon: <Security fontSize="large" />,
    title: "امنیت سازمانی",
    description: "رمزگذاری، محدودیت زمانی، لینک رمزدار و کنترل کامل روی دسترسی.",
  },
  {
    icon: <Domain fontSize="large" />,
    title: "دامنه اختصاصی",
    description: "لینک‌های کوتاه را با برند و دامنه شخصی خود ایجاد کنید.",
  },
  {
    icon: <Api fontSize="large" />,
    title: "API حرفه‌ای",
    description: "مناسب توسعه‌دهندگان، اتوماسیون‌ها، ربات‌ها و سرویس‌های SaaS.",
  },
  {
    icon: <MonetizationOn fontSize="large" />,
    title: "درآمدزایی",
    description: "کسب درآمد از بازدید لینک‌ها به‌صورت اختیاری و بدون اجبار.",
  },
];

/* ------------------------------------------------ */
/* MOTION */
/* ------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

/* ------------------------------------------------ */
/* COMPONENT */
/* ------------------------------------------------ */

const HomeClient = () => {
  return (
    <>
      <GlobalStyles
        styles={{
          body: {
            background: "#020617",
            color: "#f8fafc",
            margin: 0,
            padding: 0,
            boxSizing: "border-box",
          },
        }}
      />

      {/* ================================================= */}
      {/* HERO */}
      {/* ================================================= */}
      <Box sx={{ position: "relative", overflow: "hidden", py: { xs: 8, md: 12 } }}>
        {/* Background Glow */}
        <Box
          sx={{
            position: "absolute",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168,85,247,.25), transparent)",
            top: -250,
            right: -150,
            filter: "blur(40px)",
            zIndex: 0,
          }}
        />

        <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            {/* CONTENT */}
            <Grid size={{ xs: 12, lg: 6}}>
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.6 }}
              >
                <Chip
                  label="نسل جدید کوتاه‌کننده لینک"
                  sx={{
                    mb: 3,
                    fontWeight: 700,
                    background: "linear-gradient(90deg,#9333ea,#d946ef)",
                    color: "#fff",
                    border: "none",
                  }}
                />

                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: "2.4rem", md: "4rem" },
                    fontWeight: 900,
                    lineHeight: 1.2,
                    mb: 3,
                    background: "linear-gradient(90deg,#ffffff,#c084fc)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  کوتاه‌کننده لینک لِس
                  <br />
                  حرفه‌ای، سریع و
                  <br />
                  درآمدزا
                </Typography>

                <Typography
                  sx={{
                    color: "#94a3b8",
                    fontSize: "1.1rem",
                    lineHeight: 2,
                    mb: 4,
                    maxWidth: 700,
                  }}
                >
                  ساخت لینک کوتاه با دامنه اختصاصی، آمار دقیق، UTM، API حرفه‌ای، تحلیل جغرافیایی، لینک رمزدار و قابلیت کسب درآمد.
                </Typography>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Button
                    component={Link}
                    href="/register"
                    size="large"
                    variant="contained"
                    sx={{
                      borderRadius: 4,
                      px: 5,
                      py: 1.5,
                      fontWeight: 800,
                      color: "#fff",
                      background: "linear-gradient(90deg,#9333ea,#d946ef)",
                      "&:hover": {
                        background: "linear-gradient(90deg,#7c2d12,#tcd212)",
                        opacity: 0.9,
                      },
                    }}
                  >
                    شروع رایگان
                  </Button>

                  <Button
                    component={Link}
                    href="/plans"
                    size="large"
                    variant="outlined"
                    sx={{
                      borderRadius: 4,
                      px: 5,
                      py: 1.5,
                      borderColor: "#475569",
                      color: "#fff",
                      "&:hover": {
                        borderColor: "#94a3b8",
                        background: "rgba(255,255,255,0.05)",
                      },
                    }}
                  >
                    مشاهده پلن‌ها
                  </Button>
                </Stack>
              </motion.div>
            </Grid>

            {/* IMAGE */}
            <Grid size={{ xs: 12, lg: 6}}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
              >
                <Paper
                  sx={{
                    overflow: "hidden",
                    borderRadius: 5,
                    background: "rgba(255,255,255,.04)",
                    border: "1px solid rgba(255,255,255,.08)",
                    boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
                  }}
                >
                  <Image
                    src="/images/hero-dashboard.webp"
                    alt="داشبورد کوتاه کننده لینک l1s"
                    width={1200}
                    height={630}
                    priority
                    style={{
                      width: "100%",
                      height: "auto",
                      display: "block",
                    }}
                  />
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ================================================= */}
      {/* SHORTENER */}
      {/* ================================================= */}
      <Container maxWidth="lg" sx={{ mb: 10 }}>
        <Paper
          sx={{
            p: { xs: 2, md: 4 },
            borderRadius: 5,
            background: "rgba(255,255,255,.03)",
            border: "1px solid rgba(255,255,255,.06)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Typography variant="h4" align="center" fontWeight={900} mb={3} sx={{ color: "#fff" }}>
            لینک خود را همین حالا کوتاه کنید
          </Typography>
          <HomeLinkShortener />
        </Paper>
      </Container>

      {/* ================================================= */}
      {/* TRUST STATS */}
      {/* ================================================= */}
      <Container maxWidth="xl" sx={{ mb: 12 }}>
        <Grid container spacing={3}>
          {stats.map((item) => (
            <Grid size={{ xs: 6, md: 3}} key={item.title}>
              <Paper
                sx={{
                  p: 4,
                  borderRadius: 4,
                  textAlign: "center",
                  background: "rgba(255,255,255,.03)",
                  border: "1px solid rgba(255,255,255,.06)",
                  height: "100%",
                }}
              >
                <Box sx={{ mb: 2, color: "#c084fc" }}>{item.icon}</Box>
                <Typography variant="h4" fontWeight={900} sx={{ color: "#fff" }}>
                  {item.value}
                </Typography>
                <Typography sx={{ color: "#94a3b8", mt: 1 }}>{item.title}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ================================================= */}
      {/* FEATURES PREVIEW */}
      {/* ================================================= */}
      <Container maxWidth="xl" sx={{ mb: 12 }}>
        <Box textAlign="center" mb={6}>
          <Typography variant="h3" fontWeight={900} mb={2} sx={{ color: "#fff" }}>
            امکانات حرفه‌ای لِس
          </Typography>
          <Typography sx={{ color: "#94a3b8", maxWidth: 800, mx: "auto" }}>
            تمام ابزارهای موردنیاز برای بازاریابان، توسعه‌دهندگان، کسب‌وکارها و تولیدکنندگان محتوا.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {coreFeatures.map((feature, index) => (
            <Grid size={{ xs: 12, sm: 6}} key={index}>
              <motion.div whileHover={{ y: -8 }}>
                <Paper
                  sx={{
                    p: 4,
                    height: "100%",
                    borderRadius: 5,
                    background: "rgba(255,255,255,.03)",
                    border: "1px solid rgba(255,255,255,.06)",
                  }}
                >
                  <Box sx={{ color: "#c084fc", mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h6" fontWeight={800} mb={2} sx={{ color: "#fff" }}>
                    {feature.title}
                  </Typography>
                  <Typography sx={{ color: "#94a3b8", lineHeight: 2 }}>
                    {feature.description}
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Divider sx={{ borderColor: "rgba(255,255,255,.06)" }} />

      {/* ================================================= */}
      {/* MONETIZATION SECTION */}
      {/* ================================================= */}
      <Container maxWidth="xl" sx={{ py: { xs: 10, md: 14 } }}>
        <Grid container spacing={6} alignItems="center">
          <Grid size={{ xs: 12, lg: 6}}>
            <Typography variant="h3" fontWeight={900} mb={3} sx={{ color: "#fff" }}>
              از لینک‌های خود درآمد کسب کنید
            </Typography>

            <Typography sx={{ color: "#94a3b8", lineHeight: 2.2, mb: 4 }}>
              لِس امکان درآمدزایی از لینک‌ها را به‌صورت اختیاری فراهم کرده است. می‌توانید هنگام ساخت لینک تعیین کنید که بازدیدکننده قبل از رسیدن به مقصد، صفحه تبلیغاتی را مشاهده کند.
            </Typography>

            <Stack spacing={2}>
              {["💰 درآمد از بازدید واقعی", "📊 گزارش کامل درآمد", "🚀 فعال یا غیرفعال کردن در هر لینک"].map((text, idx) => (
                <Paper
                  key={idx}
                  sx={{
                    p: 2,
                    background: "rgba(255,255,255,.03)",
                    border: "1px solid rgba(255,255,255,.06)",
                    borderRadius: 3,
                    color: "#fff",
                  }}
                >
                  {text}
                </Paper>
              ))}
            </Stack>

            <Button
              component={Link}
              href="/short-url-generator"
              variant="contained"
              size="large"
              sx={{
                mt: 4,
                borderRadius: 4,
                color: "#fff",
                background: "linear-gradient(90deg,#9333ea,#d946ef)",
              }}
            >
              مشاهده سیستم درآمدزایی
            </Button>
          </Grid>

          <Grid size={{ xs: 12, lg: 6}}>
            <Paper
              sx={{
                p: 5,
                borderRadius: 5,
                background: "linear-gradient(135deg,rgba(168,85,247,.12),rgba(217,70,239,.08))",
                border: "1px solid rgba(255,255,255,.08)",
              }}
            >
              <Typography variant="h2" fontWeight={900} align="center" mb={2}>
                💸
              </Typography>
              <Typography variant="h5" align="center" fontWeight={800} sx={{ color: "#fff" }}>
                سیستم درآمدزایی هوشمند
              </Typography>
              <Typography align="center" sx={{ mt: 2, color: "#94a3b8" }}>
                بدون اجبار، کاملاً تحت کنترل شما
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* ================================================= */}
      {/* BIO LINK */}
      {/* ================================================= */}
      <Box sx={{ py: 12, background: "rgba(255,255,255,.02)" }}>
        <Container maxWidth="xl">
          <Grid container spacing={6} alignItems="center">
            <Grid size={{ xs: 12, lg: 6}}>
              <Image
                src="/images/bio-link-seo.webp"
                alt="bio link"
                width={900}
                height={450}
                style={{
                  width: "100%",
                  height: "auto",
                  borderRadius: 24,
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, lg: 6}}>
              <Typography variant="h3" fontWeight={900} mb={3} sx={{ color: "#fff" }}>
                بیو لینک اختصاصی
              </Typography>

              <Typography sx={{ color: "#94a3b8", lineHeight: 2.2, mb: 4 }}>
                تمام لینک‌های مهم خود را در یک صفحه حرفه‌ای جمع‌آوری کنید. مناسب اینستاگرام، تلگرام، یوتیوب، لینکدین و برند شخصی.
              </Typography>

              <Stack direction="row" flexWrap="wrap" gap={2}>
                {["پروفایل شخصی", "چند لینک در یک صفحه", "آمار بازدید", "برندینگ"].map((label) => (
                  <Chip
                    key={label}
                    label={label}
                    sx={{
                      background: "rgba(255,255,255,0.06)",
                      color: "#f8fafc",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  />
                ))}
              </Stack>

              <Button
                component={Link}
                href="/bio-link"
                variant="outlined"
                sx={{
                  mt: 4,
                  borderRadius: 4,
                  borderColor: "rgba(255,255,255,.2)",
                  color: "#fff",
                  "&:hover": { borderColor: "#fff" },
                }}
              >
                مشاهده بیو لینک
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ================================================= */}
      {/* GEO SEO SECTION */}
      {/* ================================================= */}
      <Container maxWidth="lg" sx={{ py: { xs: 10, md: 14 } }}>
        <Typography variant="h3" fontWeight={900} align="center" mb={6} sx={{ color: "#fff" }}>
          کوتاه‌کننده لینک برای کسب‌وکارها، مارکترها و توسعه‌دهندگان
        </Typography>

        <Typography sx={{ color: "#94a3b8", lineHeight: 2.3, fontSize: "1.05rem" }}>
          اگر به دنبال یک کوتاه‌کننده لینک حرفه‌ای هستید که علاوه بر ساخت URL کوتاه، امکانات پیشرفته‌ای مانند تحلیل بازدیدکنندگان، دامنه اختصاصی، لینک رمزدار، ساخت پارامترهای UTM، API حرفه‌ای و گزارش‌های تحلیلی ارائه دهد، لِس یکی از کامل‌ترین گزینه‌های موجود است.
        </Typography>

        <Typography sx={{ color: "#94a3b8", lineHeight: 2.3, mt: 3 }}>
          کاربران می‌توانند عملکرد کمپین‌های تبلیغاتی خود را بررسی کرده، منابع ورودی ترافیک را شناسایی کنند و اطلاعاتی مانند کشور، شهر، مرورگر و دستگاه کاربران را مشاهده نمایند.
        </Typography>
      </Container>

      {/* ================================================= */}
      {/* ANALYTICS */}
      {/* ================================================= */}
      <Container maxWidth="xl" sx={{ pb: 14 }}>
        <Typography variant="h3" fontWeight={900} textAlign="center" mb={7} sx={{ color: "#fff" }}>
          داشبورد تحلیل پیشرفته
        </Typography>

        <Grid container spacing={4}>
          {[
            "کشور بازدیدکنندگان",
            "شهر بازدیدکنندگان",
            "منابع ورودی",
            "مرورگر کاربران",
            "دستگاه کاربران",
            "UTM کمپین‌ها",
          ].map((item) => (
            <Grid size={{ xs: 12, sm: 6, md: 4}} key={item}>
              <Paper
                sx={{
                  p: 4,
                  textAlign: "center",
                  borderRadius: 4,
                  background: "rgba(255,255,255,.03)",
                  border: "1px solid rgba(255,255,255,.06)",
                  height: "100%",
                }}
              >
                <Typography variant="h6" fontWeight={800} sx={{ color: "#fff" }}>
                  {item}
                </Typography>
                <Typography sx={{ mt: 2, color: "#94a3b8" }}>گزارش دقیق و لحظه‌ای</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ================================================= */}
      {/* CUSTOM DOMAIN */}
      {/* ================================================= */}
      <Box sx={{ py: 12, background: "rgba(255,255,255,.02)" }}>
        <Container maxWidth="xl">
          <Typography variant="h3" fontWeight={900} textAlign="center" mb={4} sx={{ color: "#fff" }}>
            دامنه اختصاصی برای برند شما
          </Typography>

          <Typography
            align="center"
            sx={{
              maxWidth: 900,
              mx: "auto",
              color: "#94a3b8",
              lineHeight: 2.2,
              mb: 6,
            }}
          >
            لینک‌های کوتاه را با دامنه برند خود ایجاد کنید تا اعتماد کاربران افزایش یابد و هویت برند شما حفظ شود.
          </Typography>

          <Paper
            sx={{
              p: 5,
              borderRadius: 5,
              textAlign: "center",
              background: "rgba(255,255,255,.03)",
              border: "1px solid rgba(255,255,255,.06)",
            }}
          >
            <Typography variant="h5" fontWeight={800} sx={{ color: "#c084fc", letterSpacing: "1px" }}>
              yourbrand.com/abc123
            </Typography>
          </Paper>
        </Container>
      </Box>

      {/* ================================================= */}
      {/* UTM SECTION */}
      {/* ================================================= */}
      <Container maxWidth="lg" sx={{ py: 14 }}>
        <Typography variant="h3" fontWeight={900} mb={4} align="center" sx={{ color: "#fff" }}>
          مدیریت UTM و کمپین‌ها
        </Typography>

        <Typography sx={{ color: "#94a3b8", lineHeight: 2.2, textAlign: "center" }}>
          برای هر لینک می‌توانید UTM Source، UTM Medium و UTM Campaign تعریف کنید و عملکرد کمپین‌های تبلیغاتی خود را به‌صورت دقیق اندازه‌گیری نمایید.
        </Typography>
      </Container>

      {/* ================================================= */}
      {/* CTA */}
      {/* ================================================= */}
      <Container maxWidth="md" sx={{ pb: 14 }}>
        <Paper
          sx={{
            p: { xs: 4, md: 7 },
            textAlign: "center",
            borderRadius: 6,
            background: "linear-gradient(135deg,rgba(168,85,247,.18),rgba(217,70,239,.12))",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Typography variant="h3" fontWeight={900} mb={2} sx={{ color: "#fff" }}>
            آماده شروع هستید؟
          </Typography>

          <Typography sx={{ color: "#cbd5e1", mb: 4 }}>
            همین حالا ثبت‌نام کنید و اولین لینک کوتاه خود را بسازید.
          </Typography>

          <Button
            component={Link}
            href="/register"
            size="large"
            variant="contained"
            sx={{
              borderRadius: 4,
              px: 6,
              color: "#fff",
              background: "linear-gradient(90deg,#9333ea,#d946ef)",
            }}
          >
            ثبت‌نام رایگان
          </Button>
        </Paper>
      </Container>

      {/* ================================================= */}
      {/* API SHOWCASE */}
      {/* ================================================= */}
      <Box sx={{ py: { xs: 10, md: 14 }, background: "rgba(255,255,255,.015)" }}>
        <Container maxWidth="xl">
          <Grid container spacing={6} alignItems="center">
            <Grid size={{ xs: 12, lg: 6}}>
              <Typography variant="h3" fontWeight={900} mb={3} sx={{ color: "#fff" }}>
                API کوتاه‌کننده لینک برای توسعه‌دهندگان
              </Typography>

              <Typography sx={{ color: "#94a3b8", lineHeight: 2.2, mb: 4 }}>
                سرویس API لِس به شما اجازه می‌دهد لینک‌های کوتاه را مستقیماً از داخل اپلیکیشن‌ها، ربات‌ها، CRM، سرویس‌های SaaS و سیستم‌های اتوماسیون ایجاد کنید.
              </Typography>

              <Stack spacing={2}>
                {[
                  "✓ احراز هویت Api-Key",
                  "✓ پاسخ JSON استاندارد",
                  "✓ پشتیبانی از دامنه اختصاصی",
                  "✓ پشتیبانی از UTM",
                  "✓ Rate Limiting",
                ].map((text) => (
                  <Paper
                    key={text}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      background: "rgba(255,255,255,.03)",
                      border: "1px solid rgba(255,255,255,.06)",
                      color: "#f8fafc",
                    }}
                  >
                    {text}
                  </Paper>
                ))}
              </Stack>

              <Button
                component={Link}
                href="/url-shortener"
                variant="contained"
                sx={{
                  mt: 4,
                  borderRadius: 4,
                  color: "#fff",
                  background: "linear-gradient(90deg,#9333ea,#d946ef)",
                }}
              >
                مستندات API
              </Button>
            </Grid>

            <Grid size={{ xs: 12, lg: 6}}>
              <Paper
                sx={{
                  p: 4,
                  borderRadius: 5,
                  background: "#0f172a",
                  border: "1px solid rgba(255,255,255,0.06)",
                  overflow: "auto",
                }}
              >
                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    color: "#38bdf8",
                    fontSize: 13,
                    direction: "ltr",
                    fontFamily: "monospace",
                  }}
                >
{`curl -X POST https://l1s.ir/api/v1/shorten \\
  -H "Api-Key: sk_xxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{ "long_url": "https://example.com" }'`}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ================================================= */}
      {/* SEO LANDING CONTENT */}
      {/* ================================================= */}
      <Container maxWidth="lg" sx={{ py: { xs: 10, md: 14 } }}>
        <Typography variant="h3" fontWeight={900} mb={5} align="center" sx={{ color: "#fff" }}>
          بهترین کوتاه‌کننده لینک برای کسب‌وکارهای مدرن
        </Typography>

        <Typography paragraph sx={{ color: "#94a3b8", lineHeight: 2.3 }}>
          کوتاه‌کننده لینک لِس یک سرویس حرفه‌ای برای ساخت لینک کوتاه، مدیریت لینک‌ها، تحلیل رفتار کاربران و افزایش نرخ کلیک است. کاربران می‌توانند لینک‌های طولانی را به URLهای کوتاه، زیبا و قابل اشتراک‌گذاری تبدیل کنند.
        </Typography>

        <Typography paragraph sx={{ color: "#94a3b8", lineHeight: 2.3 }}>
          لینک‌های کوتاه در شبکه‌های اجتماعی، تبلیغات دیجیتال، کمپین‌های بازاریابی، پیامک‌های تبلیغاتی، ایمیل مارکتینگ و محتواهای آموزشی کاربرد گسترده‌ای دارند.
        </Typography>

        <Typography paragraph sx={{ color: "#94a3b8", lineHeight: 2.3 }}>
          با استفاده از لِس می‌توانید لینک‌های برندشده، لینک‌های رمزدار، لینک‌های دارای زمان انقضا و لینک‌های دارای آمار تحلیلی ایجاد کنید.
        </Typography>
      </Container>

      {/* ================================================= */}
      {/* INTERNAL LINKING CLUSTER */}
      {/* ================================================= */}
      <Container maxWidth="xl">
        <Typography variant="h4" fontWeight={900} align="center" mb={5} sx={{ color: "#fff" }}>
          صفحات کاربردی
        </Typography>

        <Grid container spacing={3}>
          {[
            { title: "کوتاه کننده لینک", href: "/short-url-generator" },
            { title: "مستندات API", href: "/url-shortener" },
            { title: "بیو لینک", href: "/bio-link" },
            { title: "کسب درآمد", href: "/short-url-generator" },
            { title: "آموزش استفاده", href: "/tutorial" },
            { title: "پلن‌ها", href: "/plans" },
          ].map((item, index) => (
            <Grid size={{ xs: 12, lg: 6, sm: 6, md: 4}} key={`${item.href}-${index}`}>
              <Paper
                sx={{
                  p: 4,
                  borderRadius: 4,
                  height: "100%",
                  background: "rgba(255,255,255,.03)",
                  border: "1px solid rgba(255,255,255,.06)",
                  transition: ".3s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    borderColor: "rgba(255,255,255,.15)",
                  },
                }}
              >
                <Typography variant="h6" fontWeight={800} mb={2} sx={{ color: "#fff" }}>
                  {item.title}
                </Typography>

                <Typography sx={{ color: "#94a3b8", mb: 3 }}>
                  مشاهده اطلاعات بیشتر درباره {item.title}
                </Typography>

                <Button component={Link} href={item.href} sx={{ color: "#c084fc", fontWeight: 700, p: 0 }}>
                  مشاهده ←
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ================================================= */}
      {/* GEO CONTENT */}
      {/* ================================================= */}
      <Container maxWidth="lg" sx={{ py: { xs: 10, md: 14 } }}>
        <Typography variant="h3" fontWeight={900} mb={4} sx={{ color: "#fff" }}>
          تحلیل جغرافیایی بازدیدکنندگان
        </Typography>

        <Typography sx={{ color: "#94a3b8", lineHeight: 2.3 }}>
          سیستم تحلیل جغرافیایی لِس اطلاعات دقیقی از کشور، استان و شهر بازدیدکنندگان لینک را نمایش می‌دهد. این قابلیت به مدیران کمپین‌های تبلیغاتی کمک می‌کند مخاطبان واقعی خود را بهتر بشناسند.
        </Typography>

        <Typography sx={{ color: "#94a3b8", lineHeight: 2.3, mt: 3 }}>
          گزارش‌های جغرافیایی در کنار داده‌های Referrer، مرورگر، دستگاه و پارامترهای UTM تصویری کامل از عملکرد لینک‌ها در اختیار شما قرار می‌دهد.
        </Typography>
      </Container>

      {/* ================================================= */}
      {/* FAQ SEO */}
      {/* ================================================= */}
      <Container maxWidth="lg" sx={{ pb: 12 }}>
        <Typography variant="h3" fontWeight={900} align="center" mb={6} sx={{ color: "#fff" }}>
          سوالات متداول
        </Typography>

        {faqItems.map((item, index) => (
          <Accordion
            key={index}
            sx={{
              mb: 2,
              borderRadius: "12px !important",
              overflow: "hidden",
              background: "rgba(255,255,255,.03)",
              border: "1px solid rgba(255,255,255,.06)",
              boxShadow: "none",
              color: "#f8fafc",
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMore sx={{ color: "#94a3b8" }} />}>
              <Typography fontWeight={700} sx={{ color: "#fff" }}>{item.q}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ borderTop: "1px solid rgba(255,255,255,.06)" }}>
              <Typography sx={{ color: "#94a3b8", lineHeight: 2 }}>{item.a}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Container>

      {/* ================================================= */}
      {/* FINAL SEO CTA */}
      {/* ================================================= */}
      <Box
        sx={{
          py: 14,
          background: "linear-gradient(180deg,rgba(168,85,247,.08),rgba(217,70,239,.03))",
          borderTop: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" fontWeight={900} align="center" mb={3} sx={{ color: "#fff", fontSize: { xs: "2rem", md: "3rem" } }}>
            ساخت لینک کوتاه در کمتر از ۵ ثانیه
          </Typography>

          <Typography align="center" sx={{ color: "#94a3b8", mb: 5, lineHeight: 2 }}>
            همین حالا ثبت‌نام کنید و از امکانات حرفه‌ای شامل دامنه اختصاصی، API، آمار دقیق، لینک بیو و درآمدزایی استفاده کنید.
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
            <Button
              component={Link}
              href="/register"
              variant="contained"
              size="large"
              sx={{
                borderRadius: 4,
                px: 5,
                color: "#fff",
                background: "linear-gradient(90deg,#9333ea,#d946ef)",
              }}
            >
              ثبت‌نام رایگان
            </Button>

            <Button
              component={Link}
              href="/plans"
              variant="outlined"
              size="large"
              sx={{
                borderRadius: 4,
                px: 5,
                borderColor: "rgba(255,255,255,.2)",
                color: "#fff",
                "&:hover": { borderColor: "#fff", background: "rgba(255,255,255,0.05)" },
              }}
            >
              مشاهده پلن‌ها
            </Button>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default HomeClient;