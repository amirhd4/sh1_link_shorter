import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Container, Typography, Box, List, ListItem, Divider } from "@mui/material";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "آموزش ثبت‌نام، ورود، ساخت لینک و مشاهده آمار | لس",
  description:
    "آموزش کامل کار با لس؛ از ثبت‌نام و ورود با شماره یا رمز، تا ساخت لینک کوتاه، تنظیم UTM، ویرایش لینک، فعال و غیرفعال کردن، حذف لینک و مشاهده آمار کامل.",
  keywords:
    "آموزش لس, ثبت نام در لس, ورود به لس, ساخت لینک کوتاه, آموزش کوتاه کننده لینک, تنظیم UTM, مشاهده آمار لینک, ویرایش لینک, اشتراک لس, لینک کوتاه حرفه ای",
  alternates: {
    canonical: "https://a.l1s.ir/tutorial",
  },
  openGraph: {
    title: "آموزش ثبت‌نام، ورود، ساخت لینک و مشاهده آمار | لس",
    description:
      "راهنمای کامل استفاده از لس برای ثبت‌نام، ورود، خرید اشتراک، ساخت لینک، تنظیم UTM و بررسی آمار لینک‌ها.",
    url: "https://a.l1s.ir/tutorial",
    type: "article",
    images: [
      {
        url: "/images/tutorial_l1s-link-shortener.png",
        width: 1200,
        height: 630,
        alt: "آموزش کامل ثبت‌نام و ساخت لینک در لس",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "آموزش ثبت‌نام، ورود، ساخت لینک و مشاهده آمار | لس",
    description:
      "آموزش کامل استفاده از لس برای ساخت لینک کوتاه، مدیریت لینک‌ها و مشاهده آمار.",
    images: ["/images/tutorial_l1s-link-shortener.png"],
  },
};

const faqItems = [
  {
    q: "چطور در لس ثبت‌نام کنیم؟",
    a: "برای ثبت‌نام در لس کافی است وارد صفحه ثبت‌نام شوید، شماره موبایل خود را وارد کنید و مراحل ورود یا ایجاد حساب را تکمیل کنید. ثبت‌نام با شماره موبایل انجام می‌شود.",
  },
  {
    q: "آیا ورود به لس فقط با رمز انجام می‌شود؟",
    a: "خیر، کاربر می‌تواند با رمز وارد شود یا انتخاب کند کد ورود از طریق پیامک برای او ارسال شود.",
  },
  {
    q: "بعد از ورود به لس چه کاری باید انجام دهیم؟",
    a: "بعد از ورود، کاربر وارد داشبورد می‌شود و یک پیام مهم برای ذخیره کردن رمز نمایش داده می‌شود. باید رمز را کپی و ذخیره کند و سپس گزینه ذخیره کردم را بزند.",
  },
  {
    q: "آیا در لس امکان ساخت لینک با UTM وجود دارد؟",
    a: "بله، هنگام ایجاد لینک می‌توان UTM تنظیم کرد تا لینک برای کمپین‌های تبلیغاتی، تحلیل منابع ورودی و بازاریابی دیجیتال آماده باشد.",
  },
  {
    q: "اشتراک رایگان لس چه امکاناتی دارد؟",
    a: "اشتراک رایگان ۷ روزه فعال می‌شود و کاربر می‌تواند تا ۵۰ لینک ایجاد کند.",
  },
  {
    q: "اشتراک پرو لس چقدر است؟",
    a: "اشتراک پرو ۴۵ روزه است و با مبلغ ۱۴۹ هزار تومان قابل خریداری است.",
  },
  {
    q: "چطور آمار لینک‌ها را در لس ببینیم؟",
    a: "در لیست لینک‌ها، با انتخاب آیکون جزئیات می‌توان صفحه آمار کامل لینک را مشاهده کرد و اطلاعات مربوط به عملکرد آن را دید.",
  },
  {
    q: "آیا امکان ویرایش، حذف یا غیرفعال کردن لینک در لس وجود دارد؟",
    a: "بله، کاربر می‌تواند لینک را ویرایش کند، فعال یا غیرفعال کند و در صورت نیاز آن را حذف کند.",
  },
];

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "آموزش ثبت‌نام، ورود و ساخت لینک در لس",
  description:
    "راهنمای گام‌به‌گام استفاده از لس از ثبت‌نام و ورود تا ساخت لینک کوتاه، تنظیم UTM و مشاهده آمار.",
  step: [
    {
      "@type": "HowToStep",
      name: "ورود به صفحه ثبت‌نام یا ورود",
      text: "کاربر ابتدا وارد صفحه ثبت‌نام یا ورود می‌شود. اگر حساب داشته باشد از صفحه ورود استفاده می‌کند و اگر حساب نداشته باشد از صفحه ثبت‌نام شروع می‌کند.",
    },
    {
      "@type": "HowToStep",
      name: "وارد کردن شماره موبایل",
      text: "برای ثبت‌نام، وارد کردن شماره موبایل الزامی است. کاربر شماره را وارد می‌کند تا حساب او ایجاد شود یا وارد حساب خود شود.",
    },
    {
      "@type": "HowToStep",
      name: "انتخاب روش ورود",
      text: "کاربر می‌تواند با رمز عبور وارد شود یا گزینه دریافت پیامک را انتخاب کند تا کد ورود برای او ارسال شود.",
    },
    {
      "@type": "HowToStep",
      name: "ذخیره رمز پس از ورود",
      text: "بعد از ورود به داشبورد، یک کادر مهم نمایش داده می‌شود که از کاربر می‌خواهد رمز خود را کپی و ذخیره کند. سپس باید گزینه ذخیره کردم را انتخاب کند.",
    },
    {
      "@type": "HowToStep",
      name: "ساخت لینک جدید",
      text: "کاربر از داشبورد روی دکمه ایجاد لینک می‌زند و در پنجره بازشده تنظیمات لینک را انجام می‌دهد.",
    },
    {
      "@type": "HowToStep",
      name: "تنظیم UTM و گزینه‌های پیشرفته",
      text: "در زمان ساخت لینک می‌توان UTM تنظیم کرد، رمز برای لینک گذاشت، لینک دلخواه تعریف کرد و حتی آن را به صفحه تبلیغات هدایت کرد.",
    },
    {
      "@type": "HowToStep",
      name: "مدیریت لینک و بررسی آمار",
      text: "کاربر می‌تواند لینک را ویرایش کند، جزئیات و آمار آن را ببیند، آن را فعال یا غیرفعال کند و در صورت نیاز حذف کند.",
    },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: f.a,
    },
  })),
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "خانه",
      item: "https://a.l1s.ir/home",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "آموزش کار با لس",
      item: "https://a.l1s.ir/tutorial",
    },
  ],
};

