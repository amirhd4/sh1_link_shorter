import React from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Stack,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip
} from "@mui/material";
import { ExpandMore, MonetizationOn, Link, Security, Insights, TouchApp, Code } from "@mui/icons-material";
import Image from "next/image";
import { Metadata } from "next";
import config from "@/config";

export const metadata: Metadata = {
  title: "تولیدکننده لینک کوتاه و سیستم درآمدزایی | لس",
  description:
    "با ابزار پیشرفته تولیدکننده لینک کوتاه لس، لینک‌های خود را به راحتی کوتاه کنید. امکان کسب درآمد از کلیک‌ها، ساخت بیو لینک، اتصال API و مشاهده آمار دقیق جغرافیایی.",
  keywords:
    "تولید لینک کوتاه, کوتاه کننده لینک آنلاین, لینک کوتاه سریع, لینک کوتاه امن, ابزار لینک کوتاه, کسب درآمد از لینک, بیو لینک اختصاصی, API کوتاه کننده لینک",
  alternates: { canonical: `${config.frontBaseUrl}/short-url-generator` },
};

const faqItems = [
  {
    q: "تولیدکننده لینک کوتاه چیست و چه کاربردی دارد؟",
    a: "ابزاری آنلاین و پیشرفته برای تبدیل لینک‌های بلند، طولانی و پیچیده به لینک‌های کوتاه، زیبا و قابل اشتراک‌گذاری است. این ابزار علاوه بر زیباسازی، امکان مدیریت، تحلیل آمار کلیک‌ها و رهگیری کاربران را فراهم می‌کند.",
  },
  {
    q: "چگونه می‌توان از طریق تولید لینک کوتاه در لس کسب درآمد کرد؟",
    a: "لس به شما این امکان را می‌دهد که هنگام کوتاه کردن لینک، گزینه 'نمایش تبلیغ بین مسیر' را فعال کنید. با این کار، بازدیدکنندگان قبل از انتقال به مقصد اصلی، یک صفحه تبلیغاتی کوتاه را مشاهده می‌کنند و درآمد حاصل از آن به کیف پول شما واریز می‌شود.",
  },
  {
    q: "آیا استفاده از ابزار کوتاه کننده لینک لس رایگان است؟",
    a: "بله، استفاده از امکانات پایه‌ای، تولید لینک کوتاه سریع و بدون تبلیغات اجباری کاملاً رایگان است. برای دسترسی به ویژگی‌های پیشرفته‌تر مانند دامنه اختصاصی یا پلن‌های پرمصرف API، می‌توانید پلن‌های حرفه‌ای را تهیه کنید.",
  },
  {
    q: "آیا لینک‌های تولید شده منقضی می‌شوند؟",
    a: "خیر، لینک‌های ساخته شده در پلتفرم لس به صورت دائمی و مادام‌العمر فعال می‌مانند، مگر اینکه خودتان از طریق داشبورد مدیریت اقدام به حذف یا غیرفعال‌سازی آن‌ها کنید.",
  },
];

