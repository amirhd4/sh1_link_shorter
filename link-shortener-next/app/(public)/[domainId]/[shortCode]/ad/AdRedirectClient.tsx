"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Box, Button, Typography, LinearProgress, Paper, CircularProgress, Grid, Alert } from "@mui/material";
import { motion } from "framer-motion";

import { adService } from "@/services/adService";
import type { Ad } from "@/types";
import { Megaphone } from "lucide-react";
import VastVideoPlayer from "@/components/video-ads/vast";
import VideoAdPlayer from "@/components/video-ads/vast";
import Link from "next/link";
import { AutoAwesome } from "@mui/icons-material";
import BioLink from "@mui/icons-material/Pages";


const normalizeDomainId = (domainId: string | undefined): number | undefined => {
  if (domainId === undefined || domainId === "0" || domainId === "null" || domainId === "undefined") {
    return undefined;
  }
  return parseInt(domainId, 10);
};

export default function AdRedirectClient({ ad }: { ad: Ad }) {
  const { domainId, shortCode } = useParams<{ domainId: string; shortCode: string }>();
  // const [ad, setAd] = useState<Ad | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(document.visibilityState === 'visible');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  // useEffect(() => {
  //   if (shortCode) {
  //     adService.getActiveAd(shortCode)
  //       .then(setAd)
  //       .catch(err => {
  //         console.error("Error fetching ad:", err);
  //         setError("متأسفانه در حال حاضر امکان نمایش این تبلیغ وجود ندارد.");
  //       });
  //   }
  // }, [shortCode]);

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
    if (!ad || !shortCode || isSubmitting) return;
    setIsSubmitting(true);
    const normalizedDomainId = normalizeDomainId(domainId);

    try {
      await adService.registerAdView(shortCode, normalizedDomainId);
    } catch (e) {
      console.error("Failed to register ad view. Proceeding with redirect.", e);
      // Optional: Show a user-friendly error message
    } finally {
      const redirectDomain = normalizedDomainId ?? 0;
      window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_ORIGIN}/ad/skip/${redirectDomain}/${shortCode}`;
    }
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
            <Grid size={{xs: 12, sm: 10, md: 8, lg: 9}}>
              <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, borderRadius: 4, textAlign: "center", width: "100%" }}>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>

                  <Megaphone className="w-6 h-6 text-blue-500" />
                </Typography>

                 <Box sx={{ width: '100%', borderRadius: 2, mb: 3 }}>

                     <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        mb: 4,
                        borderRadius: 4,
                        border: '2px dashed #9c27b0', // حاشیه خط‌چین برای جلب توجه
                        backgroundColor: '#faf5ff', // رنگ پس‌زمینه بسیار ملایم بنفش
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                        textAlign: { xs: 'center', md: 'left' }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {/* آیکون جایگزین عکس */}
                        <Box sx={{
                            backgroundColor: '#9c27b0',
                            color: 'white',
                            p: 2,
                            borderRadius: '50%',
                            display: 'flex'
                        }}>
                          <AutoAwesome fontSize="large" />
                        </Box>

                        <Box>
                          <Typography variant="h6" sx={{ color: '#4a148c', fontWeight: '800', mb: 0.5 }}>
                            جلسات مجازی با کیفیت فوق‌العاده
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#6a1b9a', maxWidth: 500 }}>
                            بدون محدودیت، در محیطی امن و حرفه‌ای با قابلیت چت زنده و تماس صوتی/تصویری هم‌تیمی‌های خود را ملاقات کنید.
                          </Typography>
                        </Box>
                      </Box>

                      <Button
                        component="a"
                        href="https://goftgokon.ir"
                        target="_blank"
                        variant="contained"
                        size="large"
                        sx={{
                          backgroundColor: 'darkmagenta',
                          fontWeight: 'bold',
                          px: 2,
                          py: 1.5,
                          borderRadius: '10px',
                          '&:hover': { backgroundColor: '#4a004a' },
                        }}
                      >
                        همین حالا شروع کنید
                      </Button>
                    </Paper>

                     <Paper
                      elevation={0}
                      sx={{
                        p: { xs: 2, md: 3 },
                        mb: 3,
                        borderRadius: 4,
                        border: "1px solid",
                        borderColor: "divider",
                        overflow: "hidden",
                        background:
                          "linear-gradient(135deg, rgba(156,39,176,0.05), rgba(33,150,243,0.05))",
                      }}
                    >
                      <Grid
                        container
                        spacing={3}
                        alignItems="center"
                      >
                        {/* تصویر */}
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Box
                            component="img"
                            src="/images/tutorial_l1s-bio.png"
                            alt="Bio Page"
                            sx={{
                              width: "100%",
                              height: {
                                xs: 300,
                                sm: 240,
                                md: 160,
                              },
                              objectFit: "contain",
                              display: "block",
                              mx: "auto",
                            }}
                          />
                        </Grid>

                        {/* محتوا */}
                        <Grid size={{ xs: 12, md: 8 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              mb: 2,
                            }}
                          >
                            <Box
                              sx={{
                                width: 60,
                                height: 60,
                                borderRadius: "16px",
                                bgcolor: "secondary.main",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                flexShrink: 0,
                              }}
                            >
                              <BioLink sx={{ fontSize: 34 }} />
                            </Box>

                            <Box>
                              <Typography
                                variant="h5"
                                fontWeight={800}
                              >
                                لینک در بیو
                              </Typography>

                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                تمام لینک‌های مهم خود را در یک صفحه حرفه‌ای و زیبا جمع‌آوری کنید.
                              </Typography>
                            </Box>
                          </Box>

                          <Typography
                            variant="body1"
                            sx={{
                              mb: 3,
                              lineHeight: 2,
                              color: "text.secondary",
                            }}
                          >
                            مناسب اینستاگرام، تلگرام، یوتیوب و سایر شبکه‌های اجتماعی.
                            یک لینک بسازید و همه مخاطبانتان را به تمام صفحات خود هدایت کنید.
                          </Typography>

                          <Button
                            component={Link}
                            href="/bio-pages"
                            variant="contained"
                            target="_blank"
                            color="secondary"
                            size="large"
                            sx={{
                              borderRadius: 3,
                              px: 4,
                              py: 1.5,
                              fontWeight: 700,
                            }}
                          >
                            🚀 ساخت لینک در بیو
                          </Button>
                        </Grid>
                      </Grid>
                    </Paper>



                    {/*<div id="pos-article-display-117812"></div>*/}
                    {/*<div className="yn-bnr" id="ynpos-18054"></div>*/}
                    {/* <VideoAdPlayer*/}
                    {/*    vastUrl="https://vfetch.yektanet.com/api/v1/load/f1d9af70-00d8-4988-b9d0-1b88c75c8424"*/}
                    {/*  />*/}

{/*                     <a href="http://Ad-manage.ir" target="_blank">*/}
{/*                     <img src="/banner/banner-1e.jpg" alt="banner-1e" />*/}
{/*                     </a>*/}
{/*                     <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>*/}
{/*                    <a href="http://Ad-manage.ir" target="_blank">*/}
{/*سورپرایز دریافت وام ۱۵۰ میلیونی بدون چک و ضامن با واسطه میلی گلد*/}
{/*                        </a>*/}
{/*                         <a*/}
{/*                          href="http://Ad-manage.ir"*/}
{/*                          target="_blank"*/}
{/*                          rel="noopener noreferrer"*/}
{/*                          style={{*/}
{/*                            backgroundColor: "darkmagenta",*/}
{/*                            color: "white",*/}
{/*                            padding: "10px 20px",*/}
{/*                            borderRadius: "6px",*/}
{/*                            display: "inline-block",*/}
{/*                            margin: "5px 10px",*/}
{/*                          }}*/}
{/*                        >*/}
{/*                          کلیک کنید*/}
{/*                        </a>*/}
{/*                </Typography>*/}
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
                  disabled={!canSkip || isSubmitting}
                  size="large"
                  sx={{ borderRadius: 3, px: 5, py: 1.5, fontWeight: "bold", fontSize: "1.1rem", width: '100%', maxWidth: '400px' }}
                >
                  {isSubmitting ? <CircularProgress size={24} color="inherit" /> : (canSkip ? "🚀 رفتن به لینک مقصد" : `لطفاً ${remainingSeconds} ثانیه منتظر بمانید`)}
                </Button>
              </Paper>

            </Grid>

          </Grid>
                            <div className="yn-bnr" id="ynpos-18058"></div>

    {/*                 <div*/}
    {/*  style={{*/}
    {/*    backgroundColor: 'white', // بک‌گراند سفید*/}
    {/*    padding: '20px', // کمی فاصله داخلی برای خوانایی بهتر*/}
    {/*    borderRadius: '8px', // گوشه‌های کمی گرد*/}
    {/*    boxShadow: '0 4px 8px rgba(0,0,0,0.1)', // سایه ملایم برای برجسته کردن*/}
    {/*    textAlign: 'center', // برای وسط چین کردن محتوا*/}
    {/*    width: '100%', // عرض کامل در دسترس*/}
    {/*    maxWidth: '600px', // حداکثر عرض برای جلوگیری از کشیدگی در صفحات بزرگ*/}
    {/*    margin: '20px auto', // وسط چین کردن کل بنر در صفحه*/}
    {/*    boxSizing: 'border-box', // اطمینان از اینکه padding و border در عرض کل لحاظ می‌شوند*/}
    {/*  }}*/}
    {/*>*/}
    {/*  <a href="http://talasea.ir/onboarding?r=hQQXEWXI" target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginBottom: '15px' }}>*/}
    {/*    /!* استفاده از Image کامپوننت Next.js برای بهینه‌سازی *!/*/}
    {/*    <img*/}
    {/*      src="/banner/banner-3e.jpg"*/}
    {/*      alt="تبلیغ" // Alt text توصیفی‌تر*/}
    {/*      width={560} // سایز اصلی تصویر را اینجا تنظیم کنید، Next.js آن را ریسپانسیو می‌کند*/}
    {/*      height={300} // سایز اصلی تصویر را اینجا تنظیم کنید*/}
    {/*      // layout="responsive" // برای ریسپانسیو کردن تصویر*/}
    {/*      style={{ borderRadius: '4px' }} // گوشه‌های گرد برای تصویر*/}
    {/*    />*/}
    {/*  </a>*/}

    {/*  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>*/}
    {/*    <a href="http://talasea.ir/onboarding?r=hQQXEWXI" target="_blank" rel="noopener noreferrer" style={{ color: '#d32f2f', textDecoration: 'none' }}> /!* رنگ قرمز و حذف زیرخط برای لینک *!/*/}
    {/*      👑 طلاسی داره به همه واسه ورود ۵۰۰ هزار  وجه نقد  هدیه میده*/}
    {/*    </a>*/}
    {/*  </Typography>*/}
    {/*                     <a*/}
    {/*                      href="http://talasea.ir/onboarding?r=hQQXEWXI"*/}
    {/*                      target="_blank"*/}
    {/*                      rel="noopener noreferrer"*/}
    {/*                      style={{*/}
    {/*                        backgroundColor: "darkmagenta",*/}
    {/*                        color: "white",*/}
    {/*                        padding: "10px 20px",*/}
    {/*                        borderRadius: "6px",*/}
    {/*                        display: "inline-block",*/}
    {/*                        margin: "5px 10px",*/}
    {/*                      }}*/}
    {/*                    >*/}
    {/*                      کلیک کنید*/}
    {/*                    </a>*/}
    {/*</div>*/}

        </motion.div>
      </Box>
    </>
  );
}