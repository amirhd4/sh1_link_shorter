import React from "react";
import { Container, Typography, Box, List, ListItem } from "@mui/material";
import {Metadata} from "next";
import Image from "next/image";
import config from "@/config";

export const metadata: Metadata = {
  title: "کوتاه‌کننده لینک حرفه‌ای و امن | لِس",
  description:
    "کوتاه‌کننده لینک لِس سریع، امن و بدون تبلیغات است. لینک‌های بلند خود را کوتاه کنید و با امکانات پیشرفته ردیابی، کسب درآمد و مدیریت آسان استفاده کنید.",
  keywords: "کوتاه کننده لینک, کوتاه کردن لینک, ردیابی لینک, لینک کوتاه حرفه ای, لینک محافظت شده, لِس",
  alternates: { canonical: `${config.frontBaseUrl}/link-shortener` },
};

const faqItems = [
  {
    q: "کوتاه‌کننده لینک چیست؟",
    a: "سرویس آنلاین تبدیل لینک بلند به کوتاه و قابل اشتراک‌گذاری با امکانات ردیابی و محافظت.",
  },
  {
    q: "مزایای کوتاه کردن لینک چیست؟",
    a: "ظاهر حرفه‌ای لینک، آسان‌تر شدن اشتراک‌گذاری، افزایش نرخ کلیک و امکان کسب درآمد از لینک‌ها.",
  },
  {
    q: "آیا می‌توان لینک‌ها را با رمز محافظت کرد؟",
    a: "بله، لِس امکان ایجاد لینک محافظت‌شده با رمز عبور را فراهم می‌کند.",
  },
  {
    q: "آیا دامنه اختصاصی قابل استفاده است؟",
    a: "کاربران می‌توانند دامنه اختصاصی خود را به لینک‌ها متصل کنند و تجربه برندینگ حرفه‌ای داشته باشند.",
  },
];

const LinkShortenerPage: React.FC = () => {
  return (
    <Container sx={{ py: 8 }}>
      {/* JSON-LD FAQ */}
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
          <a href={`${config.frontBaseUrl}/home`} style={{ textDecoration: "none" }}>خانه</a> &gt; <a href={`${config.frontBaseUrl}/link-shortener`} style={{ textDecoration: "none" }}>کوتاه کننده لینک حرفه ای</a>
        </Typography>
      </Box>
 <Box mb={4} display="flex" justifyContent="center">
        <Image
          src="/images/url-shortener-seo.webp"
          alt="بهترین کوتاه‌کننده لینک ایران | l1s"
          width={1200}
          height={630}
          priority
        />
      </Box>
      <Typography variant="h3" mb={3}>کوتاه‌کننده لینک حرفه‌ای لِس</Typography>
      <Typography mb={2}>
        با سرویس لس، لینک‌های طولانی و پیچیده خود را به لینک کوتاه، زیبا و قابل اشتراک‌گذاری تبدیل کنید. از امنیت، سرعت و امکانات پیشرفته ما بهره‌مند شوید.
      </Typography>
      <Typography mb={2}>
        ویژگی‌های برجسته شامل: ردیابی دقیق کلیک‌ها، لینک‌های محافظت‌شده با رمز، دامنه اختصاصی، امکان کسب درآمد و مدیریت آسان لینک‌ها.
      </Typography>

      <Box mt={4}>
        <Typography variant="h5" mb={2}>چطور لینک خود را کوتاه کنیم؟</Typography>
        <List>
          <ListItem>- لینک بلند را وارد کنید.</ListItem>
          <ListItem>- دکمه کوتاه‌کن را فشار دهید.</ListItem>
          <ListItem>- لینک کوتاه خود را کپی و استفاده کنید.</ListItem>
          <ListItem>- از امکانات پیشرفته مانند ردیابی و محافظت با رمز استفاده کنید.</ListItem>
        </List>
      </Box>

      <Box mt={4}>
        <Typography variant="h5" mb={2}>چرا لس بهترین انتخاب است؟</Typography>
        <Typography mb={1}>1. تجربه کاربری ساده و بدون تبلیغات</Typography>
        <Typography mb={1}>2. قابلیت ردیابی دقیق و آمار لحظه‌ای</Typography>
        <Typography mb={1}>3. پشتیبانی از دامنه اختصاصی و برندینگ حرفه‌ای</Typography>
        <Typography mb={1}>4. امنیت بالا و امکان رمزگذاری لینک‌ها</Typography>
        <Typography mb={1}>5. کسب درآمد از لینک‌ها با قابلیت اشتراک‌گذاری عمومی</Typography>
      </Box>

      <Box mt={4}>
        <Typography variant="h5" mb={2}>سوالات متداول</Typography>
        <List>
          <ListItem>آیا کوتاه کردن لینک رایگان است؟ بله، پلن رایگان با امکانات پایه در دسترس است.</ListItem>
          <ListItem>آیا می‌توان لینک‌ها را حذف کرد؟ بله، مدیریت کامل لینک‌ها با امکان حذف و ویرایش وجود دارد.</ListItem>
          <ListItem>چند لینک می‌توانم در ماه ایجاد کنم؟ محدودیت‌ها بسته به پلن انتخابی متفاوت است.</ListItem>
          <ListItem>آیا لینک‌ها امن هستند؟ تمامی لینک‌ها با استاندارد HTTPS و محافظت رمزگذاری می‌شوند.</ListItem>
        </List>
      </Box>
        <section id="internal-links" style={{ marginTop: "2rem" }}>
  <Typography variant="h4" mb={3}>لینک‌های مرتبط و مفید</Typography>
  <Box display="flex" flexWrap="wrap" gap={2}>
    {[
      { href: `${config.frontBaseUrl}/home`, title: "صفحه اصلی" },
      { href: `${config.frontBaseUrl}/short-url-generator`, title: "تولید کننده لینک کوتاه" },
      { href: `${config.frontBaseUrl}/free-url-shortener`, title: "کوتاه کننده لینک رایگان" },
      { href: `${config.frontBaseUrl}/url-shortener`, title: "کوتاه کننده لینک با API" },
    ].map((link, idx) => (
      <Box
        key={idx}
        component="a"
        href={link.href}
        title={link.title}
        sx={{
          textDecoration: "none",
          width: { xs: "100%", sm: "calc(50% - 8px)", md: "calc(50% - 8px)" },
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

export default LinkShortenerPage;
