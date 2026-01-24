import React from "react";
import { Container, Typography, Box, List, ListItem, Button, Stack } from "@mui/material";
import Link from "next/link";
import {Metadata} from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "API کوتاه‌کننده لینک | لس",
  description:
    "با API امن لس لینک کوتاه بسازید. پشتیبانی از دامنه اختصاصی، ردیابی UTM، No-Ads و لینک محافظت‌شده. مناسب توسعه‌دهندگان و برنامه‌نویسان ایرانی.",
  keywords:
    "API کوتاه‌کننده لینک, کوتاه کردن لینک با API, لینک کوتاه برنامه نویسی, URL shortener API, لینک کوتاه امن",
  alternates: { canonical: "https://a.l1s.ir/api/url-shortener" },
};

const faqItems = [
  {
    q: "API کوتاه‌کننده لینک لس چیست؟",
    a: "API کوتاه‌کننده لینک لس به توسعه‌دهندگان امکان می‌دهد لینک‌های بلند را به لینک کوتاه و قابل اشتراک‌گذاری تبدیل کنند و امکانات پیشرفته مانند ردیابی کلیک، دامنه اختصاصی و لینک محافظت‌شده را ارائه می‌دهد.",
  },
  {
    q: "چگونه از API لس استفاده کنم؟",
    a: "برای استفاده از API، ابتدا Api-Key دریافت کنید، سپس درخواست POST با لینک بلند و تنظیمات مورد نظر به Endpoint API ارسال کنید تا لینک کوتاه دریافت شود.",
  },
  {
    q: "آیا استفاده از API نیاز به ثبت‌نام دارد؟",
    a: "بله، دریافت Api-Key نیازمند ثبت‌نام و ورود به حساب کاربری لس است. ولی کوتاه کردن لینک معمولی بدون ثبت‌نام امکان‌پذیر است.",
  },
  {
    q: "آیا می‌توان لینک‌ها را با رمز محافظت کرد؟",
    a: "بله، هنگام ایجاد لینک از طریق API می‌توانید رمز عبور تعیین کنید تا تنها کاربران دارای رمز به لینک دسترسی داشته باشند.",
  },
];

