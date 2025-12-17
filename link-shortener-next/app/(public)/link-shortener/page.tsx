import React from "react";
import { Helmet } from "react-helmet-async";
import { Container, Typography, Box, List, ListItem } from "@mui/material";

const LinkShortenerPage: React.FC = () => {
  return (
    <Container sx={{ py: 8 }}>
      <Helmet>
        <title>کوتاه‌کننده لینک حرفه‌ای و امن | لِس</title>
        <meta
          name="description"
          content="کوتاه‌کننده لینک لِس سریع، امن و بدون تبلیغات است. لینک‌های بلند خود را کوتاه کنید و با امکانات پیشرفته ردیابی، کسب درآمد و مدیریت آسان استفاده کنید."
        />
        <meta
          name="keywords"
          content="کوتاه کننده لینک, کوتاه کردن لینک, ردیابی لینک, لینک کوتاه حرفه ای, لینک محافظت شده, لِس"
        />
        <link rel="canonical" href="https://a.l1s.ir/link-shortener" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "کوتاه‌کننده لینک چیست؟",
                acceptedAnswer: { "@type": "Answer", text: "سرویس آنلاین تبدیل لینک بلند به کوتاه و قابل اشتراک‌گذاری با امکانات ردیابی و محافظت." }
              },
              {
                "@type": "Question",
                name: "مزایای کوتاه کردن لینک چیست؟",
                acceptedAnswer: { "@type": "Answer", text: "ظاهر حرفه‌ای لینک، آسان‌تر شدن اشتراک‌گذاری، افزایش نرخ کلیک و امکان کسب درآمد از لینک‌ها." }
              },
              {
                "@type": "Question",
                name: "آیا می‌توان لینک‌ها را با رمز محافظت کرد؟",
                acceptedAnswer: { "@type": "Answer", text: "بله، لِس امکان ایجاد لینک محافظت‌شده با رمز عبور را فراهم می‌کند." }
              },
              {
                "@type": "Question",
                name: "آیا دامنه اختصاصی قابل استفاده است؟",
                acceptedAnswer: { "@type": "Answer", text: "کاربران می‌توانند دامنه اختصاصی خود را به لینک‌ها متصل کنند و تجربه برندینگ حرفه‌ای داشته باشند." }
              }
            ]
          })}
        </script>
      </Helmet>

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
    </Container>
  );
};

export default LinkShortenerPage;
