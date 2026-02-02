"use client";

import {useState, type ReactNode } from "react";
import {
  AppBar,
  Toolbar,
  Container,
  Typography,
  Button,
  Stack,
  Box,
  CssBaseline,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  useMediaQuery,
    Link as MuiLink
} from "@mui/material";

import { motion, useScroll, useTransform } from "framer-motion";
import { useUserStore } from "@/store/userStore";
import NextLink from "next/link";
import Head from "next/head";
import apiClient from "@/lib/axios";
import { router } from "next/client";
// import { FaFacebookF, FaInstagram, FaTelegramPlane, FaLinkedin } from "react-icons/fa";
import FaFacebookF from '@mui/icons-material/Facebook';
import FaInstagram from '@mui/icons-material/Instagram';
import FaTelegramPlane from '@mui/icons-material/Telegram';
import FaLinkedin from '@mui/icons-material/LinkedIn';
import MenuIcon from "@mui/icons-material/Menu";


interface PublicLayoutProps {
  children: ReactNode;
}

const enamadCode = `
  <a referrerpolicy='origin' target='_blank' href='https://trustseal.enamad.ir/?id=647916&Code=RbBIen4xSg5as0EBSm90wdtNge118hJf'>
    <img referrerpolicy='origin' src='https://trustseal.enamad.ir/logo.aspx?id=647916&Code=RbBIen4xSg5as0EBSm90wdtNge118hJf' alt='نماد اعتماد الکترونیکی' style='cursor:pointer' code='RbBIen4xSg5as0EBSm90wdtNge118hJf'>
  </a>
`;

export default function PublicLayout({ children }: PublicLayoutProps) {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const { user, setUser } = useUserStore();

  const handleLogout = async () => {
    await apiClient.post("/auth/logout");
    const { setUser, setQuota, setIsLoading } = useUserStore.getState();
    setUser(null);
    setQuota(null);
    setIsLoading(false);
    await router.push("/login");
  };
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width:900px)");

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

