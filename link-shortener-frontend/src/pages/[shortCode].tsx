import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Button, Typography, LinearProgress, Paper } from "@mui/material";
import { motion } from "framer-motion";
import { PlayCircleOutline } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

export default function AdRedirectPage() {
  const { domainId, shortCode } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const [progress, setProgress] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const countdown = 7; // ⏱️ زمان انتظار (به ثانیه)

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let current = 0;
    timer = setInterval(() => {
      current++;
      setProgress((current / countdown) * 100);
      if (current >= countdown) {
        setCanSkip(true);
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSkip = () => {
    const domainValue = domainId && domainId !== "undefined" ? domainId : 0;
    window.location.href = `${import.meta.env.VITE_BACKEND_BASE_URL_ORIGIN}/ad/skip/${domainValue}/${shortCode}`;
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Paper
          elevation={10}
          sx={{
            maxWidth: 600,
            p: 4,
            borderRadius: 4,
            backdropFilter: "blur(10px)",
            backgroundColor: "rgba(255,255,255,0.9)",
            textAlign: "center",
          }}
        >
          <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold", color: "primary.main" }}>
            🎬 لطفاً چند لحظه صبر کنید...
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 3 }}>
            تا پایان تبلیغ و انتقال به مقصد، در صفحه بمانید.
          </Typography>

          {/* 📺 بخش تبلیغات */}
          <Box
            sx={{
              width: "100%",
              height: 250,
              borderRadius: 3,
              overflow: "hidden",
              mb: 3,
              position: "relative",
              boxShadow: 3,
              backgroundColor: "#000",
            }}
          >
            {/* اینجا می‌تونی بعداً iframe یا ویدیو تبلیغاتی بذاری */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2 }}
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: "1.2rem",
              }}
            >
              <PlayCircleOutline sx={{ fontSize: 60, opacity: 0.7 }} />
              <Typography sx={{ ml: 1 }}>در حال نمایش تبلیغ...</Typography>
            </motion.div>
          </Box>

          {/* نوار پیشرفت */}
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 5,
              mb: 2,
            }}
          />

          {/* دکمه رد کردن */}
          <Button
            variant="contained"
            color="success"
            size="large"
            disabled={!canSkip}
            onClick={handleSkip}
            sx={{
              mt: 2,
              borderRadius: 3,
              px: 4,
              py: 1.2,
              fontWeight: "bold",
              fontSize: "1.1rem",
              transition: "all 0.3s ease",
              ":disabled": {
                backgroundColor: "grey.400",
              },
            }}
          >
            {canSkip ? "🚀 رفتن به لینک مقصد" : `منتظر بمانید (${Math.ceil((100 - progress) / (100 / countdown))}s)`}
          </Button>
        </Paper>
      </motion.div>

      {/* بخش پایین صفحه - تبلیغ دوم یا بنر */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Box
          sx={{
            position: "fixed",
            bottom: 10,
            textAlign: "center",
            width: "100%",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: "white",
              textShadow: "0 0 5px rgba(0,0,0,0.5)",
            }}
          >
            تبلیغات توسط سامانه کوتاه‌لینک © {new Date().getFullYear()}
          </Typography>
        </Box>
      </motion.div>
    </Box>
  );
}
