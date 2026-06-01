import React from "react";
import { Container, Typography, Box, List, ListItem, ListItemText } from "@mui/material";
import {Metadata} from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "سوالات متداول | لِس",
  description: "سوالات متداول کاربران لس  درباره کوتاه‌کننده لینک، امنیت، API، دامنه اختصاصی و نحوه استفاده از سرویس.",
  keywords: "FAQ, سوالات متداول, کوتاه کننده لینک, لینک کوتاه, سرویس لس, لِس , API لینک کوتاه, دامنه اختصاصی",
  alternates: { canonical: "https://a.l1s.ir/faq" },
};

const faqs = [
  { question: "کوتاه‌کننده لینک چیست؟", answer: "کوتاه‌کننده لینک ابزاری آنلاین است که لینک‌های بلند و پیچیده را به لینک کوتاه، ساده و قابل اشتراک‌گذاری تبدیل می‌کند." },
  { question: "مزایای کوتاه کردن لینک چیست؟", answer: "کوتاه کردن لینک باعث ظاهر حرفه‌ای، راحتی اشتراک‌گذاری و امکان ردیابی کلیک‌ها می‌شود." },
  { question: "آیا استفاده از لس  رایگان است؟", answer: "بله، سرویس کوتاه‌کننده لینک لس رایگان است و بدون تبلیغات مزاحم می‌توانید لینک کوتاه بسازید." },
  { question: "آیا امکان ایجاد لینک محافظت‌شده با رمز وجود دارد؟", answer: "بله، هنگام ایجاد لینک می‌توانید برای امنیت بیشتر رمز عبور تعیین کنید." },
  { question: "آیا می‌توان لینک کوتاه با دامنه اختصاصی ساخت؟", answer: "بله، لس امکان استفاده از دامنه اختصاصی برای برندینگ لینک‌ها را فراهم کرده است." },
  { question: "چگونه لینک‌های کوتاه شده را ردیابی کنیم؟", answer: "با ورود به داشبورد لِس می‌توانید تعداد کلیک‌ها، تاریخ و زمان، و منابع کلیک‌ها را مشاهده کنید." },
  { question: "آیا محدودیتی برای تعداد لینک‌ها وجود دارد؟", answer: "لینک‌های کوتاه شده توسط کاربران رایگان محدودیت روزانه یا ماهانه مشخص دارند تا سیستم پایدار باقی بماند." },
  { question: "آیا سرویس API برای توسعه‌دهندگان موجود است؟", answer: "بله، API کوتاه‌کننده لینک لس با امکانات دامنه اختصاصی، ردیابی UTM و لینک محافظت‌شده ارائه می‌شود." },
  { question: "چگونه می‌توان لینک کوتاه را در شبکه‌های اجتماعی اشتراک‌گذاری کرد؟", answer: "پس از تولید لینک کوتاه، کافیست آن را کپی کرده و در تلگرام، واتساپ، اینستاگرام، توییتر و سایر شبکه‌ها قرار دهید." },
  { question: "آیا لینک‌ها همیشه فعال می‌مانند؟", answer: "لینک‌های کوتاه لس تا زمانی که حذف نشده یا منقضی نشده‌اند، فعال هستند و می‌توانند به طور امن استفاده شوند." },
    {
    q: "ویژگی بیو لینک چیست و چگونه کار می‌کند؟",
    a: "بیو لینک به شما این امکان را می‌دهد که تمامی لینک‌های خود را در یک صفحه واحد جمع‌آوری کنید و آنها را با دیگران به اشتراک بگذارید. این ویژگی برای افرادی که نیاز دارند چندین لینک را در یک مکان خاص ارائه دهند، بسیار مفید است. این قابلیت در لس موجود است",
  },
];

