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

const enamadCode = `
    <a referrerpolicy='origin' target='_blank' href='https://trustseal.enamad.ir/?id=647916&Code=RbBIen4xSg5as0EBSm90wdtNge118hJf'><img referrerpolicy='origin' src='https://trustseal.enamad.ir/logo.aspx?id=647916&Code=RbBIen4xSg5as0EBSm90wdtNge118hJf' alt='' style='cursor:pointer' code='RbBIen4xSg5as0EBSm90wdtNge118hJf'></a>
  `;

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
           سرویس کوتاه کننده لینک(L1s)
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
    © {new Date().getFullYear()} کوتاه کننده لینک L1s — ساخته‌شده با 💜
  </Typography>

  {/* بخش پشتیبانی */}
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: 1,
      mt: 2,
      px: 2,
      py: 1,
      bgcolor: "#f3e8ff",
      borderRadius: "12px",
      width: "fit-content",
      mx: "auto",
    }}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="#6b21a8"
      width="20"
      height="20"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 7.5l-9.75 7.5-9.75-7.5M3.75 6.75h16.5c.621 0 1.125.504 
        1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125H3.75a1.125 
        1.125 0 01-1.125-1.125v-9.75c0-.621.504-1.125 
        1.125-1.125z"
      />
    </svg>
    <Link
      href="mailto:support@l1s.ir"
      sx={{
        color: "#6b21a8",
        fontWeight: 600,
        textDecoration: "none",
      }}
    >
      support@l1s.ir
    </Link>
  </Box>

  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: 3,
      mt: 2,
    }}
  >
    <Link
      href="tel:09960074607"
      sx={{ color: "#6b21a8", fontWeight: 500, textDecoration: "none" }}
    >
      تبلیغات: 09960074607
    </Link>
    <div dangerouslySetInnerHTML={{ __html: enamadCode }} />
  </Box>
{/* </Box> */}

      </Box>
    </>
  );
}
