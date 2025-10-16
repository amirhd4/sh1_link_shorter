import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Box, Button, Typography, LinearProgress, Paper, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import { adService } from "../../../services/adService";
import VisibilitySensor from "react-visibility-sensor";

export default function AdRedirectPage() {
  const { domainId, shortCode } = useParams<{ domainId: string; shortCode: string }>();
  const [ad, setAd] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const counterRef = useRef(0);

  // 📌 گرفتن تبلیغ از سرور
  useEffect(() => {
    if (shortCode) {
      adService.getActiveAd(shortCode).then(setAd).catch(console.error);
    }
  }, [shortCode]);

  // 📌 شروع شمارش
  useEffect(() => {
    if (!ad) return;

    const tick = () => {
      if (!isVisible) return;
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
    if (!ad || !shortCode) return;

    // Normalize domainId: if it's "0", "null", or "undefined", treat as default domain.
    const effectiveDomainId = (domainId === "0" || domainId === "null" || domainId === "undefined") ? "0" : domainId;

    try {
      // Register the ad view before redirecting
      await adService.registerAdView(shortCode, effectiveDomainId);
    } catch (e) {
      console.error("Failed to register ad view. Proceeding with redirect.", e);
    }

    // Redirect to the final destination via the backend skip endpoint
    window.location.href = `${import.meta.env.VITE_BACKEND_BASE_URL_ORIGIN}/ad/skip/${effectiveDomainId}/${shortCode}`;
  };

  if (!ad) {
    return <CircularProgress sx={{ mt: 10, display: "block", mx: "auto" }} />;
  }

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

            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ mt: 3, height: 10, borderRadius: 5 }}
            />

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