const FaqPage: React.FC = () => {

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
        {/* Breadcrumb */}
      <Box mb={4}>
        <Typography variant="h6" color="textSecondary">
          <a href="https://a.l1s.ir/home" style={{ textDecoration: "none" }}>خانه</a> &gt; <a href="https://a.l1s.ir/faq" style={{ textDecoration: "none" }}>سوالات متداول</a>
        </Typography>
      </Box>
 <Box mb={4} display="flex" justifyContent="center">
        <Image
          src="/images/url-shortener-faq.webp"
          alt="بهترین کوتاه‌کننده لینک ایران | لس"
          width={700}
          height={400}
          priority
        />
      </Box>
      <Typography variant="h3" mb={3}>سوالات متداول کاربران لس </Typography>
      <Typography mb={2}>
        در این بخش مهم‌ترین سوالات کاربران درباره کوتاه‌کننده لینک لس و پاسخ‌های آن‌ها جمع‌آوری شده است تا تجربه استفاده شما از سرویس راحت‌تر و شفاف‌تر باشد.
      </Typography>

      <Box mb={4}>
  {faqs.map((faq, index) => (
    <Box key={index} mb={3}>
      <Typography variant="h5" mb={1}>{faq.question}</Typography>
      <Typography mb={1}>
        {(() => {
          switch(index) {
            case 0: // کوتاه‌کننده لینک چیست؟
              return <>کوتاه‌کننده لینک ابزاری آنلاین است که لینک‌های بلند و پیچیده را به لینک کوتاه، ساده و قابل اشتراک‌گذاری تبدیل می‌کند. برای تجربه عملی، می‌توانید از <a href="https://a.l1s.ir/short-url-generator" title="تولید کننده لینک کوتاه">تولید کننده لینک کوتاه لس</a> استفاده کنید.</>;
            case 1: // مزایای کوتاه کردن لینک چیست؟
              return <>آموزش استفاده از سامانه کوتاه کننده لینک لِس + به همراه آموزش تصویری <a href="https://a.l1s.ir/tutorial" title="آموزش کوتاه کننده لینک لِس">آموزش کوتاه‌کننده لینک لِس</a> را ببینید.</>;
            case 2: // رایگان بودن سرویس
              return <>بله، سرویس کوتاه‌کننده لینک لس رایگان است و بدون تبلیغات مزاحم می‌توانید لینک کوتاه بسازید. همچنین می‌توانید از <a href="https://a.l1s.ir/short-url-generator" title="کوتاه کننده لینک رایگان">کوتاه‌کننده لینک رایگان</a> استفاده کنید.</>;
            case 3: // دامنه اختصاصی
              return <>بله، لس امکان استفاده از دامنه اختصاصی برای برندینگ لینک‌ها را فراهم کرده است. اطلاعات بیشتر در <a href="https://a.l1s.ir/url-shortener" title="API کوتاه‌کننده لینک">API کوتاه‌کننده لینک</a> موجود است.</>;
            case 4: // ردیابی لینک‌ها
              return <>با ورود به داشبورد لِس می‌توانید تعداد کلیک‌ها، تاریخ و زمان، و منابع کلیک‌ها را مشاهده کنید. همچنین می‌توانید از <a href="https://a.l1s.ir/url-shortener" title="کوتاه کننده لینک با API">کوتاه‌کننده لینک با API</a> برای ردیابی حرفه‌ای استفاده کنید.</>;
            case 5: // API
              return <>بله، API کوتاه‌کننده لینک لس با امکانات دامنه اختصاصی، ردیابی UTM و لینک محافظت‌شده ارائه می‌شود. صفحه <a href="https://a.l1s.ir/url-shortener" title="API کوتاه‌کننده لینک">API کوتاه‌کننده لینک</a> را ببینید.</>;
            default:
              return faq.answer;
          }
        })()}
      </Typography>
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

        <section id="related-links" style={{ marginTop: "2rem" }}>
  <Typography variant="h4" mb={3}>صفحات مرتبط</Typography>
  <Box display="flex" flexWrap="wrap" gap={2}>
    {[
      { href: "https://a.l1s.ir/home", title: "صفحه اصلی" },
      { href: "https://a.l1s.ir/short-url-generator", title: "تولید کننده لینک کوتاه" },
      { href: "https://a.l1s.ir/short-url-generator", title: "کوتاه کننده لینک رایگان" },
      { href: "https://a.l1s.ir/terms", title: "حریم خصوصی و قوانین" },
      { href: "https://a.l1s.ir/url-shortener", title: "کوتاه کننده لینک با API" },
      { href: "https://a.l1s.ir/tutorial", title: "آموزش کوتاه کننده لینک لِس" },
      { href: "https://a.l1s.ir/bio-link", title: "بیو لینک (لینک در بیو)" },

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

export default FaqPage;
