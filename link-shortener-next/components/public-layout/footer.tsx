import Link from "next/link"
import Script from "next/script"
import {
  Box,
  Container,
  Stack,
  Typography,
  IconButton,
} from "@mui/material"
// import { FaTelegramPlane, FaInstagram, FaFacebookF, FaLinkedin } from "react-icons/fa"
import FaTelegramPlane from "@mui/icons-material/Telegram";
import FaInstagram from '@mui/icons-material/Instagram';
// import {BsMessenger} from "react-icons/bs";
import Image from "next/image"


export default function Footer({ enamadCode }: { enamadCode: string }) {
  return (
    <>
      {/* ✅ Structured Data */}
      <Script
        id="footer-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "لِس",
            url: "https://l1s.ir",
            logo: "https://a.l1s.ir/favicon.png",
            sameAs: [
              "https://t.me/l1s_link_shortener",
              "https://www.instagram.com/lis.link_shortener"
            ],
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "customer support",
              areaServed: "IR",
              availableLanguage: "Persian",
              url: "https://eitaa.com/poshtiban1i"
            }
          })
        }}
      />

      <Box
        component="footer"
        sx={{
          borderTop: "1px solid #e2e8f0",
          bgcolor: "#f9fafb",
          py: 8,
          mt: 10,
        }}
      >
        <Container maxWidth="lg">

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={6}
            justifyContent="space-between"
          >
            {/* ✅ Branding Section */}
            <Box maxWidth={400}>
              <Typography variant="h6" component="h2" fontWeight={700} sx={{ color: "#475569" }}>
                کوتاه‌کننده لینک لِس
              </Typography>

              <Typography variant="body2" sx={{ color: "#475569", mt: 1 }}>
                سرویس حرفه‌ای کوتاه‌کننده لینک با قابلیت مدیریت، آنالیز، ردیابی کلیک،
                ساخت Bio Link و API اختصاصی. مناسب بازاریابی دیجیتال، شبکه‌های اجتماعی
                و کمپین‌های تبلیغاتی.
              </Typography>

              {/* eNamad */}
              <Box
                sx={{ mt: 3 }}
                aria-label="نماد اعتماد الکترونیکی"
                dangerouslySetInnerHTML={{ __html: enamadCode }}
              />
            </Box>

            {/* ✅ Navigation (SEO Optimized) */}
            <nav aria-label="لینک‌های فوتر">
  <Stack
    direction="row"
    spacing={3}
    flexWrap="wrap"
    sx={{
      "& a": {
        color: "#334155",
        textDecoration: "none",
        fontSize: "14px",
        fontWeight: 500,
        transition: "0.2s",
      },
      "& a:hover": {
        color: "#6b21a8",
      },
    }}
  >
    <Link href="/">خانه</Link>
    <Link href="/tutorial">آموزش استفاده</Link>
    <Link href="/short-url-generator">ساخت لینک کوتاه</Link>
    <Link href="/short-url-generator">کوتاه کننده لینک رایگان</Link>
    <Link href="/terms">حریم خصوصی و قوانین</Link>
    <Link href="/url-shortener">API کوتاه کننده لینک</Link>
    <Link href="/bio-link">ساخت Bio Link</Link>
    <Link href="/faq">سوالات متداول</Link>
  </Stack>
</nav>


            {/* ✅ Social + Contact */}
              <Typography
    variant="h6"
    component="h2"
    sx={{ color: "#1e293b", mb: 2, fontWeight: "bold" }}
  >
    ارتباط با ما
  </Typography>
<address style={{ fontStyle: "normal" }}>
  <Stack
    direction="row"
    spacing={{ xs: 1, sm: 2 }}
    alignItems="center"
    flexWrap="wrap"
    sx={{
      rowGap: 1, // برای زمانی که wrap اتفاق می‌افتد
      maxWidth: "100%",
    }}
  >
    <IconButton
      component="a"
      href="https://t.me/l1s_link_shortener"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تلگرام لِس"
      sx={{ color: "#334155" }}
    >
      <FaTelegramPlane />
    </IconButton>

    <IconButton
      component="a"
      href="https://www.instagram.com/lis.link_shortener"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="اینستاگرام لِس"
      sx={{ color: "#334155" }}
    >
      <FaInstagram />
    </IconButton>

    <Typography
      variant="body2"
      sx={{ color: "#334155", minWidth: "max-content" }}
    >
      پشتیبانی:
    </Typography>

    <IconButton
      component="a"
      href="sms:+9830002108006027"
      aria-label="ارسال پیامک به پشتیبانی"
      sx={{
        bgcolor: "#f3e8ff",
        "&:hover": { bgcolor: "#e9d5ff" },
        borderRadius: 2,
        px: 1.5,
      }}
    >
      <Typography
        variant="caption"
        sx={{ color: "#6b21a8", fontWeight: 600 }}
      >
        30002108006027
      </Typography>
    </IconButton>

    <IconButton
      component={Link}
      href="https://rubika.ir/poshtiiban1i"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="روبیکا"
      sx={{ p: 0 }}
    >
      <Image src="/social/rubika.png" alt="روبیکا" width={28} height={28} />
    </IconButton>

    <IconButton
      component={Link}
      href="https://eitaa.com/poshtiban1i"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="ایتا"
      sx={{ p: 0 }}
    >
      <Image src="/social/eitaa.png" alt="ایتا" width={28} height={28} />
    </IconButton>

    <IconButton
      component={Link}
      href="@poshtiiban1i"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="بله"
      sx={{ p: 0 }}
    >
      <Image src="/social/bale.png" alt="بله" width={28} height={28} />
    </IconButton>
  </Stack>
</address>
          </Stack>

          {/* ✅ Copyright */}
          <Typography
            variant="body2"
            sx={{ color: "#64748b", textAlign: "center", mt: 8 }}
          >
            © {new Date().getFullYear()} L1s.ir (لِس) — تمامی حقوق محفوظ است.
          </Typography>
        </Container>
      </Box>
    </>
  )
}