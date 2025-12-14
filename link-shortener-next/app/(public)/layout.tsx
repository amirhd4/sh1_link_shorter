"use client";

import type { ReactNode } from "react";
import {
  AppBar, Toolbar, Typography, Container, Box, Button, Link, CssBaseline
} from "@mui/material";
import { motion, useScroll, useTransform } from "framer-motion";
import { useUserStore } from "@/store/userStore";
import NextLink from "next/link";

export default function PublicLayout({ children }: { children: ReactNode }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const { user, setUser } = useUserStore();

  const handleLogout = () => {
    document.cookie = "access_token=; Max-Age=0; path=/";
    document.cookie = "role=; Max-Age=0; path=/";
    setUser(null);
  };

  return (
    <>
      <CssBaseline />

      <motion.div
        style={{
          scaleX,
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: "linear-gradient(90deg,#a855f7,#ec4899)",
          transformOrigin: "0%",
          zIndex: 2000,
        }}
      />

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
            sx={{ fontWeight: 800 }}
          >
            سرویس کوتاه‌کننده لینک لِس (L1s)
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          <Button component={NextLink} href="/home" color="inherit">
            خانه
          </Button>

          {!user ? (
            <>
              <Button
                component={NextLink}
                href="/login"
                variant="outlined"
                sx={{ textTransform: "none" }}
              >
                ورود
              </Button>

              <Button
                component={NextLink}
                href="/register"
                variant="contained"
                sx={{ textTransform: "none" }}
              >
                ثبت‌نام
              </Button>
            </>
          ) : (
            <>
              {user.role === "admin" ? (
                <Button component={NextLink} href="/admin/dashboard" color="inherit">
                  داشبورد ادمین
                </Button>
              ) : (
                <Button component={NextLink} href="/dashboard" color="inherit">
                  داشبورد من
                </Button>
              )}

              <Button onClick={handleLogout} variant="outlined">
                خروج
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {children}
      </Container>
    </>
  );
}