const ApiUrlShortenerPage: React.FC = () => {
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

      <Typography component="h1" variant="h3" mb={3}>
  API کوتاه‌کننده لینک حرفه‌ای | لس
</Typography>


      <Typography mb={2} sx={{ lineHeight: 1.8 }}>
        توسعه‌دهندگان می‌توانند با API امن و حرفه‌ای لس، لینک‌های بلند خود را به لینک‌های کوتاه و قابل اشتراک‌گذاری تبدیل کنند. این API امکانات پیشرفته‌ای برای کسب‌وکارها، بازاریابی دیجیتال و توسعه اپلیکیشن‌ها ارائه می‌دهد.
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={4}>
        <Link href="/register" passHref>
  <Button variant="contained" color="primary">
    ثبت‌نام و دریافت Api-Key
  </Button>
</Link>

<Link href="/short-url-generator" passHref>
  <Button variant="outlined" color="secondary">
    استفاده رایگان بدون ثبت‌نام
  </Button>
</Link>

      </Stack>

        <Image
  src="/images/api-url-shortener-diagram.webp"
  alt="API کوتاه‌کننده لینک لس برای توسعه‌دهندگان با دامنه اختصاصی و UTM"
  width={1000}
  height={520}
  loading="lazy"
  style={{ borderRadius: 12, margin: "24px 0" }}
/>


      <Typography variant="h5" mb={2}>ویژگی‌های کلیدی API لس</Typography>
      <List>
        <ListItem>ایجاد لینک کوتاه با امنیت بالا و رمزگذاری HTTPS</ListItem>
        <ListItem>امکان استفاده از دامنه اختصاصی برای برندینگ لینک‌ها</ListItem>
        <ListItem>پشتیبانی از ردیابی UTM و تحلیل کمپین‌های بازاریابی</ListItem>
        <ListItem>حذف تبلیغات مزاحم و ارائه لینک‌های تمیز</ListItem>
        <ListItem>لینک‌های محافظت‌شده با رمز برای امنیت بیشتر</ListItem>
        <ListItem>دسترسی سریع و آسان با استفاده از Api-Key</ListItem>
      </List>

      <Box my={4}>
        <Typography variant="h5" mb={2}>چگونه از API استفاده کنیم؟</Typography>
        <List>
          <ListItem>۱. ثبت‌نام و دریافت Api-Key از داشبورد لس.</ListItem>
          <ListItem>۲. ارسال درخواست POST به Endpoint API با لینک بلند و تنظیمات مورد نظر.</ListItem>
          <ListItem>۳. دریافت لینک کوتاه در پاسخ API.</ListItem>
          <ListItem>۴. (اختیاری) محافظت لینک با رمز عبور یا تنظیمات پیشرفته دیگر.</ListItem>
          <ListItem>۵. مشاهده و مدیریت لینک‌ها و آمار کلیک‌ها از طریق داشبورد.</ListItem>
        </List>
      </Box>

      <Box my={4}>
        <Typography variant="h5" mb={2}>نمونه کد استفاده از API</Typography>
        <Typography component="pre" sx={{ background: "#f5f5f5", p: 2, borderRadius: 1, overflowX: "auto" }}>
{`POST https://api.l1s.ir/v1/shorten
Headers:
  Authorization: Bearer YOUR_API_KEY
Body:
{
  "long_url": "https://example.com/very-long-link",
  "custom_alias": "myshortlink",
  "password": "12345",
  "utm": {
    "source": "newsletter",
    "medium": "email",
    "campaign": "launch"
  }
}`}
        </Typography>
      </Box>

      <Box my={4}>
        <Typography variant="h5" mb={2}>مزایای استفاده از API برای توسعه‌دهندگان</Typography>
        <List>
          <ListItem>ادغام سریع و آسان در اپلیکیشن‌ها و وب‌سایت‌ها</ListItem>
          <ListItem>مدیریت لینک‌ها و آمارها به صورت برنامه‌ریزی‌شده</ListItem>
          <ListItem>امنیت بالا و کنترل دسترسی با Api-Key</ListItem>
          <ListItem>پشتیبانی از دامنه اختصاصی برای لینک‌های برندینگ</ListItem>
          <ListItem>ایده‌آل برای بازاریابی دیجیتال و کمپین‌های تبلیغاتی</ListItem>
        </List>
      </Box>

      <Box my={4}>
        <Typography variant="h5" mb={2}>سوالات متداول</Typography>
        <List>
          <ListItem>آیا استفاده از API نیاز به ثبت‌نام دارد؟ بله، ابتدا باید حساب کاربری لس داشته باشید و Api-Key دریافت کنید.</ListItem>
          <ListItem>آیا می‌توان لینک‌ها را حذف یا ویرایش کرد؟ بله، این امکانات از طریق API یا داشبورد فراهم است.</ListItem>
          <ListItem>آیا محدودیت درخواست وجود دارد؟ بله، محدودیت نرخ درخواست برای امنیت و پایداری سرویس اعمال می‌شود.</ListItem>
          <ListItem>آیا امکان ردیابی کلیک‌ها وجود دارد؟ بله، گزارش کامل کلیک‌ها، موقعیت جغرافیایی و منابع ارجاع در دسترس است.</ListItem>
        </List>
      </Box>

        <Typography mt={6} align="center">
  برای شروع استفاده از <strong>API کوتاه‌کننده لینک لس</strong>،
  <Link href="/register">ثبت‌نام کنید</Link> و Api-Key دریافت کنید.
</Typography>

    </Container>
  );
};

export default ApiUrlShortenerPage;
