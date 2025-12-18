import React from "react";
import { Container, Typography, Box, List, ListItem } from "@mui/material";
import {Metadata} from "next";

export const metadata: Metadata = {
  title: "بهترین کوتاه‌کننده لینک ایران | لس",
  description: "لس (l1s) به عنوان بهترین کوتاه‌کننده لینک ایران، سرعت، امنیت، رابط کاربری عالی و امکانات حرفه‌ای ارائه می‌دهد.",
  keywords: "بهترین کوتاه‌کننده لینک, کوتاه‌کننده لینک ایران, لینک کوتاه سریع, لینک کوتاه امن, سرویس لینک حرفه‌ای",
  alternates: { canonical: "https://a.l1s.ir/best-url-shortener" },
};

const BestUrlShortenerPage: React.FC = () => {
  return (
    <Container sx={{ py: 8 }}>
      {/* JSON-LD مستقیم در SSR */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "چرا لس (l1s) بهترین کوتاه‌کننده لینک است؟",
                acceptedAnswer: { "@type": "Answer", text: "لس تجربه‌ای حرفه‌ای، سریع و امن برای کوتاه کردن لینک‌ها ارائه می‌دهد، بدون تبلیغات مزاحم و با امکانات پیشرفته ردیابی و محافظت با رمز." }
              },
              {
                "@type": "Question",
                name: "آیا لس برای کاربران ایرانی بهینه است؟",
                acceptedAnswer: { "@type": "Answer", text: "بله، با سرورهای داخلی و رابط کاربری فارسی تجربه‌ای سریع و بدون مشکل ارائه می‌دهد." }
              },
              // بقیه FAQ
            ]
          })
        }}
      />

      <Typography variant="h3" mb={3}>بهترین کوتاه‌کننده لینک ایران</Typography>
      <Typography mb={2}>
        لس با سرعت بالا، رابط کاربری روان و امکانات حرفه‌ای، بهترین تجربه کوتاه کردن لینک را به کاربران ایرانی ارائه می‌دهد. این سرویس مناسب بازاریابی دیجیتال، شبکه‌های اجتماعی و اشتراک‌گذاری لینک‌ها است.
      </Typography>
      <Typography mb={2}>
        ویژگی‌ها: بدون تبلیغات مزاحم، دامنه اختصاصی، لینک محافظت‌شده با رمز، آمار دقیق کلیک‌ها و امکان ردیابی کاربران به صورت کامل.
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
        <Typography variant="h5" mb={2}>چرا لس بهترین گزینه برای کسب و کارهاست؟</Typography>
        <Typography mb={1}>
          - بازاریابی دیجیتال: استفاده از لینک کوتاه و قابل برندینگ برای کمپین‌های تبلیغاتی.
        </Typography>
        <Typography mb={1}>
          - شبکه‌های اجتماعی: اشتراک‌گذاری لینک کوتاه و مشاهده آمار کلیک‌ها.
        </Typography>
        <Typography mb={1}>
          - امنیت و کنترل: محافظت لینک‌ها با رمز و مشاهده فعالیت کاربران.
        </Typography>
        <Typography mb={1}>
          - رشد کسب و کار: لینک‌های کوتاه زیبا و قابل ردیابی می‌توانند نرخ کلیک و تعامل کاربران را افزایش دهند.
        </Typography>
      </Box>

      <Box mb={4}>
        <Typography variant="h5" mb={2}>سوالات متداول</Typography>
        <List>
          <ListItem>آیا لینک‌های لس همیشه فعال هستند؟ بله، تا زمانی که حذف نشوند لینک‌ها فعال خواهند بود.</ListItem>
          <ListItem>آیا امکان ویرایش لینک‌ها وجود دارد؟ در نسخه رایگان امکان ویرایش وجود ندارد، اما در نسخه پیشرفته این قابلیت فراهم است.</ListItem>
          <ListItem>آیا می‌توان لینک‌ها را حذف کرد؟ بله، کاربران می‌توانند لینک‌های خود را مدیریت و حذف کنند.</ListItem>
          <ListItem>آیا استفاده از لس نیاز به ثبت‌نام دارد؟ برای شروع سریع نیازی به ثبت‌نام نیست، اما امکانات پیشرفته نیازمند حساب کاربری است.</ListItem>
        </List>
      </Box>
    </Container>
  );
};

export default BestUrlShortenerPage;
