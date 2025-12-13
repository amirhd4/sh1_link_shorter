import React from "react";
import { Helmet } from "react-helmet-async";
import { Container, Typography, Box, List, ListItem } from "@mui/material";

const ShortUrlGeneratorPage: React.FC = () => {
  return (
    <Container sx={{ py: 8 }}>
      <Helmet>
        <title>تولیدکننده لینک کوتاه | لس</title>
        <meta
          name="description"
          content="با ابزار تولیدکننده لینک کوتاه لس، لینک‌های بلند خود را سریع و آسان به لینک کوتاه تبدیل کنید. امکانات پیشرفته، امنیت بالا و مشاهده آمار کلیک‌ها."
        />
        <meta
          name="keywords"
          content="تولید لینک کوتاه, کوتاه کننده لینک آنلاین, لینک کوتاه سریع, لینک کوتاه امن, ابزار لینک کوتاه"
        />
        <link rel="canonical" href="https://l1s.ir/short-url-generator" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "تولیدکننده لینک کوتاه چیست؟",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "ابزاری آنلاین برای تبدیل لینک‌های بلند به لینک کوتاه، زیبا و قابل اشتراک‌گذاری با امکانات حرفه‌ای و آمار دقیق کلیک‌ها."
                }
              },
              {
                "@type": "Question",
                name: "مزایای استفاده از تولیدکننده لینک کوتاه چیست؟",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "اشتراک‌گذاری آسان لینک، ظاهر حرفه‌ای، ردیابی کلیک‌ها و امکان افزودن رمز عبور و دامنه اختصاصی."
                }
              },
              {
                "@type": "Question",
                name: "آیا این ابزار رایگان است؟",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "بله، لس امکان کوتاه کردن لینک‌ها را بدون ثبت‌نام و بدون تبلیغات مزاحم فراهم می‌کند."
                }
              }
            ]
          })}
        </script>
      </Helmet>

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
    </Container>
  );
};

export default ShortUrlGeneratorPage;
