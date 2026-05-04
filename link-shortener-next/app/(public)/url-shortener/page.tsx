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
  alternates: { canonical: "https://a.l1s.ir/url-shortener" },
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


const examples = [
  {
    label: "لینک ساده",
    code: `curl -X POST "https://l1s.ir/api/v1/shorten" \\\n  -H "Api-Key: sk_your_api_key_here" \\\n  -H "Content-Type: application/json" \\\n  -d "{\\"long_url\\":\\"https://example.com\\"}"`,
    response: `{
  "long_url": "https://example.com",
  "short_url": "https://l1s.ir/Ab12Xy"
}`,
  },
  {
    label: "دامنه اختصاصی + UTM",
    code: `curl -X POST "https://l1s.ir/api/v1/shorten" \\\n  -H "Api-Key: sk_your_api_key_here" \\\n  -H "Content-Type: application/json" \\\n  -d "{\\"long_url\\":\\"https://example.com/project\\",\\"domain_id\\":42,\\"utm_source\\":\\"twitter\\",\\"utm_medium\\":\\"social\\",\\"utm_campaign\\":\\"launch\\"}"`,
    response: `{
  "long_url": "https://example.com/project",
  "short_url": "https://customdomain.com/Xy12Ab"
}`,
  },
  {
    label: "لینک محافظت‌شده با رمز 🔒",
    code: `curl -X POST "https://l1s.ir/api/v1/shorten" \\\n  -H "Api-Key: sk_your_api_key_here" \\\n  -H "Content-Type: application/json" \\\n  -d "{\\"long_url\\":\\"https://example.com/secret\\",\\"password\\":\\"mypassword123\\"}"`,
    response: `{
  "long_url": "https://example.com/secret",
  "short_url": "https://l1s.ir/SeCrEt1"
}`,
  },
  {
    label: "لینک با تبلیغات و No-Ads",
    code: `curl -X POST "https://l1s.ir/api/v1/shorten" \\\n  -H "Api-Key: sk_your_api_key_here" \\\n  -H "Content-Type: application/json" \\\n  -d "{\\"long_url\\":\\"https://example.com/offer\\",\\"show_ads\\":false}"`,
    response: `{
  "long_url": "https://example.com/offer",
  "short_url": "https://l1s.ir/Xy12NoAds"
}`,
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
{/* Breadcrumb */}
      <Box mb={4}>
        <Typography variant="h6" color="textSecondary">
          <a href="https://a.l1s.ir/home" style={{ textDecoration: "none" }}>خانه</a> &gt; <a href="https://a.l1s.ir/url-shortener" style={{ textDecoration: "none" }}>API کوتاه‌کننده لینک</a>
        </Typography>
      </Box>
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

<Link href="/login" passHref>
  <Button variant="outlined" color="secondary">
استفاده رایگان | ورود
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
        {examples.map((ex, idx) => (
          <Box key={idx} mb={3}>
            <Typography variant="subtitle1" mb={1}>{ex.label}</Typography>
            <Typography component="pre" sx={{ background: "#f5f5f5", p: 2, borderRadius: 1, overflowX: "auto" }}>
              {ex.code}
            </Typography>
            <Typography component="pre" sx={{ background: "#e0f7fa", p: 2, borderRadius: 1, overflowX: "auto", mt: 1 }}>
              {ex.response}
            </Typography>
          </Box>
        ))}
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
<section id="internal-links" style={{ marginTop: "2rem" }}>
  <Typography variant="h4" mb={3}>لینک‌های مرتبط و مفید</Typography>
  <Box display="flex" flexWrap="wrap" gap={2}>
    {[
      { href: "https://a.l1s.ir/home", title: "صفحه اصلی" },
      { href: "https://a.l1s.ir/short-url-generator", title: "تولید کننده لینک کوتاه" },
      { href: "https://a.l1s.ir/free-url-shortener", title: "کوتاه کننده لینک رایگان" },
      { href: "https://a.l1s.ir/terms", title: "حریم خصوصی و قوانین" },
      { href: "https://a.l1s.ir/best-url-shortener", title: "بهترین کوتاه کننده لینک" },
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

export default ApiUrlShortenerPage;