const ShortUrlGeneratorPage: React.FC = () => {
  return (
    <Box sx={{ bgcolor: "#020617", color: "#f8fafc", minHeight: "100vh", pb: 10 }}>
      {/* JSON-LD برای FAQ (سئو پیشرفته) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqItems.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />

      <Container maxWidth="xl" sx={{ pt: 4 }}>
        {/* Breadcrumb شیک و سازگار با تم تیره */}
        <Box mb={4}>
          <Typography variant="body2" sx={{ color: "#94a3b8", display: "flex", gap: 1, alignItems: "center" }}>
            <a href={`${config.frontBaseUrl}/home`} style={{ color: "#c084fc", textDecoration: "none" }}>خانه</a>
            <span>&gt;</span>
            <span style={{ color: "#94a3b8" }}>تولید کننده لینک کوتاه</span>
          </Typography>
        </Box>

        {/* بنر هیرو سئو شده */}
        <Box mb={6} display="flex" justifyContent="center">
          <Paper
            sx={{
              overflow: "hidden",
              borderRadius: 5,
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(255,255,255,.08)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
              width: "100%"
            }}
          >
            <Image
              src="/images/url-shortener-seo.webp"
              alt="بهترین کوتاه‌کننده لینک ایران و ابزار تولید لینک کوتاه لس"
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
        </Box>

        {/* عنوان اصلی گرادینتی برای جذابیت در تم تیره */}
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: "2.2rem", md: "3.5rem" },
            fontWeight: 900,
            mb: 3,
            background: "linear-gradient(90deg,#ffffff,#c084fc)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          تولیدکننده لینک کوتاه لس
        </Typography>

        <Typography sx={{ color: "#94a3b8", fontSize: "1.1rem", lineHeight: 2, mb: 6, maxWidth: "900px" }}>
          با ابزار آنلاین و پیشرفته تولیدکننده لینک کوتاه لس، لینک‌های طولانی، پیچیده و دارای پارامترهای متعدد خود را به لینک‌های کوتاه، بهینه، زیبا و امن تبدیل کنید. این بستر با ساختاری منحصر‌به‌فرد، بهترین راهکار برای مدیریت لینک‌ها در شبکه‌های اجتماعی (اینستاگرام، تلگرام، یوتیوب)، پیامک‌های انبوه و کمپین‌های مارکتینگ است.
        </Typography>

        {/* بخش ویژگی‌های کلیدی به صورت کارت‌های شیشه‌ای */}
        <Box component="section" mb={8}>
          <Typography variant="h2" sx={{ fontSize: { xs: "1.6rem", md: "2.2rem" }, fontWeight: 800, mb: 4, color: "#fff" }}>
            ویژگی‌های کلیدی پلتفرم تولید لینک کوتاه
          </Typography>

          <Grid container spacing={3}>
            {[
              { icon: <TouchApp fontSize="large" />, title: "تبدیل آنی و سریع", desc: "تولید لینک کوتاه اختصاصی در کمتر از چند میلی‌ثانیه با بالاترین پایداری سرور." },
              { icon: <MonetizationOn fontSize="large" />, title: "سیستم درآمدزایی اختیاری", desc: "امکان کسب درآمد میلیونی از بازدید لینک‌ها با فعال‌سازی تبلیغات بین‌مسیر." },
              { icon: <Link fontSize="large" />, title: "اتصال دامنه اختصاصی", desc: "برندسازی لینک‌ها با متصل کردن دامنه شخصی خودتان برای جلب اعتماد ۱۰۰ درصدی." },
              { icon: <Security fontSize="large" />, title: "امنیت و رمزگذاری", desc: "محافظت از محتوای لینک‌ها با قابلیت تعریف رمز عبور و تعیین تاریخ انقضای دقیق." },
              { icon: <Insights fontSize="large" />, title: "آمارهای پیشرفته هوشمند", desc: "ردیابی تعداد کلیک‌ها، موقعیت جغرافیایی کاربران، نوع دستگاه، مرورگر و Referrer." },
              { icon: <Code fontSize="large" />, title: "پشتیبانی از API حرفه‌ای", desc: "اتصال آسان ابزار به وب‌سایت‌ها، اپلیکیشن‌ها و ربات‌ها برای اتوماسیون فرآیندها." },
            ].map((feat, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4}} key={index}>
                <Paper
                  sx={{
                    p: 4,
                    height: "100%",
                    borderRadius: 4,
                    background: "rgba(255,255,255,.03)",
                    border: "1px solid rgba(255,255,255,.06)",
                  }}
                >
                  <Box sx={{ color: "#c084fc", mb: 2 }}>{feat.icon}</Box>
                  <Typography variant="h3" sx={{ fontSize: "1.2rem", fontWeight: 700, mb: 1, color: "#fff" }}>{feat.title}</Typography>
                  <Typography variant="body2" sx={{ color: "#94a3b8", lineHeight: 1.8 }}>{feat.desc}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* راهنمای گام به گام تصویری/متنی */}
        <Box component="section" mb={8} sx={{ p: { xs: 3, md: 5 }, borderRadius: 5, background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.04)" }}>
          <Typography variant="h2" sx={{ fontSize: { xs: "1.6rem", md: "2.2rem" }, fontWeight: 800, mb: 4, color: "#fff" }}>
            آموزش قدم به قدم: چگونه لینک کوتاه بسازیم؟
          </Typography>
          <Grid container spacing={4}>
            {[
              { step: "۱", text: "لینک بلند و اصلی خود را در کادر ابزار کوتاه کننده وارد کنید." },
              { step: "۲", text: "در صورت تمایل، تنظیمات پیشرفته (مانند رمز عبور، نام مستعار یا سیستم درآمدزایی) را اعمال کنید." },
              { step: "۳", text: "بر روی دکمه «کوتاه کن» کلیک کنید." },
              { step: "۴", text: "لینک کوتاه تولید شده را کپی کرده و در پلتفرم‌های خود به اشتراک بگذارید." },
              { step: "۵", text: "آمارهای مربوط به بازدیدها و عملکرد آن را به صورت لحظه‌ای در داشبورد خود رصد کنید." },
            ].map((item, idx) => (
              <Grid size={{ xs: 12, sm: 6, md: 2.4}} key={idx}>
                <Stack spacing={2} alignItems="center" textAlign="center">
                  <Box sx={{ width: 50, height: 50, borderRadius: "50%", background: "linear-gradient(135deg,#9333ea,#d946ef)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", fontSize: "1.2rem" }}>
                    {item.step}
                  </Box>
                  <Typography variant="body2" sx={{ color: "#cbd5e1", lineHeight: 1.8 }}>{item.text}</Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* بخش یکپارچه‌سازی با سیستم درآمدزایی و بیو لینک (اضافه شده بر اساس صفحه اصلی) */}
        <Grid container spacing={4} mb={8}>
          <Grid size={{ xs: 12, md: 6}}>
            <Paper sx={{ p: 4, height: "100%", borderRadius: 4, background: "linear-gradient(135deg,rgba(168,85,247,.1),rgba(217,70,239,.05))", border: "1px solid rgba(255,255,255,.08)" }}>
              <Chip label="سیستم درآمدزایی هوشمند" sx={{ bg: "#9333ea", color: "#fff", mb: 2, fontWeight: 700 }} />
              <Typography variant="h3" sx={{ fontSize: "1.5rem", fontWeight: 800, mb: 2, color: "#fff" }}>همین حالا کسب درآمد از لینک را شروع کنید</Typography>
              <Typography sx={{ color: "#cbd5e1", lineHeight: 2, fontSize: "0.95rem" }}>
                یکی از تمایزهای اصلی تولیدکننده لینک کوتاه لس، امکان تجاری‌سازی لینک‌هاست. شما می‌توانید با کوتاه کردن لینک‌های پربازدید خود (مانند فایل‌های دانلودی یا مطالب آموزشی) و فعال‌سازی قابلیت کسب درآمد، به ازای هر بازدیدکننده واقعی درآمد ریالی ثابت داشته باشید و آن را در قالب تسویه‌حساب‌های منظم دریافت کنید.
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 6}}>
            <Paper sx={{ p: 4, height: "100%", borderRadius: 4, background: "linear-gradient(135deg,rgba(56,189,248,.1),rgba(59,130,246,.05))", border: "1px solid rgba(255,255,255,.08)" }}>
              <Chip label="ویژگی بیو لینک اختصاصی" sx={{ bg: "#3182ce", color: "#fff", mb: 2, fontWeight: 700 }} />
              <Typography variant="h3" sx={{ fontSize: "1.5rem", fontWeight: 800, mb: 2, color: "#fff" }}>تجمیع لینک‌ها در یک آدرس واحد</Typography>
              <Typography sx={{ color: "#cbd5e1", lineHeight: 2, fontSize: "0.95rem" }}>
                آیا نیاز دارید چندین لینک کوتاه را در بیو اینستاگرام یا پروفایل‌های اجتماعی خود قرار دهید؟ ویژگی بیو لینک لس به شما اجازه می‌دهد یک صفحه فرود (Landing Page) شخصی‌سازی‌شده و بسیار شیک بسازید و تمام شبکه‌های اجتماعی، راه‌های ارتباطی و لینک‌های کوتاه خود را در یک آدرس منحصر‌به‌فرد ادغام کنید.
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* مزایای سئو شده برای سرچ بازاریابی دیجیتال */}
        <Box component="section" mb={8}>
          <Typography variant="h2" sx={{ fontSize: { xs: "1.6rem", md: "2.2rem" }, fontWeight: 800, mb: 3, color: "#fff" }}>
            مزایای استفاده از لینک‌های کوتاه در بازاریابی دیجیتال
          </Typography>
          <Typography sx={{ color: "#94a3b8", lineHeight: 2, mb: 3 }}>
            در دنیای دیجیتال مارکتینگ مدرن، لینک‌های طولانی نه تنها ظاهر زشتی دارند بلکه نرخ کلیک (CTR) کاربران را به شدت کاهش می‌دهند. استفاده از لینک‌های کوتاه تولید شده توسط لس مزایای زیر را به همراه دارد:
          </Typography>
          <Grid container spacing={2}>
            {[
              "افزایش چشمگیر اعتماد کاربران به دلیل ساختار منظم و کوتاه",
              "کاهش تعداد کاراکترها در کمپین‌های پیامکی (SMS Marketing) و صرفه‌جویی کلان در هزینه‌ها",
              "امکان مدیریت هوشمند ترافیک ورودی و بهینه‌سازی پارامترهای UTM کمپین‌ها",
              "پنهان‌سازی لینک‌های طولانی و پیچیده افیلیت (همکاری در فروش)",
              "قابلیت ویرایش و تغییر آدرس مقصد اصلی در هر زمان بدون تغییر یافتن لینک کوتاه شده"
            ].map((benefit, i) => (
              <Grid size={{ xs: 12 }} key={i}>
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", p: 2, borderRadius: 2, background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ color: "#c084fc", fontWeight: "bold" }}>✓</span>
                  <Typography variant="body2" sx={{ color: "#cbd5e1" }}>{benefit}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* بخش سوالات متداول با آکاردئون‌های شیک و خوانا در محیط تیره */}
        <Box component="section" mb={10}>
          <Typography variant="h2" align="center" sx={{ fontSize: { xs: "1.6rem", md: "2.2rem" }, fontWeight: 800, mb: 5, color: "#fff" }}>
            سوالات متداول (FAQ)
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
                <Typography fontWeight={700} sx={{ color: "#fff", pr: 1 }}>{item.q}</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ borderTop: "1px solid rgba(255,255,255,.06)", bg: "rgba(0,0,0,0.1)" }}>
                <Typography sx={{ color: "#94a3b8", lineHeight: 2, fontSize: "0.95rem" }}>{item.a}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        {/* کلاستر لینک‌های داخلی اصلاح شده با ظاهر کارت‌های تعاملی */}
        <Box component="section" id="internal-links" sx={{ mt: 6 }}>
          <Typography variant="h2" sx={{ fontSize: { xs: "1.5rem", md: "2rem" }, fontWeight: 800, mb: 4, textCenter: "center", color: "#fff" }}>
            لینک‌های مرتبط و صفحات کاربردی لس
          </Typography>
          <Grid container spacing={2}>
            {[
              { href: `${config.frontBaseUrl}/home`, title: "صفحه اصلی پلتفرم" },
              { href: `${config.frontBaseUrl}/terms`, title: "قوانین و حریم خصوصی" },
              { href: `${config.frontBaseUrl}/url-shortener`, title: "کوتاه کننده لینک با API برای برنامه‌نویسان" },
              { href: `${config.frontBaseUrl}/short-url-generator`, title: "کوتاه کننده لینک رایگان و سریع" },
              { href: `${config.frontBaseUrl}/tutorial`, title: "آموزش جامع کوتاه کردن لینک" },
              { href: `${config.frontBaseUrl}/faq`, title: "مرکز سوالات متداول کاربران" },
            ].map((link, idx) => (
              <Grid size={{ xs: 12, sm: 6, md: 4}} key={idx}>
                <Box
                  component="a"
                  href={link.href}
                  title={link.title}
                  sx={{
                    display: "block",
                    textDecoration: "none",
                    p: 3,
                    borderRadius: 3,
                    border: "1px solid rgba(255,255,255,0.06)",
                    transition: "all 0.3s ease-in-out",
                    backgroundColor: "rgba(255,255,255,.02)",
                    color: "#f8fafc",
                    "&:hover": {
                      borderColor: "#c084fc",
                      transform: "translateY(-4px)",
                      backgroundColor: "rgba(168,85,247,0.08)",
                    },
                  }}
                >
                  <Typography variant="h3" sx={{ fontSize: "1.05rem", fontWeight: 700, mb: 1 }}>{link.title}</Typography>
                  <Typography variant="body2" sx={{ color: "#94a3b8" }}>مشاهده اطلاعات و دسترسی به صفحه آدرس {link.title}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

      </Container>
    </Box>
  );
};

export default ShortUrlGeneratorPage;