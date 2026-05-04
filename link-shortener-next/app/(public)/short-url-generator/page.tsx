import React from "react";
import { Container, Typography, Box, List, ListItem } from "@mui/material";
import Image from "next/image";
import {Metadata} from "next";

export const metadata: Metadata = {
  title: "تولیدکننده لینک کوتاه | لس",
  description:
    "با ابزار تولیدکننده لینک کوتاه لس، لینک‌های بلند خود را سریع و آسان به لینک کوتاه تبدیل کنید. امکانات پیشرفته، امنیت بالا و مشاهده آمار کلیک‌ها.",
  keywords:
    "تولید لینک کوتاه, کوتاه کننده لینک آنلاین, لینک کوتاه سریع, لینک کوتاه امن, ابزار لینک کوتاه",
  alternates: { canonical: "https://a.l1s.ir/short-url-generator" },
};

const faqItems = [
  {
    q: "تولیدکننده لینک کوتاه چیست؟",
    a: "ابزاری آنلاین برای تبدیل لینک‌های بلند به لینک کوتاه، زیبا و قابل اشتراک‌گذاری با امکانات حرفه‌ای و آمار دقیق کلیک‌ها.",
  },
  {
    q: "مزایای استفاده از تولیدکننده لینک کوتاه چیست؟",
    a: "اشتراک‌گذاری آسان لینک، ظاهر حرفه‌ای، ردیابی کلیک‌ها و امکان افزودن رمز عبور و دامنه اختصاصی.",
  },
  {
    q: "آیا این ابزار رایگان است؟",
    a: "بله، لس امکان کوتاه کردن لینک‌ها را بدون ثبت‌نام و بدون تبلیغات مزاحم فراهم می‌کند.",
  },
];

