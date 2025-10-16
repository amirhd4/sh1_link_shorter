import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Box, Button, Typography, LinearProgress, Paper, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import { adService } from "../services/adService";
import VisibilitySensor from "react-visibility-sensor";

export default function AdRedirectPage() {
  const { domainId, shortCode } = useParams();
  const [ad, setAd] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const [isVisible, setIsVisible] = useState(true); // برای بررسی visibility
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const counterRef = useRef(0);

  // 📌 گرفتن تبلیغ از سرور
  useEffect(() => {
    adService.getActiveAd(shortCode).then(setAd).catch(console.error);
  }, [shortCode]);

  // 📌 شروع شمارش
  useEffect(() => {
    if (!ad) return;

    const tick = () => {
      if (!isVisible) return; // اگر صفحه دیده نشد، شمارش متوقف
      counterRef.current++;
      const newProgress = (counterRef.current / ad.duration) * 100;
      setProgress(newProgress);
      if (counterRef.current >= ad.duration) {
        setCanSkip(true);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    };

    timerRef.current = setInterval(tick, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [ad, isVisible]);

  const handleSkip = async () => {
    if (!ad) return;
    const domainValue = domainId && domainId !== "undefined" ? domainId : 0;
    try {
      await adService.registerAdView(shortCode!, domainValue);
    } catch (e) {
      console.error("Failed to register ad view", e);
    }
    window.location.href = `${import.meta.env.VITE_BACKEND_BASE_URL_ORIGIN}/ad/skip/${domainValue}/${shortCode}`;
  };

  if (!ad) return <CircularProgress sx={{ mt: 10, display: "block", mx: "auto" }} />;

  return (
    <VisibilitySensor onChange={(visible) => setIsVisible(visible)} partialVisibility>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1976d2, #9c27b0)",
          p: 3,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Paper sx={{ p: 4, borderRadius: 4, textAlign: "center", maxWidth: 700, width: "100%" }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
              🎬 {ad.title}
            </Typography>

            {/* 🔹 تبلیغ پویا */}
            {ad.media_type === "video" ? (
              <Box
                component="video"
                src={ad.media_url}
                autoPlay
                muted
                playsInline
                controls={false}
                style={{ width: "100%", borderRadius: 8, maxHeight: 400, objectFit: "cover" }}
              />
            ) : ad.media_type === "image" ? (
              <Box component="img" src={ad.media_url} alt="Ad" sx={{ width: "100%", borderRadius: 2, maxHeight: 400, objectFit: "cover" }} />
            ) : (
              <Box
                sx={{ borderRadius: 2, overflow: "hidden", maxHeight: 400 }}
                dangerouslySetInnerHTML={{ __html: ad.media_url }}
              />
            )}

            {/* 🔹 نوار پیشرفت */}
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ mt: 3, height: 10, borderRadius: 5 }}
            />

            {/* 🔹 دکمه رفتن به لینک */}
            <Button
              variant="contained"
              color="success"
              onClick={handleSkip}
              disabled={!canSkip}
              sx={{ mt: 3, borderRadius: 3, px: 5, py: 1.5, fontWeight: "bold", fontSize: "1.1rem" }}
            >
              {canSkip
                ? "🚀 رفتن به لینک مقصد"
                : `منتظر بمانید (${Math.ceil(ad.duration - (progress / 100) * ad.duration)}s)`}
            </Button>

            {/* 🔹 اعلان حضور کاربر */}
            {!isVisible && (
              <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                ⚠️ صفحه فعال نیست! شمارش تا زمانی که در صفحه باشید متوقف می‌شود.
              </Typography>
            )}
          </Paper>
        </motion.div>
      </Box>
    </VisibilitySensor>
  );
}
