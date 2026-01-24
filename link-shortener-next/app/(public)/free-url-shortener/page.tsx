import React from "react";
import { Container, Typography, Box, List, ListItem } from "@mui/material";
import {Metadata} from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "کوتاه‌کننده لینک رایگان و امن | لِس",
  description: "لینک‌های بلند خود را بدون ثبت‌نام و کاملاً رایگان کوتاه کنید. سرویس سریع، امن و بدون تبلیغات لِس با امکانات ردیابی، رمزگذاری و آمار دقیق.",
  keywords: "کوتاه‌کننده لینک رایگان, لینک کوتاه, سرویس رایگان لینک, لینک کوتاه سریع, ردیابی لینک, لینک محافظت شده",
  alternates: { canonical: "https://a.l1s.ir/free-url-shortener" },
};

const faqs = [
  { question: "چرا از کوتاه‌کننده لینک رایگان لِس استفاده کنیم؟", answer: "لِس به شما امکان کوتاه کردن لینک‌ها بدون ثبت‌نام و بدون پرداخت، با امنیت و سرعت بالا و قابلیت ردیابی کلیک‌ها را می‌دهد." },
  { question: "آیا محدودیتی برای لینک‌های رایگان وجود دارد؟", answer: "کاربران رایگان می‌توانند هزاران لینک کوتاه ایجاد کنند، هرچند محدودیت‌هایی در امکانات پیشرفته مانند دامنه اختصاصی وجود دارد." },
  { question: "آیا لینک‌ها امن هستند؟", answer: "تمامی لینک‌های کوتاه‌شده با پروتکل HTTPS رمزگذاری می‌شوند و می‌توانید لینک‌ها را با رمز محافظت کنید." },
  { question: "چطور لینک رایگان کوتاه کنیم؟", answer: "فقط لینک بلند را وارد کرده، دکمه کوتاه‌کن را بزنید و لینک کوتاه شده را کپی کنید." }
];

const FreeUrlShortenerPage: React.FC = () => {
  return (
    <Container sx={{ py: 8 }}>
      {/* JSON-LD برای SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map(faq => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer }
            }))
          })
        }}
      />

        <Box mb={4} display="flex" justifyContent="center">
        <Image
          src="/images/url-shortener-seo.webp"
          alt="بهترین کوتاه‌کننده لینک ایران | لس"
          width={1200}
          height={630}
          priority
        />
      </Box>

      <Typography variant="h3" mb={3}>کوتاه‌کننده لینک رایگان لِس</Typography>

      <Typography mb={3}>
        سرویس لِس به شما امکان می‌دهد لینک‌های بلند و پیچیده خود را به لینک‌های کوتاه، حرفه‌ای و قابل اشتراک‌گذاری تبدیل کنید، بدون نیاز به ثبت‌نام و کاملاً رایگان. این سرویس مناسب شبکه‌های اجتماعی، پیام‌رسان‌ها و تبلیغات آنلاین است.
      </Typography>

      <Box mb={4}>
        <Typography variant="h5" mb={2}>مزایای استفاده از کوتاه‌کننده لینک رایگان</Typography>
        <List>
          <ListItem>کوتاه کردن لینک‌ها بدون ثبت‌نام و پرداخت</ListItem>
          <ListItem>امنیت بالا و رمزگذاری لینک‌ها با HTTPS</ListItem>
          <ListItem>امکان ردیابی کلیک‌ها و آمار پایه</ListItem>
          <ListItem>سازگاری کامل با شبکه‌های اجتماعی و پیام‌رسان‌ها</ListItem>
          <ListItem>ایجاد لینک‌های حرفه‌ای و قابل برندینگ با دامنه رایگان لِس</ListItem>
        </List>
      </Box>

      <Box mb={4}>
        <Typography variant="h5" mb={2}>چطور لینک خود را کوتاه کنیم؟</Typography>
        <List>
          <ListItem>لینک بلند خود را در فرم کوتاه‌کننده لِس (l1s) وارد کنید.</ListItem>
          <ListItem>دکمه "کوتاه‌کن" را فشار دهید.</ListItem>
          <ListItem>لینک کوتاه‌شده به شما نمایش داده می‌شود.</ListItem>
          <ListItem>لینک را کپی کرده و در شبکه‌های اجتماعی یا ایمیل‌ها استفاده کنید.</ListItem>
          <ListItem>در صورت تمایل، لینک را با رمز محافظت کنید.</ListItem>
        </List>
      </Box>

      <Box mb={4}>
        <Typography variant="h5" mb={2}>راهنمای استفاده حرفه‌ای</Typography>
        <Typography mb={1}>
          - برای بهینه‌سازی اشتراک‌گذاری، لینک‌های کوتاه را در پیام‌ها، ایمیل‌ها و شبکه‌های اجتماعی استفاده کنید.
        </Typography>
        <Typography mb={1}>
          - لینک‌های کوتاه را می‌توانید با رمز محافظت کنید تا تنها افرادی که رمز دارند به آن دسترسی داشته باشند.
        </Typography>
        <Typography mb={1}>
          - از لینک کوتاه برای کمپین‌های تبلیغاتی و بازاریابی استفاده کنید و آمار کلیک‌ها را بررسی کنید.
        </Typography>
        <Typography mb={1}>
          - لینک‌های کوتاه می‌توانند به راحتی با دامنه‌های اختصاصی شما یا برندتان جایگزین شوند (در پلن‌های پیشرفته).
        </Typography>
      </Box>

      <Box mb={4}>
        <Typography variant="h5" mb={2}>سوالات متداول</Typography>
        <List>
          <ListItem>آیا محدودیت زمانی برای لینک‌ها وجود دارد؟ لینک‌ها تا زمانی که حذف نشوند فعال خواهند بود.</ListItem>
          <ListItem>آیا لینک‌ها قابل ویرایش هستند؟ در نسخه رایگان، لینک‌ها ثابت هستند و در نسخه پیشرفته قابل ویرایش هستند.</ListItem>
          <ListItem>آیا می‌توان لینک‌های کوتاه را حذف کرد؟ بله، مدیریت کامل لینک‌ها در داشبورد کاربران پیشرفته موجود است.</ListItem>
          <ListItem>آیا اطلاعات کاربری نیاز است؟ نه، سرویس رایگان بدون ثبت‌نام و بدون نیاز به ایمیل یا شماره فعال می‌شود.</ListItem>
        </List>
      </Box>

      <Box mb={4}>
        <Typography variant="h5" mb={2}>چرا لِس بهترین انتخاب برای کوتاه کردن لینک‌هاست؟</Typography>
        <Typography mb={1}>
          لِس یک سرویس کوتاه‌کننده لینک امن، سریع و بدون تبلیغات است. با امکانات ردیابی، رمزگذاری و آمار دقیق، تجربه‌ای حرفه‌ای در مدیریت لینک‌ها به شما ارائه می‌دهد.
        </Typography>
        <Typography mb={1}>
          این سرویس مناسب بازاریابی دیجیتال، شبکه‌های اجتماعی، ایمیل مارکتینگ و تبلیغات آنلاین است و می‌تواند نرخ کلیک و تعامل کاربران شما را افزایش دهد.
        </Typography>
      </Box>
    </Container>
  );
};

export default FreeUrlShortenerPage;