const ShortUrlGeneratorPage: React.FC = () => {
  return (
    <Container sx={{ py: 8 }}>
      {/* JSON-LD برای FAQ */}
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
{/* Breadcrumb */}
      <Box mb={4}>
        <Typography variant="h6" color="textSecondary">
          <a href="https://a.l1s.ir/home" style={{ textDecoration: "none" }}>خانه</a> &gt; <a href="https://a.l1s.ir/short-url-generator" style={{ textDecoration: "none" }}>تولید کننده لینک کوتاه</a>
        </Typography>
      </Box>
         <Box mb={4} display="flex" justifyContent="center">
        <Image
          src="/images/url-shortener-seo.webp"
          alt="بهترین کوتاه‌کننده لینک ایران | لس"
          width={1200}
          height={630}
          priority
        />
      </Box>

      <Typography variant="h3" mb={3}>تولیدکننده لینک کوتاه لس</Typography>
      <Typography mb={2}>
        با ابزار آنلاین تولیدکننده لینک کوتاه لس، لینک‌های طولانی و پیچیده خود را به لینک کوتاه، زیبا و قابل اشتراک‌گذاری تبدیل کنید. این ابزار مناسب شبکه‌های اجتماعی، پیام‌رسان‌ها و کمپین‌های تبلیغاتی است.
      </Typography>

      <Box mb={4}>
        <Typography variant="h5" mb={2}>ویژگی‌های کلیدی تولیدکننده لینک کوتاه</Typography>
        <List>
          <ListItem>تبدیل سریع لینک‌های بلند به لینک کوتاه در چند ثانیه</ListItem>
          <ListItem>قابلیت استفاده از دامنه اختصاصی برای برندینگ لینک‌ها</ListItem>
          <ListItem>امکان افزودن رمز عبور برای محافظت از لینک‌ها</ListItem>
          <ListItem>ردیابی آمار کلیک‌ها به صورت دقیق و لحظه‌ای</ListItem>
          <ListItem>بدون تبلیغات مزاحم و بدون نیاز به ثبت‌نام</ListItem>
          <ListItem>پشتیبانی از لینک‌های کوتاه برای شبکه‌های اجتماعی و پیام‌رسان‌ها</ListItem>
        </List>
      </Box>

      <Box mb={4}>
        <Typography variant="h5" mb={2}>چگونه لینک کوتاه بسازیم؟</Typography>
        <Typography mb={1}>1. لینک بلند خود را در باکس ابزار وارد کنید.</Typography>
        <Typography mb={1}>2. (اختیاری) رمز عبور یا نام مستعار دلخواه را تعیین کنید.</Typography>
        <Typography mb={1}>3. دکمه «کوتاه کن» را فشار دهید.</Typography>
        <Typography mb={1}>4. لینک کوتاه تولید شده را کپی و استفاده کنید.</Typography>
        <Typography mb={1}>5. آمار کلیک‌ها و عملکرد لینک را از داشبورد مشاهده کنید.</Typography>
      </Box>

      <Box mb={4}>
        <Typography variant="h5" mb={2}>مزایای استفاده از لینک کوتاه</Typography>
        <List>
          <ListItem>ظاهر حرفه‌ای و قابل اعتماد لینک‌ها</ListItem>
          <ListItem>اشتراک‌گذاری آسان در شبکه‌های اجتماعی و پیام‌رسان‌ها</ListItem>
          <ListItem>کنترل بهتر روی لینک‌ها با رمز و دامنه اختصاصی</ListItem>
          <ListItem>ردیابی و تحلیل کمپین‌های بازاریابی و تبلیغاتی</ListItem>
          <ListItem>صرفه‌جویی در فضا و کاهش طول لینک‌ها برای بازاریابی دیجیتال</ListItem>
        </List>
      </Box>

      <Box mb={4}>
        <Typography variant="h5" mb={2}>سوالات متداول</Typography>
        <List>
          <ListItem>آیا ابزار نیاز به ثبت‌نام دارد؟ خیر، می‌توانید بدون ثبت‌نام لینک کوتاه بسازید.</ListItem>
          <ListItem>آیا امکان اضافه کردن رمز عبور وجود دارد؟ بله، هنگام ایجاد لینک می‌توانید رمز عبور تعیین کنید.</ListItem>
          <ListItem>آیا می‌توان لینک‌ها را با دامنه اختصاصی ایجاد کرد؟ بله، این قابلیت برای برندینگ لینک‌ها موجود است.</ListItem>
          <ListItem>آیا لینک‌ها قابل ردیابی هستند؟ بله، آمار کلیک‌ها و عملکرد لینک به صورت دقیق ارائه می‌شود.</ListItem>
        </List>
      </Box>

        <section id="internal-links" style={{ marginTop: "2rem" }}>
  <Typography variant="h4" mb={3}>لینک‌های مرتبط و مفید</Typography>
  <Box display="flex" flexWrap="wrap" gap={2}>
    {[
      { href: "https://a.l1s.ir/home", title: "صفحه اصلی" },
      { href: "https://a.l1s.ir/terms", title: "حریم خصوصی قوانین" },
      { href: "https://a.l1s.ir/url-shortener", title: "کوتاه کننده لینک با API" },
      { href: "https://a.l1s.ir/free-url-shortener", title: "کوتاه کننده لینک رایگان" },
      { href: "https://a.l1s.ir/best-url-shortener", title: "بهترین کوتاه کننده لینک" },
      { href: "https://a.l1s.ir/faq", title: "سوالات متداول" },
    ].map((link, idx) => (
      <Box
        key={idx}
        component="a"
        href={link.href}
        title={link.title}
        sx={{
          textDecoration: "none",
          width: { xs: "100%", sm: "calc(50% - 8px)", md: "calc(33.33% - 8px)" },
          p: 2,
          borderRadius: 2,
          boxShadow: 1,
          transition: "all 0.3s",
          backgroundColor: "background.paper",
          "&:hover": {
            boxShadow: 4,
            transform: "translateY(-4px)",
            backgroundColor: "primary.light",
            color: "white"
          },
        }}
      >
        <Typography variant="h6">{link.title}</Typography>
      </Box>
    ))}
  </Box>
</section>


    </Container>
  );
};

export default ShortUrlGeneratorPage;
