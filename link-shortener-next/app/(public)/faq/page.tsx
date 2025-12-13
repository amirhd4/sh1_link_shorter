import React from "react";
import { Helmet } from "react-helmet-async";
import { Container, Typography, Box, List, ListItem, ListItemText } from "@mui/material";

const FaqPage: React.FC = () => {
  const faqs = [
    {
      question: "کوتاه‌کننده لینک چیست؟",
      answer: "کوتاه‌کننده لینک ابزاری آنلاین است که لینک‌های بلند و پیچیده را به لینک کوتاه، ساده و قابل اشتراک‌گذاری تبدیل می‌کند."
    },
    {
      question: "مزایای کوتاه کردن لینک چیست؟",
      answer: "کوتاه کردن لینک باعث ظاهر حرفه‌ای، راحتی اشتراک‌گذاری و امکان ردیابی کلیک‌ها می‌شود."
    },
    {
      question: "آیا استفاده از لس (l1s) رایگان است؟",
      answer: "بله، سرویس کوتاه‌کننده لینک لس رایگان است و بدون تبلیغات مزاحم می‌توانید لینک کوتاه بسازید."
    },
    {
      question: "آیا امکان ایجاد لینک محافظت‌شده با رمز وجود دارد؟",
      answer: "بله، هنگام ایجاد لینک می‌توانید برای امنیت بیشتر رمز عبور تعیین کنید."
    },
    {
      question: "آیا می‌توان لینک کوتاه با دامنه اختصاصی ساخت؟",
      answer: "بله، لس امکان استفاده از دامنه اختصاصی برای برندینگ لینک‌ها را فراهم کرده است."
    },
    {
      question: "چگونه لینک‌های کوتاه شده را ردیابی کنیم؟",
      answer: "با ورود به داشبورد لِس می‌توانید تعداد کلیک‌ها، تاریخ و زمان، و منابع کلیک‌ها را مشاهده کنید."
    },
    {
      question: "آیا محدودیتی برای تعداد لینک‌ها وجود دارد؟",
      answer: "لینک‌های کوتاه شده توسط کاربران رایگان محدودیت روزانه یا ماهانه مشخص دارند تا سیستم پایدار باقی بماند."
    },
    {
      question: "آیا سرویس API برای توسعه‌دهندگان موجود است؟",
      answer: "بله، API کوتاه‌کننده لینک لس با امکانات دامنه اختصاصی، ردیابی UTM و لینک محافظت‌شده ارائه می‌شود."
    },
    {
      question: "چگونه می‌توان لینک کوتاه را در شبکه‌های اجتماعی اشتراک‌گذاری کرد؟",
      answer: "پس از تولید لینک کوتاه، کافیست آن را کپی کرده و در تلگرام، واتساپ، اینستاگرام، توییتر و سایر شبکه‌ها قرار دهید."
    },
    {
      question: "آیا لینک‌ها همیشه فعال می‌مانند؟",
      answer: "لینک‌های کوتاه لس تا زمانی که حذف نشده یا منقضی نشده‌اند، فعال هستند و می‌توانند به طور امن استفاده شوند."
    }
  ];

  return (
    <Container sx={{ py: 8 }}>
      <Helmet>
        <title>سوالات متداول | لِس</title>
        <meta
          name="description"
          content="سوالات متداول کاربران لس (l1s) درباره کوتاه‌کننده لینک، امنیت، API، دامنه اختصاصی و نحوه استفاده از سرویس."
        />
        <meta
          name="keywords"
          content="FAQ, سوالات متداول, کوتاه کننده لینک, لینک کوتاه, سرویس لس, لِس , API لینک کوتاه, دامنه اختصاصی"
        />
        <link rel="canonical" href="https://l1s.ir/faq" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map(faq => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer }
            }))
          })}
        </script>
      </Helmet>

      <Typography variant="h3" mb={3}>سوالات متداول کاربران لس (l1s)</Typography>
      <Typography mb={2}>
        در این بخش مهم‌ترین سوالات کاربران درباره کوتاه‌کننده لینک لس و پاسخ‌های آن‌ها جمع‌آوری شده است تا تجربه استفاده شما از سرویس راحت‌تر و شفاف‌تر باشد.
      </Typography>

      <Box mb={4}>
        {faqs.map((faq, index) => (
          <Box key={index} mb={2}>
            <Typography variant="h5" mb={1}>{faq.question}</Typography>
            <Typography>{faq.answer}</Typography>
          </Box>
        ))}
      </Box>

      <Box mb={4}>
        <Typography variant="h5" mb={2}>نکات مهم درباره سرویس کوتاه‌کننده لینک</Typography>
        <List>
          <ListItem>
            <ListItemText primary="لینک‌های کوتاه بدون ثبت‌نام و رایگان هستند." />
          </ListItem>
          <ListItem>
            <ListItemText primary="امکان ردیابی و تحلیل لینک‌ها برای کمپین‌های تبلیغاتی وجود دارد." />
          </ListItem>
          <ListItem>
            <ListItemText primary="لینک‌های محافظت‌شده با رمز امنیت بیشتری برای اشتراک‌گذاری فراهم می‌کنند." />
          </ListItem>
          <ListItem>
            <ListItemText primary="API حرفه‌ای برای توسعه‌دهندگان قابل استفاده است." />
          </ListItem>
          <ListItem>
            <ListItemText primary="لینک‌ها با دامنه اختصاصی قابل برندینگ و حرفه‌ای شدن هستند." />
          </ListItem>
        </List>
      </Box>
    </Container>
  );
};

export default FaqPage;
