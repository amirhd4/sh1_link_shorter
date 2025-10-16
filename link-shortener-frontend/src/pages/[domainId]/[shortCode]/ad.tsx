import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Box, Button, Typography, LinearProgress, Paper, CircularProgress, Grid, Alert } from "@mui/material";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";

import { adService } from "../../../services/adService";
import type { Ad } from "../../../types";

export default function AdRedirectPage() {
  const { domainId, shortCode } = useParams<{ domainId: string; shortCode: string }>();
  const [ad, setAd] = useState<Ad | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(document.visibilityState === 'visible');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const counterRef = useRef(0);

  // Effect for handling page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(document.visibilityState === 'visible');
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Effect for fetching the ad from the server
  useEffect(() => {
    if (shortCode) {
      adService.getActiveAd(shortCode)
        .then(setAd)
        .catch(err => {
          console.error("Error fetching ad:", err);
          setError("متأسفانه در حال حاضر امکان نمایش این تبلیغ وجود ندارد.");
        });
    }
  }, [shortCode]);

  // Effect for managing the countdown timer
  useEffect(() => {
    if (!ad || !isPageVisible) {
      // Clear interval if there's no ad or the page is hidden
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const tick = () => {
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
  }, [ad, isPageVisible]); // Reruns when ad is loaded or page visibility changes

  const handleSkip = async () => {
    if (!ad || !shortCode) return;
    const effectiveDomainId = (domainId === "0" || domainId === "null" || domainId === "undefined") ? "0" : domainId;

    try {
      await adService.registerAdView(shortCode, effectiveDomainId);
    } catch (e) {
      console.error("Failed to register ad view. Proceeding with redirect.", e);
    }
    window.location.href = `${import.meta.env.VITE_BACKEND_BASE_URL_ORIGIN}/ad/skip/${effectiveDomainId}/${shortCode}`;
  };

  const remainingSeconds = ad ? Math.ceil(ad.duration - (progress / 100) * ad.duration) : 0;

  if (error) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!ad) {
    return (
        <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CircularProgress size={60} />
        </Box>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`تبلیغ: ${ad.title}`}</title>
        <meta name="description" content={`در حال مشاهده تبلیغ برای ${ad.title}. پس از چند ثانیه به لینک مقصد هدایت می‌شوید.`} />
      </Helmet>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e88e5, #8e24aa)", // Slightly adjusted gradient
          p: { xs: 1, sm: 2, md: 3 },
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          style={{ width: '100%' }}
        >
          <Grid container justifyContent="center">
            <Grid item xs={12} sm={10} md={8} lg={6}>
              <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, borderRadius: 4, textAlign: "center", width: "100%" }}>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                  🎬 {ad.title}
                </Typography>

                <Box sx={{ width: '100%', borderRadius: 2, overflow: 'hidden', maxHeight: '60vh', mb: 3 }}>
                    {ad.media_type === "video" ? (
                    <Box
                        component="video"
                        src={ad.media_url}
                        autoPlay
                        muted
                        loop
                        playsInline
                        controls={false}
                        style={{ width: "100%", height: '100%', objectFit: "cover" }}
                    />
                    ) : ad.media_type === "image" ? (
                    <Box component="img" src={ad.media_url} alt={ad.title} sx={{ width: "100%", height: '100%', objectFit: "cover" }} />
                    ) : (
                    <Box
                        sx={{ position: 'relative', paddingTop: '56.25%', height: 0 }} /* 16:9 Aspect Ratio */
                        dangerouslySetInnerHTML={{ __html: ad.media_url }}
                    />
                    )}
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{ height: 12, borderRadius: 6, mb: 2 }}
                />

                {!isPageVisible && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    شمارش متوقف شده است. برای ادامه، به این صفحه بازگردید.
                  </Alert>
                )}

                <Button
                  variant="contained"
                  color={canSkip ? "success" : "primary"}
                  onClick={handleSkip}
                  disabled={!canSkip}
                  size="large"
                  sx={{ borderRadius: 3, px: 5, py: 1.5, fontWeight: "bold", fontSize: "1.1rem", width: '100%', maxWidth: '400px' }}
                >
                  {canSkip ? "🚀 رفتن به لینک مقصد" : `لطفاً ${remainingSeconds} ثانیه منتظر بمانید`}
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </motion.div>
      </Box>
    </>
  );
}