const navLinks = [
    { title: "خانه", href: "/home" },
    { title: "بهترین لینک کوتاه", href: "/best-url-shortener" },
    { title: "تولید لینک کوتاه", href: "/short-url-generator" },
    { title: "رایگان", href: "/free-url-shortener" },
    { title: "حرفه‌ای", href: "/link-shortener" },
    { title: "API", href: "/url-shortener" },
    { title: "FAQ", href: "/faq" },
  ];

  return (
    <>
      {/* 🏷️ SEO Meta */}
      <Head>
        <title>کوتاه‌کننده لینک لِس (L1s) | سریع، امن و حرفه‌ای</title>
        <meta
          name="description"
          content="L1s (لِس) یک سرویس کوتاه‌کننده لینک سریع، امن و حرفه‌ای برای کوتاه کردن، مدیریت و ردیابی لینک‌ها است."
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="کوتاه‌کننده لینک لِس (L1s)" />
        <meta property="og:description" content="سرویس کوتاه‌کننده لینک سریع و امن" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="a.l1s.ir" />
        <meta property="og:image" content="https://a.l1s.ir/images/l1s_preview.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://l1s.ir" />
      </Head>

      <CssBaseline />

      {/* 🔝 Progress Bar */}
      <motion.div
        style={{
          scaleX,
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: "linear-gradient(90deg, #a855f7, #ec4899)",
          transformOrigin: "0%",
          zIndex: 2000,
        }}
      />

      {/* 🧭 Header */}
      <AppBar
        position="sticky"
        elevation={2}
        sx={{
          bgcolor: "#fff",
          color: "#0f172a",
          borderBottom: "1px solid #e2e8f0",
          zIndex: 1500,
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ gap: 2, minHeight: 72, flexWrap: "wrap" }}>
            {/* Logo */}
            <Typography
              variant="h6"
              component={NextLink}
              href="/home"
              style={{ textDecoration: "none", color: "inherit" }}
              sx={{ fontWeight: 800, letterSpacing: "-0.5px" }}
            >
              لِس (L1s)
            </Typography>

            {/* Spacer */}
            <Box sx={{ flexGrow: 1 }} />

            {/* Desktop Navigation */}
            {!isMobile && (
              <Stack direction="row" spacing={1} alignItems="center">
                {navLinks.map((link) => (
                  <Button key={link.href} component={NextLink} href={link.href} color="inherit">
                    {link.title}
                  </Button>
                ))}

                {!user ? (
                  <>
                    <Button
                      component={NextLink}
                      href="/login"
                      variant="outlined"
                      sx={{
                        textTransform: "none",
                        borderColor: "#c084fc",
                        color: "#6b21a8",
                        "&:hover": { borderColor: "#a855f7", backgroundColor: "#faf5ff" },
                      }}
                    >
                      ورود
                    </Button>
                    <Button
                      component={NextLink}
                      href="/register"
                      variant="contained"
                      sx={{
                        textTransform: "none",
                        bgcolor: "#9333ea",
                        "&:hover": { bgcolor: "#7e22ce" },
                      }}
                    >
                      ثبت‌نام
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      component={NextLink}
                      href={user.role === "admin" ? "/admin/dashboard" : "/dashboard"}
                      color="inherit"
                      sx={{ textTransform: "none" }}
                    >
                      داشبورد من
                    </Button>
                    <Button
                      onClick={handleLogout}
                      variant="outlined"
                      sx={{
                        textTransform: "none",
                        borderColor: "#fca5a5",
                        color: "#b91c1c",
                        "&:hover": { borderColor: "#ef4444", backgroundColor: "#fee2e2" },
                      }}
                    >
                      خروج
                    </Button>
                  </>
                )}
              </Stack>
            )}

            {/* Mobile Menu */}
            {isMobile && (
              <>
                <IconButton onClick={handleDrawerToggle} color="inherit">
                  <MenuIcon />
                </IconButton>
                <Drawer anchor="right" open={mobileOpen} onClose={handleDrawerToggle}>
                  <Box sx={{ width: 250, p: 2 }} role="presentation" onClick={handleDrawerToggle}>
                    <List>
                      {navLinks.map((link) => (
                        <ListItemButton key={link.href} component={NextLink} href={link.href}>
                          <ListItemText primary={link.title} />
                        </ListItemButton>
                      ))}
                      {!user ? (
                        <>
                          <ListItemButton component={NextLink} href="/login">
                            <ListItemText primary="ورود" />
                          </ListItemButton>
                          <ListItemButton component={NextLink} href="/register">
                            <ListItemText primary="ثبت‌نام" />
                          </ListItemButton>
                        </>
                      ) : (
                        <>
                          <ListItemButton
                            component={NextLink}
                            href={user.role === "admin" ? "/admin/dashboard" : "/dashboard"}
                          >
                            <ListItemText primary="داشبورد من" />
                          </ListItemButton>
                          <ListItemButton onClick={handleLogout}>
                            <ListItemText primary="خروج" />
                          </ListItemButton>
                        </>
                      )}
                    </List>
                  </Box>
                </Drawer>
              </>
            )}
          </Toolbar>
        </Container>
      </AppBar>


      {/* 📄 Main */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {children}
      </Container>

      {/* 🦶 Footer */}
      <Box
        component="footer"
        sx={{
          borderTop: "1px solid #e2e8f0",
          bgcolor: "#f9f9f9",
          py: 6,
          mt: 8,
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={4}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            {/* Branding + Description */}
            <Box sx={{ maxWidth: 350 }}>
              <Typography variant="h6" mb={1} style={{color: "ActiveText" }}>لِس (L1s)</Typography>
              <Typography variant="body2" sx={{ color: "#475569" }}>
                کوتاه‌کننده لینک سریع، امن و حرفه‌ای برای مدیریت، ردیابی و اشتراک‌گذاری لینک‌های شما. مناسب بازاریابی دیجیتال، شبکه‌های اجتماعی و کمپین‌های تبلیغاتی. قابلیت درآمدزایی اختیاری از لینک.
              </Typography>

              <Box sx={{ mt: 2 }} dangerouslySetInnerHTML={{ __html: enamadCode }} />
            </Box>

            {/* Navigation Links */}
            <Stack direction="row" spacing={3} flexWrap="wrap" style={{ color: "ActiveText" }}>
              <MuiLink href="/home" underline="hover" color="inherit">خانه</MuiLink>
              <MuiLink href="/best-url-shortener" underline="hover" color="inherit">بهترین لینک کوتاه</MuiLink>
              <MuiLink href="/short-url-generator" underline="hover" color="inherit">تولید لینک کوتاه</MuiLink>
              <MuiLink href="/free-url-shortener" underline="hover" color="inherit">رایگان</MuiLink>
              <MuiLink href="/link-shortener" underline="hover" color="inherit">حرفه‌ای</MuiLink>
              <MuiLink href="/api/url-shortener" underline="hover" color="inherit">API</MuiLink>
              <MuiLink href="/faq" underline="hover" color="inherit">FAQ</MuiLink>
            </Stack>

            {/* Social & Contact */}
            <Stack direction="row" spacing={2} alignItems="center" mt={{ xs: 3, sm: 0 }}>
              <IconButton component="a" href="https://t.me/l1s_link_shortener" target="_blank" color="primary"><FaTelegramPlane /></IconButton>
              <IconButton component="a" href="https://www.instagram.com/lis.link_shortener" target="_blank" color="primary"><FaInstagram /></IconButton>
              <IconButton component="a" href="#" target="_blank" color="primary"><FaFacebookF /></IconButton>
              <IconButton component="a" href="#" target="_blank" color="primary"><FaLinkedin /></IconButton>
            </Stack>
          </Stack>

          <Typography variant="body2" sx={{ color: "#475569", textAlign: "center", mt: 6 }}>
            © {new Date().getFullYear()} کوتاه‌کننده لینک لِس (L1s) — ساخته‌شده با 💜 | طراحی، پشتیبانی و تبلیغات: <a href="tel:09960074607" style={{ color: "#6b21a8", textDecoration: "none" }}>09960074607</a>
          </Typography>
        </Container>
      </Box>
    </>
  );
}
