"use client";

import type { ReactNode } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
  Link,
  CssBaseline,
} from "@mui/material";
import { motion, useScroll, useTransform } from "framer-motion";
import { useUserStore } from "@/store/userStore";
import NextLink from "next/link";
import Head from "next/head";
import apiClient from "@/lib/axios";
import {router} from "next/client";

interface PublicLayoutProps {
  children: ReactNode;
}

const enamadCode = `
  <a referrerpolicy='origin' target='_blank' href='https://trustseal.enamad.ir/?id=647916&Code=RbBIen4xSg5as0EBSm90wdtNge118hJf'>
    <img referrerpolicy='origin' src='https://trustseal.enamad.ir/logo.aspx?id=647916&Code=RbBIen4xSg5as0EBSm90wdtNge118hJf' alt='' style='cursor:pointer' code='RbBIen4xSg5as0EBSm90wdtNge118hJf'>
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

  return (
    <>
      {/* 🏷️ SEO */}
      <Head>
        <title>کوتاه‌کننده لینک (لِس)L1s | سریع، امن و حرفه‌ای</title>
        <meta
          name="description"
          content="L1s (لِس) یک سرویس کوتاه‌کننده لینک سریع و امن است که لینک‌های شما را کوتاه، قابل‌مدیریت و قابل‌ردیابی می‌کند."
        />
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
          bgcolor: "#ffffff",
          color: "#0f172a",
          borderBottom: "1px solid #e2e8f0",
          zIndex: 1500,
        }}
      >
        <Toolbar sx={{ gap: 2, minHeight: 72 }}>
          <Typography
            variant="h6"
            component={NextLink}
            href="/home"
            style={{ textDecoration: "none", color: "inherit" }}
            sx={{ fontWeight: 800, letterSpacing: "-0.5px" }}
          >
            سرویس کوتاه‌کننده لینک لِس (L1s)
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          <Button
            component={NextLink}
            href="/home"
            color="inherit"
            sx={{ textTransform: "none" }}
          >
            خانه
          </Button>

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
              {user.role === "admin" ? (
                <Button
                  component={NextLink}
                  href="/admin/dashboard"
                  color="inherit"
                  sx={{ textTransform: "none" }}
                >
                  داشبورد ادمین
                </Button>
              ) : (
                <Button
                  component={NextLink}
                  href="/dashboard"
                  color="inherit"
                  sx={{ textTransform: "none" }}
                >
                  داشبورد من
                </Button>
              )}

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
        </Toolbar>
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
          bgcolor: "#ffffff",
          py: 3,
          textAlign: "center",
        }}
      >
        <Typography variant="body2" sx={{ color: "#475569" }}>
          © {new Date().getFullYear()} کوتاه‌کننده لینک لِس (L1s) — ساخته‌شده با 💜
        </Typography>

        {/*<Box*/}
        {/*  sx={{*/}
        {/*    display: "flex",*/}
        {/*    justifyContent: "center",*/}
        {/*    alignItems: "center",*/}
        {/*    gap: 1,*/}
        {/*    mt: 2,*/}
        {/*    px: 2,*/}
        {/*    py: 1,*/}
        {/*    bgcolor: "#f3e8ff",*/}
        {/*    borderRadius: "12px",*/}
        {/*    width: "fit-content",*/}
        {/*    mx: "auto",*/}
        {/*  }}*/}
        {/*>*/}
        {/*  <Link*/}
        {/*    href="mailto:support@l1s.ir"*/}
        {/*    sx={{ color: "#6b21a8", fontWeight: 600, textDecoration: "none" }}*/}
        {/*  >*/}
        {/*    support@l1s.ir*/}
        {/*  </Link>*/}
        {/*</Box>*/}

        <Box sx={{ display: "flex", justifyContent: "center", gap: 3, mt: 2 }}>
          <Link
            href="tel:09960074607"
            sx={{ color: "#6b21a8", fontWeight: 500, textDecoration: "none" }}
          >
            طراحی سایت، پشتیبانی و تبلیغات: 09960074607
          </Link>
          <div dangerouslySetInnerHTML={{ __html: enamadCode }} />
        </Box>
      </Box>
    </>
  );
}
