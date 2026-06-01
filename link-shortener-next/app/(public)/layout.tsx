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
import Footer from "@/components/public-layout/footer";


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
    { title: "آموزش کوتاه کننده لینک لِس", href: "/tutorial" },
    { title: "تولید کننده لینک کوتاه", href: "/short-url-generator" },
    { title: "حریم خصوصی و قوانین", href: "/terms" },
    { title: "API", href: "/url-shortener" },
    { title: "FAQ", href: "/faq" },
    { title: "لینک بیو", href: "/bio-link" },
  ];

  return (
    <>
      {/* 🏷️ SEO Meta */}
      <Head>
        <title>کوتاه‌کننده لینک لِس | سریع، امن و حرفه‌ای</title>
        <meta
          name="description"
          content="L1s (لِس) یک سرویس کوتاه‌کننده لینک سریع، امن و حرفه‌ای برای کوتاه کردن، مدیریت و ردیابی لینک‌ها است."
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="کوتاه‌کننده لینک لِس" />
        <meta property="og:description" content="سرویس کوتاه‌کننده لینک سریع و امن" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="a.l1s.ir" />
        <meta property="og:image" content="https://a.l1s.ir/images/l1s_preview.png" />
        <meta name="twitter:title" content="کوتاه‌کننده لینک لِس" />
        <meta name="twitter:description" content="سرویس کوتاه‌کننده لینک سریع و امن" />
        <meta name="twitter:image" content="https://a.l1s.ir/images/l1s_preview.png" />
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
  elevation={0}
  sx={{
    bgcolor: "#fff",
    color: "#0f172a",
    borderBottom: "1px solid #e2e8f0",
  }}
>

<Container
  maxWidth="lg"
  sx={{
    px: { xs: 2, md: 3 },
  }}
>
    <Toolbar
  sx={{
    gap: 2,
    minHeight: { xs: 64, md: 80 },
    alignItems: "center",
    py: { xs: 0.5, md: 1 },
  }}
>            {/* Logo */}
            <Typography
  variant="h6"
  component={NextLink}
  href="/home"
  sx={{
    textDecoration: "none",
    color: "inherit",
    fontWeight: 800,
    letterSpacing: "-0.5px",
    fontSize: { xs: "1.1rem", md: "1.3rem" },
  }}
>
لِس
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
    <Drawer
      anchor="right"
      open={mobileOpen}
      onClose={handleDrawerToggle}
      PaperProps={{
        sx: {
          width: 280,
          px: 2,
          pt: 3,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        },
      }}
    >
      {/* ناوبری بالا */}
      <Box sx={{ flex: 1 }}>
        <List>
          {navLinks.map((link) => (
            <ListItemButton key={link.href} component={NextLink} href={link.href} sx={{ py: 1 }}>
              <ListItemText primary={link.title} />
            </ListItemButton>
          ))}
        </List>
        {/* Divider داریم */}
        <Box sx={{ borderTop: "1px solid #eee", my: 2 }} />
      </Box>
      {/* ورود/ثبت‌نام یا داشبورد/خروج پایین */}
      <Stack direction="column" spacing={1} sx={{ mb: 2 }}>
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
                width: "100%",
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
                width: "100%",
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
              sx={{ textTransform: "none", width: "100%" }}
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
                width: "100%",
              }}
            >
              خروج
            </Button>
          </>
        )}
      </Stack>
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
        <Footer  enamadCode={enamadCode} />
    </>
  );
}
