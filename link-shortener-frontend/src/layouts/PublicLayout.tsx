import type { ReactNode } from "react";
import { Outlet, Link as RouterLink } from "react-router-dom";
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

interface PublicLayoutProps {
  children?: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <>
      <CssBaseline />

      {/* 🔝 Progress Bar (همیشه بالای صفحه) */}
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
          zIndex: 2000, // بالاتر از AppBar
        }}
      />

      {/* Header */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "#ffffff",
          color: "#0f172a",
          borderBottom: "1px solid #e2e8f0",
          zIndex: 1500, // پایین‌تر از progress bar
        }}
      >
        <Toolbar sx={{ gap: 2, minHeight: 72 }}>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/home"
            style={{ textDecoration: "none", color: "inherit" }}
            sx={{ fontWeight: 800, letterSpacing: "-0.5px" }}
          >
            وان اس ال
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          <Button component={RouterLink} to="/home" color="inherit" sx={{ textTransform: "none" }}>
            خانه
          </Button>

          <Button
            component={RouterLink}
            to="/login"
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
            component={RouterLink}
            to="/register"
            variant="contained"
            sx={{
              textTransform: "none",
              bgcolor: "#9333ea",
              "&:hover": { bgcolor: "#7e22ce" },
            }}
          >
            ثبت‌نام
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main */}
      <Container component="main" maxWidth="lg" sx={{ py: 6 }}>
        {children ?? <Outlet />}
      </Container>

      {/* Footer */}
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
          © {new Date().getFullYear()} کوتاه‌کنـده — ساخته‌شده با 💜
        </Typography>
        <Link href="tel:09396092135" sx={{ display: "block", mt: 1, color: "#6b21a8" }}>
          تبلیغات: 09396092135
        </Link>
      </Box>
    </>
  );
}
