import React from "react";
import Image from "next/image";
import { Container, Typography, Box, List, ListItem } from "@mui/material";
import { Metadata } from "next";

// Metadata + SEO
export const metadata: Metadata = {
  title: "بهترین کوتاه‌کننده لینک ایران | لس",
  description: "لس (l1s) به عنوان بهترین کوتاه‌کننده لینک ایران، سرعت، امنیت، رابط کاربری عالی و امکانات حرفه‌ای ارائه می‌دهد.",
  keywords: "بهترین کوتاه‌کننده لینک, کوتاه‌کننده لینک ایران, لینک کوتاه سریع, لینک کوتاه امن, سرویس لینک حرفه‌ای",
  alternates: { canonical: "https://a.l1s.ir/best-url-shortener" },
  openGraph: {
    title: "بهترین کوتاه‌کننده لینک ایران | لس",
    description: "لس با رابط کاربری فارسی، سرعت بالا و امنیت عالی بهترین تجربه کوتاه کردن لینک را ارائه می‌دهد.",
    url: "https://a.l1s.ir/best-url-shortener",
    images: [
      {
        url: "/images/best-url-shortener.webp",
        width: 1200,
        height: 630,
        alt: "API کوتاه‌کننده لینک حرفه‌ای لس",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "بهترین کوتاه‌کننده لینک ایران | لس",
    description: "لس با رابط کاربری فارسی، سرعت بالا و امنیت عالی بهترین تجربه کوتاه کردن لینک را ارائه می‌دهد.",
    images: ["/images/best-url-shortener.webp"],
  },
};

const faqItems = [
  {
    q: "چرا لس (l1s) بهترین کوتاه‌کننده لینک است؟",
    a: "لس تجربه‌ای حرفه‌ای، سریع و امن برای کوتاه کردن لینک‌ها ارائه می‌دهد، بدون تبلیغات مزاحم و با امکانات پیشرفته ردیابی و محافظت با رمز."
  },
  {
    q: "آیا لس برای کاربران ایرانی بهینه است؟",
    a: "بله، با سرورهای داخلی و رابط کاربری فارسی تجربه‌ای سریع و بدون مشکل ارائه می‌دهد."
  },
];

const BestUrlShortenerPage: React.FC = () => {
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
          <a href="https://a.l1s.ir/home" style={{ textDecoration: "none" }}>خانه</a> &gt; <a href="https://a.l1s.ir/best-url-shortener" style={{ textDecoration: "none" }}>بهترین کوتاه کننده لینک ایران</a>
        </Typography>
      </Box>
      {/* تصویر سئو */}
      <Box mb={4} display="flex" justifyContent="center">
        <Image
          src="/images/best-url-shortener.webp"
          alt="بهترین کوتاه‌کننده لینک ایران | لس"
          width={1200}
          height={630}
          priority
        />
      </Box>

      <Typography variant="h3" mb={3}>بهترین کوتاه‌کننده لینک ایران</Typography>
      <Typography mb={2}>
        لس با سرعت بالا، رابط کاربری روان و امکانات حرفه‌ای، بهترین تجربه کوتاه کردن لینک را به کاربران ایرانی ارائه می‌دهد. این سرویس مناسب بازاریابی دیجیتال، شبکه‌های اجتماعی و اشتراک‌گذاری لینک‌ها است. همچنین قابلیت bio link page نیز بصورت رایگان در دسترس قرار دارد.
      </Typography>
      <Typography mb={2}>
        ویژگی‌ها: بدون تبلیغات مزاحم، دامنه اختصاصی، لینک محافظت‌شده با رمز، آمار دقیق کلیک‌ها و امکان ردیابی کاربران به صورت کامل. قابلیت ایجاد لینک در بیو (لینک بیو).
      </Typography>

      <Box mb={4}>
        <Typography variant="h5" mb={2}>مزایای استفاده از لس</Typography>
        <List>
          <ListItem>تبدیل لینک‌های بلند به لینک‌های کوتاه، زیبا و حرفه‌ای</ListItem>
          <ListItem>امکان استفاده از دامنه اختصاصی برای برندینگ لینک‌ها</ListItem>
          <ListItem>امنیت بالا و رمزگذاری HTTPS برای تمامی لینک‌ها</ListItem>
          <ListItem>رابط کاربری ساده و روان، مناسب تمامی کاربران</ListItem>
          <ListItem>ردیابی کامل کلیک‌ها، آی‌پی‌ها و منابع ارجاع</ListItem>
          <ListItem>بدون تبلیغات مزاحم و بدون نیاز به ثبت‌نام برای شروع</ListItem>
        </List>
      </Box>

      <Box mb={4}>
        <Typography variant="h5" mb={2}>چطور لینک خود را کوتاه کنیم؟</Typography>
        <List>
          <ListItem>لینک بلند خود را وارد کنید.</ListItem>
          <ListItem>دکمه "کوتاه‌کن" را فشار دهید.</ListItem>
          <ListItem>لینک کوتاه‌شده نمایش داده می‌شود و می‌توانید آن را کپی کنید.</ListItem>
          <ListItem>در صورت تمایل، لینک را با رمز محافظت کنید.</ListItem>
          <ListItem>آمار کلیک‌ها را در داشبورد مشاهده کنید.</ListItem>
        </List>
      </Box>

      <Box mb={4}>
        <Typography variant="h5" mb={2}>سوالات متداول</Typography>
        <List>
          {faqItems.map((faq, idx) => (
            <ListItem key={idx}>{faq.a}</ListItem>
          ))}
        </List>
      </Box>

<section id="internal-links">
  <Typography variant="h4" mb={3}>لینک‌های مفید کوتاه‌کننده لینک</Typography>
  <Box display="flex" flexWrap="wrap" gap={2}>
    {[
      { href: "https://a.l1s.ir/home", title: "صفحه اصلی" },
      { href: "https://a.l1s.ir/terms", title: "حریم خصوصی و قوانین" },
      { href: "https://a.l1s.ir/url-shortener", title: "کوتاه کننده لینک با API" },
      { href: "https://a.l1s.ir/free-url-shortener", title: "کوتاه کننده لینک رایگان" },
      { href: "https://a.l1s.ir/short-url-generator", title: "تولید کننده لینک کوتاه" },
      { href: "https://a.l1s.ir/bio-link", title: "بیو لینک (لینک در بیو)" },
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

<section id="backlink" style={{ marginTop: "2rem" }}>
  <Typography variant="h4" mb={2}>مقاله مرتبط در ویرگول</Typography>
  <Box
    component="a"
    href="https://vrgl.ir/CNVZN"
    target="_blank"
    rel="noopener noreferrer"
    sx={{
      display: "block",
      p: 3,
      borderRadius: 2,
      boxShadow: 1,
      textDecoration: "none",
      backgroundColor: "secondary.light",
      color: "text.primary",
      transition: "all 0.3s",
      "&:hover": {
        boxShadow: 4,
        transform: "translateY(-4px)",
        backgroundColor: "secondary.main",
        color: "white",
      },
    }}
  >
    <Typography variant="h6">مقاله کوتاه کننده لینک در ویرگول</Typography>
    <Typography>برای اطلاعات بیشتر درباره کوتاه کردن لینک‌ها می‌توانید این مقاله را بخوانید.</Typography>
  </Box>
</section>



    </Container>

  );
};

export default BestUrlShortenerPage;