const LinkShortenerGuidePage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Breadcrumb */}
      <Box mb={4}>
        <Typography variant="body2" color="text.secondary">
          <Link href="https://a.l1s.ir/home" style={{ textDecoration: "none" }}>
            خانه
          </Link>{" "}
          {" > "} آموزش کار با لس
        </Typography>
      </Box>

      {/* Hero Image */}
      <Box mb={4} display="flex" justifyContent="center">
        <Image
          src="/images/tutorial_l1s-link-shortener.png"
          alt="آموزش کامل ثبت‌نام، ورود و ساخت لینک در لس"
          width={1200}
          height={630}
          priority
        />
      </Box>

      <Typography component="h1" variant="h3" mb={3} fontWeight="bold">
        آموزش کامل ثبت‌نام، ورود، ساخت لینک و مشاهده آمار در لس
      </Typography>

      <Typography mb={2}>
        اگر می‌خواهید کار با <strong>لس</strong> را از صفر یاد بگیرید، این راهنما برای شماست.
        در این آموزش، مسیر کاربر از لحظه ورود به صفحه ثبت‌نام یا ورود، تا ساخت لینک کوتاه،
        تنظیم <strong>UTM</strong>، مدیریت لینک‌ها، خرید اشتراک و مشاهده آمار کامل توضیح داده شده است.
      </Typography>

      <Typography mb={2}>
        این صفحه به‌صورت آموزشی طراحی شده تا هم برای کاربران تازه‌وارد مفید باشد و هم برای کسانی
        که می‌خواهند از امکانات حرفه‌ای <strong>لس</strong> برای بازاریابی، اشتراک‌گذاری لینک،
        تحلیل ورودی‌ها و مدیریت بهتر لینک‌های خود استفاده کنند.
      </Typography>

      <Divider sx={{ my: 5 }} />

      <Box component="section" mb={6}>
        <Typography component="h2" variant="h4" mb={3} fontWeight="bold">
          1) شروع کار: ثبت‌نام یا ورود
        </Typography>

        <Typography mb={2}>
          اولین قدم برای استفاده از <strong>لس</strong> این است که وارد صفحه ثبت‌نام یا صفحه ورود شوید.
          اگر از قبل حساب کاربری دارید، می‌توانید مستقیم وارد صفحه ورود شوید. اگر هنوز حساب ندارید،
          باید از صفحه ثبت‌نام شروع کنید.
        </Typography>

        <List>
          <ListItem sx={{ display: "list-item" }}>
            صفحه ثبت‌نام:{" "}
            <a href="https://a.l1s.ir/register" target="_blank" rel="noopener noreferrer">
              https://a.l1s.ir/register
            </a>
          </ListItem>
          <ListItem sx={{ display: "list-item" }}>
            صفحه ورود:{" "}
            <a href="https://a.l1s.ir/login" target="_blank" rel="noopener noreferrer">
              https://a.l1s.ir/login
            </a>
          </ListItem>
        </List>

        <Box component="figure" mt={4} mb={4} sx={{ m: 0 }}>
          <Image
            src="/images/register-login-guide.webp"
            alt="آموزش ثبت‌نام و ورود در لس"
            width={1200}
            height={675}
            style={{
              width: "100%",
              height: "auto",
              borderRadius: "16px",
              border: "1px solid #e5e7eb",
            }}
          />
          <Typography
            component="figcaption"
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1.5, textAlign: "center" }}
          >
            آموزش تصویری ثبت‌نام و ورود به حساب کاربری در لس
          </Typography>
        </Box>

      </Box>

      <Box component="section" mb={6}>
        <Typography component="h2" variant="h4" mb={3} fontWeight="bold">
          2) ورود با شماره موبایل و انتخاب روش ورود
        </Typography>

        <Typography mb={2}>
          در <strong>لس</strong>، کاربر شماره موبایل خود را وارد می‌کند. اگر قبلاً حساب داشته باشد،
          وارد حساب می‌شود و اگر نداشته باشد، فرآیند ثبت‌نام برای او انجام می‌شود.
        </Typography>

        <Typography mb={2}>
          نکته مهم این است که برای <strong>ثبت‌نام</strong> وارد کردن شماره موبایل الزامی است.
          بعد از وارد کردن شماره، کاربر می‌تواند یکی از روش‌های ورود را انتخاب کند:
        </Typography>

        <List>
          <ListItem sx={{ display: "list-item" }}>ورود با رمز عبور</ListItem>
          <ListItem sx={{ display: "list-item" }}>
            ورود با دریافت پیامک و استفاده از کد ارسال‌شده
          </ListItem>
        </List>

        <Typography mb={2}>
          این ساختار باعث می‌شود کاربر هم سریع‌تر وارد شود و هم در صورت نیاز، انتخاب انعطاف‌پذیری
          بین رمز و پیامک داشته باشد.
        </Typography>

        <Box component="figure" mt={4} mb={4} sx={{ m: 0, textAlign: "center" }}>
          <Box
            sx={{
              display: "inline-block",
              width: "100%",
              maxWidth: 450, // اندازه مناسب، می‌تونی کمتر/بیشترش کنی
            }}
          >
            <Image
              src="/images/login-guide.webp"
              alt="آموزش ورود در لس"
              width={1200}
              height={675}
              style={{
                width: "100%",
                height: "auto",
                borderRadius: "16px",
                border: "1px solid #e5e7eb",
                display: "block",
              }}
            />
          </Box>

          <Typography
            component="figcaption"
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1.5, textAlign: "center" }}
          >
            آموزش تصویری ورود به حساب کاربری در لس
          </Typography>
        </Box>

      </Box>

      <Box component="section" mb={6}>
        <Typography component="h2" variant="h4" mb={3} fontWeight="bold">
          3) پیام مهم بعد از ورود: ذخیره کردن رمز
        </Typography>

        <Typography mb={2}>
          بعد از اینکه کاربر وارد حساب خود شد، وارد <strong>داشبورد کاربری</strong> می‌شود.
          در این بخش یک پیام بسیار مهم داخل یک کادر به او نمایش داده می‌شود.
        </Typography>

        <Typography mb={2}>
          مضمون این پیام این است که کاربر باید <strong>رمز خود را کپی و ذخیره کند</strong>.
          پس از اینکه رمز را ذخیره کرد، باید روی گزینه‌ای مثل <strong>«ذخیره کردم»</strong> بزند
          تا این پیام دیگر نمایش داده نشود.
        </Typography>

        <Typography mb={2}>
          این مرحله اهمیت زیادی دارد، چون کاربر باید اطلاعات ورود خود را در جای امن نگه دارد تا
          در ورودهای بعدی با مشکل مواجه نشود.
        </Typography>

        <Box component="figure" mt={4} mb={4} sx={{ m: 0 }}>
          <Image
            src="/images/save-password-guide.png"
            alt="آموزش  ذخیره کردن رمز بعد از ورود"
            width={1200}
            height={675}
            style={{
              width: "100%",
              height: "auto",
              borderRadius: "16px",
              border: "1px solid #e5e7eb",
            }}
          />
          <Typography
            component="figcaption"
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1.5, textAlign: "center" }}
          >
            آموزش تصویری ذخیره کردن رمز بعد از ثبت نام در لِس
          </Typography>
        </Box>
      </Box>

      <Box component="section" mb={6}>
        <Typography component="h2" variant="h4" mb={3} fontWeight="bold">
          4) منوی داشبورد و بخش‌های مهم حساب کاربری
        </Typography>

        <Typography mb={2}>
          در داشبورد <strong>لس</strong>، در بالا سمت راست یک منو قرار دارد که با باز شدن آن،
          سایدبار یا فهرست گزینه‌های کاربری نمایش داده می‌شود.
        </Typography>

        <Typography mb={2}>
          از این منو، کاربر می‌تواند به بخش‌های مهم مختلف دسترسی داشته باشد:
        </Typography>

        <List>
          <ListItem sx={{ display: "list-item" }}>
            <strong>خرید اشتراک</strong> برای ارتقای امکانات حساب
          </ListItem>
          <ListItem sx={{ display: "list-item" }}>
            <strong>ویرایش پروفایل</strong> برای تغییر نام، نام خانوادگی و رمز عبور
          </ListItem>
          <ListItem sx={{ display: "list-item" }}>
            دسترسی سریع به تنظیمات حساب و مدیریت بهتر سرویس
          </ListItem>
        </List>

        <Typography mb={2}>
          این ساختار به کاربر کمک می‌کند بدون سردرگمی، تمام بخش‌های مهم حساب خود را از یک منوی ساده
          مدیریت کند.
        </Typography>

        <Box component="figure" mt={4} mb={4} sx={{ m: 0 }}>
          <Image
            src="/images/dashboard-menu-guide.png"
            alt="آموزش منوی داشبورد و بخش های مهم کاربری"
            width={1200}
            height={675}
            style={{
              width: "100%",
              height: "auto",
              borderRadius: "16px",
              border: "1px solid #e5e7eb",
            }}
          />
          <Typography
            component="figcaption"
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1.5, textAlign: "center" }}
          >
            آموزش تصویری منوی داشبورد لِس
          </Typography>
        </Box>
      </Box>

      <Box component="section" mb={6}>
        <Typography component="h2" variant="h4" mb={3} fontWeight="bold">
          5) اشتراک رایگان و اشتراک پرو در لس
        </Typography>

        <Typography mb={2}>
          بعد از ورود، کاربر می‌تواند از پلن‌های مختلف <strong>لس</strong> استفاده کند.
        </Typography>

        <List>
          <ListItem sx={{ display: "list-item" }}>
            <strong>اشتراک رایگان:</strong> به مدت ۷ روز فعال می‌شود و امکان ساخت تا ۵۰ لینک را
            در اختیار کاربر قرار می‌دهد.
          </ListItem>
          <ListItem sx={{ display: "list-item" }}>
            <strong>اشتراک پرو:</strong> به مدت ۴۵ روز فعال است و هزینه آن ۱۴۹ هزار تومان است.
          </ListItem>
        </List>

        <Typography mb={2}>
          کاربر می‌تواند از طریق گزینه <strong>اشتراک</strong> در منوی داشبورد، پلن مناسب خود را
          انتخاب و خریداری کند.
        </Typography>

        <Typography mb={2}>
          اگر کاربر در حال شروع کار باشد، اشتراک رایگان برای آشنایی با امکانات سرویس بسیار مناسب است.
          اما برای استفاده حرفه‌ای‌تر و ادامه فعالیت، اشتراک پرو انتخاب کامل‌تری خواهد بود.
        </Typography>

        <Box component="figure" mt={4} mb={4} sx={{ m: 0 }}>
          <Image
            src="/images/plans-guide.png"
            alt="آموزش پلن ها و اشتراک"
            width={1200}
            height={675}
            style={{
              width: "100%",
              height: "auto",
              borderRadius: "16px",
              border: "1px solid #e5e7eb",
            }}
          />
          <Typography
            component="figcaption"
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1.5, textAlign: "center" }}
          >
            آموزش تصویری پلن ها و اشتراک ها
          </Typography>
        </Box>
      </Box>

      <Box component="section" mb={6}>
        <Typography component="h2" variant="h4" mb={3} fontWeight="bold">
          6) آموزش ساخت لینک کوتاه در لس
        </Typography>

        <Typography mb={2}>
          یکی از مهم‌ترین قابلیت‌های <strong>لس</strong>، ساخت لینک کوتاه از داخل همان صفحه‌ای است
          که کاربر بعد از ورود یا ثبت‌نام وارد آن می‌شود.
        </Typography>

        <Typography mb={2}>
          برای این کار، کاربر روی دکمه <strong>ایجاد لینک</strong> می‌زند. سپس یک پنجره یا مودال باز
          می‌شود که تمام تنظیمات لازم برای ساخت لینک در آن قرار دارد.
        </Typography>

        <Typography mb={2}>
          در این بخش، کاربر می‌تواند لینک خود را با توجه به نیازش شخصی‌سازی کند و آن را برای استفاده
          عادی، کمپین تبلیغاتی یا اشتراک‌گذاری حرفه‌ای آماده کند.
        </Typography>

          <Box component="figure" mt={4} mb={4} sx={{ m: 0, textAlign: "center" }}>
          <Box
            sx={{
              display: "inline-block",
              width: "100%",
              maxWidth: 450, // اندازه مناسب، می‌تونی کمتر/بیشترش کنی
            }}
          >
          <Image
            src="/images/create-link-guide.png"
            alt="آموزش ساخت لینک در لِس"
            width={1200}
            height={675}
            style={{
              width: "100%",
              height: "auto",
              borderRadius: "16px",
              border: "1px solid #e5e7eb",
              display: "block",
            }}
          />
          <Typography
            component="figcaption"
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1.5, textAlign: "center" }}
          >
            آموزش تصویری ایجاد لینک در لس
          </Typography>
        </Box>
      </Box>
          </Box>
      <Box component="section" mb={6}>
        <Typography component="h2" variant="h4" mb={3} fontWeight="bold">
          7) تنظیمات لینک: رمز، لینک دلخواه، UTM و هدایت به تبلیغات
        </Typography>

        <Typography mb={2}>
          وقتی پنجره ساخت لینک باز می‌شود، کاربر به چند قابلیت مهم دسترسی دارد که باعث می‌شود لینک
          نهایی کاملاً حرفه‌ای و قابل مدیریت باشد.
        </Typography>

        <List>
          <ListItem sx={{ display: "list-item" }}>
            <strong>رمزدار کردن لینک:</strong> اگر کاربر بخواهد فقط افراد مشخصی به مقصد لینک دسترسی
            داشته باشند، می‌تواند روی لینک رمز بگذارد.
          </ListItem>
          <ListItem sx={{ display: "list-item" }}>
            <strong>انتخاب لینک دلخواه:</strong> کاربر می‌تواند بخش انتهایی لینک را شخصی‌سازی کند تا
            لینک خواناتر، برندمحورتر و حرفه‌ای‌تر باشد.
          </ListItem>
          <ListItem sx={{ display: "list-item" }}>
            <strong>تنظیم UTM:</strong> این قابلیت برای تحلیل کمپین‌های تبلیغاتی، بررسی منبع ورودی،
            مدیوم، کمپین و سایر داده‌های بازاریابی بسیار مهم است.
          </ListItem>
          <ListItem sx={{ display: "list-item" }}>
            <strong>هدایت به صفحه تبلیغات:</strong> کاربر می‌تواند لینک را طوری تنظیم کند که قبل از
            رسیدن مخاطب به مقصد اصلی، ابتدا صفحه تبلیغاتی نمایش داده شود.
          </ListItem>
        </List>

        <Typography mb={2}>
          این ویژگی تبلیغاتی باعث می‌شود بخشی از درآمد تبلیغات، بر اساس امتیازی که سیستم برای کاربر
          محاسبه می‌کند، به او اختصاص داده شود.
        </Typography>

        <Typography mb={2}>
          بعد از انجام <strong>تسویه</strong>، امتیاز کاربر <strong>صفر</strong> می‌شود و محاسبه مجدد
          از ابتدا ادامه پیدا می‌کند.
        </Typography>
      </Box>

      <Box component="section" mb={6}>
        <Typography component="h2" variant="h4" mb={3} fontWeight="bold">
          8) مدیریت لینک‌ها: ویرایش، جزئیات، فعال‌سازی و حذف
        </Typography>

        <Typography mb={2}>
          بعد از ساخت لینک، در همان داشبورد یک لیست از لینک‌ها نمایش داده می‌شود. این لیست فقط برای
          مشاهده نیست، بلکه کاربر می‌تواند مدیریت کامل روی هر لینک داشته باشد.
        </Typography>

        <List>
          <ListItem sx={{ display: "list-item" }}>
            <strong>ویرایش لینک:</strong> با کلیک روی آیکون مربوطه، کاربر می‌تواند تنظیمات لینک را
            تغییر دهد.
          </ListItem>
          <ListItem sx={{ display: "list-item" }}>
            <strong>مشاهده جزئیات و آمار:</strong> با انتخاب آیکون جزئیات، صفحه آمار کامل آن لینک باز
            می‌شود.
          </ListItem>
          <ListItem sx={{ display: "list-item" }}>
            <strong>فعال یا غیرفعال کردن لینک:</strong> اگر کاربر بخواهد موقتاً دسترسی به لینک قطع
            شود، می‌تواند آن را غیرفعال کند و هر زمان خواست دوباره فعالش کند.
          </ListItem>
          <ListItem sx={{ display: "list-item" }}>
            <strong>حذف لینک:</strong> در صورت عدم نیاز، لینک قابل حذف است.
          </ListItem>
          <ListItem sx={{ display: "list-item" }}>
            <strong>تست لینک:</strong> خود لینک در لیست نمایش داده می‌شود و کاربر می‌تواند همان‌جا آن
            را باز کند و تست بگیرد.
          </ListItem>
        </List>

        <Typography mb={2}>
          این امکانات برای مدیریت حرفه‌ای لینک‌ها ضروری هستند، مخصوصاً زمانی که کاربر تعداد زیادی لینک
          فعال داشته باشد.
        </Typography>

        <Box component="figure" mt={4} mb={4} sx={{ m: 0 }}>
          <Image
            src="/images/tutorial_l1s-link-shortener.png"
            alt="آموزش مدیریت لینک در لس"
            width={1200}
            height={675}
            style={{
              width: "100%",
              height: "auto",
              borderRadius: "16px",
              border: "1px solid #e5e7eb",
            }}
          />
          <Typography
            component="figcaption"
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1.5, textAlign: "center" }}
          >
            آموزش تصویری مدیریت لینک
          </Typography>
        </Box>
      </Box>

      <Box component="section" mb={6}>
        <Typography component="h2" variant="h4" mb={3} fontWeight="bold">
          9) مشاهده آمار کامل لینک‌ها
        </Typography>

        <Typography mb={2}>
          یکی از بخش‌های کلیدی در <strong>لس</strong>، صفحه <strong>آمار و جزئیات لینک</strong> است.
          کاربر از طریق آیکون مربوط به هر لینک می‌تواند وارد این بخش شود.
        </Typography>

        <Typography mb={2}>
          در این صفحه، اطلاعات آماری لینک نمایش داده می‌شود تا کاربر بتواند عملکرد هر لینک را بهتر
          تحلیل کند. این موضوع برای بازاریابی، تحلیل کمپین، بررسی کیفیت ترافیک و تصمیم‌گیری بهتر
          بسیار مهم است.
        </Typography>

        <Typography mb={2}>
          اگر کاربر از <strong>UTM</strong> استفاده کرده باشد، ارزش این آمار حتی بیشتر می‌شود، چون
          می‌تواند نتایج ورودی‌های مختلف را دقیق‌تر بررسی کند.
        </Typography>

        <Box component="figure" mt={4} mb={4} sx={{ m: 0 }}>
          <Image
            src="/images/hero-dashboard.webp"
            alt="آموزش صفحه آمار کامل لینک"
            width={1200}
            height={675}
            style={{
              width: "100%",
              height: "auto",
              borderRadius: "16px",
              border: "1px solid #e5e7eb",
            }}
          />
          <Typography
            component="figcaption"
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1.5, textAlign: "center" }}
          >
            آموزش تصویری صفحه آمار کامل لینک
          </Typography>
        </Box>
      </Box>

      <Box component="section" mb={6}>
        <Typography component="h2" variant="h4" mb={3} fontWeight="bold">
          10) چرا این آموزش برای کاربران جدید مهم است؟
        </Typography>

        <Typography mb={2}>
          خیلی از کاربران وقتی برای اولین بار وارد یک سرویس کوتاه‌کننده لینک می‌شوند، نمی‌دانند باید
          از کجا شروع کنند، ثبت‌نام چگونه انجام می‌شود، تنظیمات لینک دقیقاً چه کاربردی دارد و آمارها را
          از کجا باید دید.
        </Typography>

        <Typography mb={2}>
          این راهنما به شکلی نوشته شده که کاربر بتواند مرحله‌به‌مرحله با <strong>لس</strong> آشنا شود،
          حساب خود را بسازد، رمز را ذخیره کند، لینک ایجاد کند، از قابلیت‌های پیشرفته مثل
          <strong> UTM</strong> و <strong>تبلیغات</strong> استفاده کند و در نهایت گزارش عملکرد لینک‌های
          خود را ببیند.
        </Typography>
      </Box>

      <Divider sx={{ my: 5 }} />

      <Box component="section" mb={6}>
        <Typography component="h2" variant="h4" mb={3} fontWeight="bold">
          سوالات متداول
        </Typography>

        <List>
          {faqItems.map((faq, idx) => (
            <ListItem key={idx} sx={{ display: "block", mb: 2 }}>
              <Typography variant="h6" mb={1}>
                {faq.q}
              </Typography>
              <Typography>{faq.a}</Typography>
            </ListItem>
          ))}
        </List>
      </Box>

      <Divider sx={{ my: 5 }} />

      <section id="internal-links">
        <Typography component="h2" variant="h4" mb={3} fontWeight="bold">
          صفحات پیشنهادی
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={2}>
          {[
            { href: "https://a.l1s.ir/home", title: "صفحه اصلی" },
            { href: "https://a.l1s.ir/faq", title: "سوالات متداول" },
            { href: "https://a.l1s.ir/terms", title: "قوانین و حریم خصوصی" },
            { href: "https://a.l1s.ir/register", title: "ثبت‌نام در لس" },
            { href: "https://a.l1s.ir/login", title: "ورود به حساب کاربری" },
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
                color: "text.primary",
                "&:hover": {
                  boxShadow: 4,
                  transform: "translateY(-4px)",
                  backgroundColor: "primary.light",
                  color: "white",
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

export default LinkShortenerGuidePage;
