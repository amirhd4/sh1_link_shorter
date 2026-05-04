import React from "react";
import { Container, Typography, Box, List, ListItem } from "@mui/material";
import {Metadata} from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "بیو لینک | لینک بیو حرفه‌ای و بهینه شده | لِس",
  description: "ویژگی بیو لینک لِس به شما این امکان را می‌دهد که تمامی لینک‌های خود را در یک صفحه واحد جمع‌آوری کرده و به راحتی به اشتراک بگذارید. برای افزایش تعامل و کارایی در شبکه‌های اجتماعی و تبلیغات.",
  keywords: "بیو لینک, لینک بیو, لینک در بیو, صفحه بیو, لینک برای اینستاگرام, لینک برای توییتر, لینک در پروفایل, بیو لینک لِس",
  alternates: { canonical: "https://a.l1s.ir/bio-link" },
};

const faqs = [
  { question: "ویژگی بیو لینک چیست؟", answer: "بیو لینک به شما این امکان را می‌دهد که چندین لینک را در یک صفحه واحد جمع‌آوری کنید و به راحتی در پروفایل‌های شبکه‌های اجتماعی و پلتفرم‌ها به اشتراک بگذارید." },
  { question: "چطور از بیو لینک استفاده کنم؟", answer: "شما می‌توانید لینک‌های مختلف خود را در صفحه بیو لینک لِس اضافه کرده و یک URL کوتاه برای اشتراک‌گذاری دریافت کنید. این صفحه برای بهینه‌سازی حضور آنلاین شما بسیار مناسب است." },
  { question: "آیا لینک‌های بیو لینک می‌توانند با برند من سفارشی‌سازی شوند؟", answer: "بله، شما می‌توانید لینک بیو خود را با نام برندتان و دامنه اختصاصی سفارشی کنید." },
  { question: "آیا می‌توانم از بیو لینک در اینستاگرام و سایر شبکه‌های اجتماعی استفاده کنم؟", answer: "بله، بیو لینک لِس به شما این امکان را می‌دهد که لینک‌های خود را در پروفایل‌های شبکه‌های اجتماعی مختلف مثل اینستاگرام، توییتر، و لینکدین به اشتراک بگذارید." }
];

const BioLinkPage: React.FC = () => {
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
          <a href="https://a.l1s.ir/home" style={{ textDecoration: "none" }}>خانه</a> &gt; <a href="https://a.l1s.ir/bio-link" style={{ textDecoration: "none" }}>بیو لینک</a>
        </Typography>
      </Box>

      {/* تصویر جذاب برای صفحه */}
      <Box mb={4} display="flex" justifyContent="center">
        <Image
          src="/images/bio-link-seo.webp"
          alt="لینک بیو برای شبکه‌های اجتماعی | لِس"
          width={1200}
          height={630}
          priority
        />
      </Box>

      <Typography variant="h3" mb={3}>لینک بیو لِس: لینک‌های خود را به راحتی در یک صفحه واحد قرار دهید</Typography>

      <Typography mb={3}>
        اگر شما هم به دنبال یک راهکار ساده برای اشتراک‌گذاری چندین لینک در پروفایل‌های شبکه‌های اجتماعی خود هستید، ویژگی بیو لینک لِس دقیقا برای شما طراحی شده است. این ویژگی به شما امکان می‌دهد که لینک‌های مختلف خود را در یک صفحه واحد جمع‌آوری کنید و فقط یک لینک کوتاه را در پروفایل خود به اشتراک بگذارید.
      </Typography>

      <Box mb={4}>
        <Typography variant="h5" mb={2}>مزایای استفاده از بیو لینک لِس</Typography>
        <List>
          <ListItem>جمع‌آوری تمامی لینک‌های شما در یک صفحه واحد</ListItem>
          <ListItem>امکان سفارشی‌سازی لینک با برند شما</ListItem>
          <ListItem>امکان استفاده در پروفایل‌های شبکه‌های اجتماعی مانند اینستاگرام و توییتر</ListItem>
          <ListItem>رابط کاربری ساده و کاربردی</ListItem>
          <ListItem>مناسب برای کسب‌وکارها، اینفلوئنسرها، و برندهای شخصی</ListItem>
        </List>
      </Box>

      <Box mb={4}>
        <Typography variant="h5" mb={2}>چطور بیو لینک خود را ایجاد کنیم؟</Typography>
        <List>
          <ListItem>لینک‌های مورد نظر خود را وارد کنید.</ListItem>
          <ListItem>یک URL کوتاه برای بیو لینک خود دریافت کنید.</ListItem>
          <ListItem>URL کوتاه شده را در پروفایل‌های خود قرار دهید.</ListItem>
          <ListItem>اگر می‌خواهید، می‌توانید از رمز عبور برای محافظت از لینک‌ها استفاده کنید.</ListItem>
        </List>
      </Box>

      <Box mb={4}>
        <Typography variant="h5" mb={2}>سوالات متداول</Typography>
        <List>
          <ListItem>آیا می‌توانم از لینک بیو در اینستاگرام استفاده کنم؟ بله، لینک بیو لِس به راحتی قابل استفاده در پروفایل‌های شبکه‌های اجتماعی است.</ListItem>
          <ListItem>آیا امکان سفارشی‌سازی لینک‌ها وجود دارد؟ بله، شما می‌توانید لینک‌های خود را با نام برندتان سفارشی کنید.</ListItem>
          <ListItem>آیا می‌توانم آمار کلیک‌های لینک بیو را مشاهده کنم؟ بله، شما می‌توانید با استفاده از داشبورد لِس، آمار دقیق کلیک‌ها را مشاهده کنید.</ListItem>
        </List>
      </Box>

      <Box mb={4}>
        <Typography variant="h5" mb={2}>چرا لِس بهترین انتخاب برای بیو لینک است؟</Typography>
        <Typography mb={1}>
          لِس یک سرویس ساده و سریع برای ایجاد لینک بیو است که به شما این امکان را می‌دهد که تمامی لینک‌های خود را در یک صفحه واحد جمع‌آوری کنید. این سرویس بدون تبلیغات و با امنیت بالا، گزینه‌ای عالی برای برندها و افراد است.
        </Typography>
        <Typography mb={1}>
          شما می‌توانید از این سرویس برای بهبود حضور آنلاین خود در شبکه‌های اجتماعی استفاده کنید و نرخ تعامل خود را افزایش دهید.
        </Typography>
      </Box>

      {/* لینک‌های مرتبط */}
      <section id="internal-links" style={{ marginTop: "2rem" }}>
        <Typography variant="h4" mb={3}>لینک‌های مرتبط</Typography>
        <Box display="flex" flexWrap="wrap" gap={2}>
          {[
            { href: "https://a.l1s.ir/home", title: "صفحه اصلی" },
            { href: "https://a.l1s.ir/bio-link", title: "بیو لینک" },
            { href: "https://a.l1s.ir/url-shortener", title: "کوتاه کننده لینک" },
            { href: "https://a.l1s.ir/short-url-generator", title: "تولید کننده لینک کوتاه" },
          ].map((link, idx) => (
            <Box
              key={idx}
              component="a"
              href={link.href}
              title={link.title}
              sx={{
                textDecoration: "none",
                width: { xs: "100%", sm: "calc(50% - 8px)", md: "calc(50% - 8px)" },
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

export default BioLinkPage;
``
