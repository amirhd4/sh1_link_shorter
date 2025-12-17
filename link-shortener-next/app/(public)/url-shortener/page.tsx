import React from "react";
import { Helmet } from "react-helmet-async";
import { Container, Typography, Box, List, ListItem, Button, Stack } from "@mui/material";
import Link from "next/link";

const ApiUrlShortenerPage: React.FC = () => {
  return (
    <Container sx={{ py: 8 }}>
      <Helmet>
        <title>API کوتاه‌کننده لینک | لس</title>
        <meta
          name="description"
          content="با API امن لس لینک کوتاه بسازید. پشتیبانی از دامنه اختصاصی، ردیابی UTM، No-Ads و لینک محافظت‌شده. مناسب توسعه‌دهندگان و برنامه‌نویسان ایرانی."
        />
        <meta
          name="keywords"
          content="API کوتاه‌کننده لینک, کوتاه کردن لینک با API, لینک کوتاه برنامه نویسی, URL shortener API, لینک کوتاه امن"
        />
        <link rel="canonical" href="https://a.l1s.ir/api/url-shortener" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "API کوتاه‌کننده لینک لس چیست؟",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "API کوتاه‌کننده لینک لس به توسعه‌دهندگان امکان می‌دهد لینک‌های بلند را به لینک کوتاه و قابل اشتراک‌گذاری تبدیل کنند و امکانات پیشرفته مانند ردیابی کلیک، دامنه اختصاصی و لینک محافظت‌شده را ارائه می‌دهد."
                }
              },
              {
                "@type": "Question",
                name: "چگونه از API لس استفاده کنم؟",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "برای استفاده از API، ابتدا Api-Key دریافت کنید، سپس درخواست POST با لینک بلند و تنظیمات مورد نظر به Endpoint API ارسال کنید تا لینک کوتاه دریافت شود."
                }
              },
              {
                "@type": "Question",
                name: "آیا استفاده از API نیاز به ثبت‌نام دارد؟",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "بله، دریافت Api-Key نیازمند ثبت‌نام و ورود به حساب کاربری لس است. ولی کوتاه کردن لینک معمولی بدون ثبت‌نام امکان‌پذیر است."
                }
              },
              {
                "@type": "Question",
                name: "آیا می‌توان لینک‌ها را با رمز محافظت کرد؟",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "بله، هنگام ایجاد لینک از طریق API می‌توانید رمز عبور تعیین کنید تا تنها کاربران دارای رمز به لینک دسترسی داشته باشند."
                }
              }
            ]
          })}
        </script>
      </Helmet>

      <Typography variant="h3" mb={3}>API کوتاه‌کننده لینک لِس</Typography>
      <Typography mb={2} sx={{ lineHeight: 1.8 }}>
        توسعه‌دهندگان می‌توانند با API امن و حرفه‌ای لس، لینک‌های بلند خود را به لینک‌های کوتاه و قابل اشتراک‌گذاری تبدیل کنند. این API امکانات پیشرفته‌ای برای کسب‌وکارها، بازاریابی دیجیتال و توسعه اپلیکیشن‌ها ارائه می‌دهد.
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={4}>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          href="/register"
        >
          ثبت‌نام و دریافت Api-Key
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          component={Link}
          href="/short-url-generator"
        >
          استفاده رایگان بدون ثبت‌نام
        </Button>
      </Stack>

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
    </Container>
  );
};

export default ApiUrlShortenerPage;
