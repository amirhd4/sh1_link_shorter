import React from "react";
import { Container, Typography, Box, List, ListItem } from "@mui/material";
import { Metadata } from "next";
import config from "@/config";

export const metadata: Metadata = {
  title: "قوانین و مقررات و حریم خصوصی | لِس",
  description:
    `مطالعه کامل قوانین و مقررات، شرایط استفاده و سیاست حفظ حریم خصوصی سرویس کوتاه‌کننده لینک و لینک در بیو لِس (${config.backendBaseUrlOrigin}).`,
  keywords:
    "قوانین کوتاه کننده لینک, حریم خصوصی, شرایط استفاده, قوانین لینک کوتاه, مقررات لِس",
  alternates: { canonical: `${config.frontBaseUrl}/terms` },
};

const faqItems = [
  {
    q: "آیا لِس مسئول محتوای لینک‌های ساخته شده است؟",
    a: "خیر، مسئولیت کامل محتوای لینک‌ها و صفحات مقصد بر عهده کاربر ایجادکننده لینک است.",
  },
  {
    q: "آیا امکان حذف یا مسدودسازی لینک وجود دارد؟",
    a: "بله، در صورت نقض قوانین یا دریافت گزارش معتبر، لینک یا حساب کاربری بدون اطلاع قبلی ممکن است مسدود شود.",
  },
  {
    q: "چه اطلاعاتی از کاربران ذخیره می‌شود؟",
    a: "اطلاعات حساب، آمار کلیک، داده‌های فنی مانند IP و اطلاعات تحلیلی جهت بهبود سرویس ذخیره می‌شود.",
  },
];

const TermsPage: React.FC = () => {
  return (
    <Container sx={{ py: 8 }}>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "قوانین و مقررات لس",
            mainEntity: {
              "@type": "FAQPage",
              mainEntity: faqItems.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: f.a,
                },
              })),
            },
          }),
        }}
      />

      {/* Breadcrumb */}
      <Box mb={4}>
        <Typography variant="h6" color="textSecondary">
          <a href={`${config.frontBaseUrl}/home`} style={{ textDecoration: "none" }}>
            خانه
          </a>{" "}
          &gt; قوانین و مقررات
        </Typography>
      </Box>

      <Typography variant="h3" mb={3}>
          {`قوانین و مقررات استفاده از سرویس لِس (${config.backendBaseUrlOrigin})`}
      </Typography>

      <Typography mb={3}>
        استفاده از خدمات کوتاه‌کننده لینک و لینک در بیو لِس به معنای پذیرش کامل
        شرایط و مقررات زیر است. لطفاً پیش از استفاده از سرویس، این موارد را با
        دقت مطالعه نمایید.
      </Typography>

      {/* شرایط استفاده */}
      <Box mt={4}>
        <Typography variant="h5" mb={2}>
          1. پذیرش شرایط
        </Typography>
        <Typography>
          با ثبت‌نام یا استفاده از خدمات لِس، کاربر تأیید می‌کند که تمامی
          قوانین جاری جمهوری اسلامی ایران و مفاد این صفحه را پذیرفته است.
        </Typography>
      </Box>

      <Box mt={4}>
        <Typography variant="h5" mb={2}>
          2. مسئولیت محتوای لینک‌ها
        </Typography>
        <List>
          <ListItem>• مسئولیت کامل محتوای لینک مقصد بر عهده کاربر است.</ListItem>
          <ListItem>
            • انتشار محتوای غیرقانونی، مجرمانه، فیشینگ، بدافزار یا ناقض حقوق
            اشخاص ممنوع است.
          </ListItem>
          <ListItem>
            • در صورت دریافت گزارش معتبر، لینک بدون اخطار قبلی حذف می‌شود.
          </ListItem>
        </List>
      </Box>

      <Box mt={4}>
        <Typography variant="h5" mb={2}>
          3. موارد ممنوعه
        </Typography>
        <List>
          <ListItem>• ارسال اسپم یا تبلیغات گمراه‌کننده</ListItem>
          <ListItem>• هدایت به صفحات جعلی یا سرقت اطلاعات</ListItem>
          <ListItem>• نقض حقوق مالکیت فکری</ListItem>
          <ListItem>• انتشار محتوای خلاف قوانین کشور</ListItem>
        </List>
      </Box>

      <Box mt={4}>
        <Typography variant="h5" mb={2}>
          4. حق تعلیق یا حذف حساب
        </Typography>
        <Typography>
           لِس این حق را دارد که در صورت نقض قوانین یا دستور مراجع قانونی،
          دسترسی کاربر را محدود، لینک‌ها را حذف یا حساب کاربری را مسدود نماید.
        </Typography>
      </Box>

      <Box mt={6}>
        <Typography variant="h4" mb={3}>
          سیاست حفظ حریم خصوصی
        </Typography>

        <Typography mb={2}>
          ما در لِس متعهد به حفاظت از اطلاعات کاربران هستیم و داده‌ها تنها در
          چارچوب قانونی و جهت بهبود خدمات استفاده می‌شوند.
        </Typography>

        <Typography variant="h6" mt={3}>
          اطلاعات جمع‌آوری‌شده:
        </Typography>
        <List>
          <ListItem>• اطلاعات حساب کاربری (در صورت ثبت)</ListItem>
          <ListItem>• آمار کلیک و بازدید لینک‌ها</ListItem>
          <ListItem>• اطلاعات فنی مانند IP و نوع مرورگر</ListItem>
        </List>

        <Typography variant="h6" mt={3}>
          نحوه استفاده از اطلاعات:
        </Typography>
        <List>
          <ListItem>• ارائه و بهبود خدمات</ListItem>
          <ListItem>• افزایش امنیت و جلوگیری از سوءاستفاده</ListItem>
          <ListItem>• رعایت الزامات قانونی</ListItem>
        </List>

        <Typography variant="h6" mt={3}>
          اشتراک‌گذاری اطلاعات:
        </Typography>
        <Typography>
          اطلاعات کاربران به اشخاص ثالث فروخته نمی‌شود و تنها در صورت الزام
          قانونی یا دستور مراجع صالح ارائه خواهد شد.
        </Typography>

        <Typography variant="h6" mt={3}>
          امنیت داده‌ها:
        </Typography>
        <Typography>
          تمامی ارتباطات از طریق پروتکل امن HTTPS انجام می‌شود و تدابیر امنیتی
          مناسب برای حفاظت از اطلاعات به کار گرفته شده است.
        </Typography>
      </Box>

      <Box mt={6}>
        <Typography variant="h5" mb={2}>
          قانون حاکم
        </Typography>
        <Typography>
          این شرایط مطابق با قوانین جاری جمهوری اسلامی ایران تفسیر و اجرا
          می‌شود و در صورت بروز اختلاف، مراجع قانونی صالح رسیدگی خواهند کرد.
        </Typography>
      </Box>

      <Box mt={6}>
        <Typography variant="h5" mb={2}>
          تماس با ما
        </Typography>
        <Typography>
          برای گزارش تخلف یا درخواست‌های مربوط به حریم خصوص، از طریق بخش
          پشتیبانی سایت اقدام نمایید.
        </Typography>
      </Box>

      <Box mt={8}>
        <Typography variant="body2" color="textSecondary">
          آخرین بروزرسانی: ۱۴۰۵/۰۲/۱۳
        </Typography>
      </Box>
    </Container>
  );
};

export default TermsPage;
