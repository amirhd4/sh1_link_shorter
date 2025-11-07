import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Stack,
  CircularProgress,
  Modal,
  Alert,
} from "@mui/material";
import { Turnstile } from "@marsidev/react-turnstile";
import { linkService } from "../../../services/linkService";
import { authService } from "../../../services/authService";

export default function HomeLinkShortener() {
  const [longUrl, setLongUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOtpModalOpen, setOtpModalOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpStep, setOtpStep] = useState<"enter-phone" | "enter-code">("enter-phone");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");

  const token = localStorage.getItem("token");

  // ساخت لینک کوتاه
  const handleShorten = async () => {
      setSuccessMessage("");
            setError("");

    try {
        if (!longUrl.startsWith("http")) {
  setError("آدرس باید با http یا https شروع شود.");
  return;
}

      setLoading(true);

      if (!token) {
        setOtpModalOpen(true);
        return;
      }

      const payload = {
        long_url: longUrl,
        custom_alias: customAlias || null,
        domain_id: 0,
      };

      const res = await linkService.createShortLink(payload);
      setShortUrl(res.short_url);
      setSuccessMessage("لینک با موفقیت ساخته شد ✅");
    } catch (err: any) {
const detail = err.response?.data?.detail;
if (detail === "این نام قبلاً استفاده شده است.") {
  setError("کد انتخابی شما قبلاً استفاده شده است، لطفاً مورد دیگری انتخاب کنید.");
  setSuccessMessage("");

} else {
  setError(detail || "خطایی رخ داد در ساخت لینک.");
}
    } finally {
      setLoading(false);
    }
  };

  // ارسال کد OTP
  const handleSendOtp = async () => {
      if (otpLoading) return;


      if (!/^09\d{9}$/.test(phone)) {
  setError("شماره موبایل باید با 09 شروع شود و 11 رقم باشد.");
  return;
}


    try {
      setError("");
      if (!captchaToken) {
        setError("لطفاً کپچا را کامل کنید 🛡️");
        return;
      }
      setOtpLoading(true);
      await authService.sendOtpRegister(phone, captchaToken);
      setOtpStep("enter-code");
      setTimer(60);
    } catch (e: any) {
      setError(e.response?.data?.detail || "ارسال کد با خطا مواجه شد.");
    } finally {
      setOtpLoading(false);
    }
  };

  // تایید OTP و ثبت‌نام / ورود
  const handleVerifyOtp = async () => {
      if (otpLoading) return;

    try {
      setError("");
      if (!captchaToken) {
        setError("کپچا منقضی شده است، لطفاً مجدداً امتحان کنید 🛡️");
        return;
      }
      setOtpLoading(true);
      const res = await authService.registerWithOtp(phone, otp, "کاربر", "سیستم", captchaToken);


      localStorage.setItem("token", res.access_token);
      setOtpModalOpen(false);
      setOtpStep("enter-phone");
      setOtp("");
      setPhone("");
      setCaptchaToken(null);
      await new Promise(r => setTimeout(r, 300));
      await handleShorten();
    } catch (e: any) {
      setError(e.response?.data?.detail || "کد تایید اشتباه است یا منقضی شده است.");
    } finally {
      setOtpLoading(false);
    }
  };

  // تایمر ارسال مجدد
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  useEffect(() => {
  if (error) {
    const timer = setTimeout(() => setError(""), 4000);
    return () => clearTimeout(timer);
  }
}, [error]);


  useEffect(() => {
  if (successMessage) {
    const timer = setTimeout(() => setSuccessMessage(""), 3000);
    return () => clearTimeout(timer);
  }
}, [successMessage]);


  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 6 }}>
      <Paper
  sx={{
    p: 4,
    borderRadius: 4,
    background: "linear-gradient(145deg, #ffffff 0%, #f9f5ff 100%)",
    color: "#333",
    boxShadow: "0 8px 25px rgba(168,85,247,0.15)",
  }}
>

        <Typography variant="h5" textAlign="center" mb={2}>
          کوتاه‌کننده لینک
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="لینک اصلی"
            fullWidth
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
          />
          <TextField
            label="کد دلخواه (اختیاری)"
            fullWidth
            value={customAlias}
            onChange={(e) => setCustomAlias(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={handleShorten}
            disabled={!longUrl || loading}
            sx={{
              background: "linear-gradient(90deg,#a855f7,#d946ef)",
              fontWeight: 600,
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "کوتاه کن"}
          </Button>



            {shortUrl && (
  <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} mt={2}>
    <Typography color="success.main" fontWeight="bold">
      لینک شما:
    </Typography>
    <Typography
      component="a"
      href={shortUrl}
      target="_blank"
      rel="noopener noreferrer"
      sx={{ color: "primary.main", wordBreak: "break-all" }}
    >
      {shortUrl}
    </Typography>
    <Button
      size="small"
      onClick={() => {
        navigator.clipboard.writeText(shortUrl);
        setSuccessMessage("لینک کپی شد 📋");

      }}
    >
      کپی
    </Button>
  </Stack>
)}


          {successMessage && (
            <Typography textAlign="center" color="success.main" mt={2}>
              {successMessage}
            </Typography>
          )}

          {error && (
            <Typography textAlign="center" color="error.main" mt={2}>
              {error}
            </Typography>
          )}
        </Stack>
      </Paper>

      {/* مودال OTP */}
      <Modal open={isOtpModalOpen} onClose={() => setOtpModalOpen(false)}>
        <Box
  sx={{
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 380,
    bgcolor: "background.paper",
    borderRadius: 3,
    p: 3,
    boxShadow: "0 12px 40px rgba(15,23,42,0.2)",
  }}
>

          <Typography variant="h6" mb={2} textAlign="center" sx={{ color: "#000" }}>
            ورود یا ثبت‌نام با شماره تلفن
          </Typography>

          {otpStep === "enter-phone" ? (
            <>
              <TextField
                fullWidth
                label="شماره موبایل"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                sx={{ mb: 2 }}
              />

              <Turnstile
                siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                onSuccess={(token) => setCaptchaToken(token)}
                onError={() => setCaptchaToken(null)}
                onExpire={() => setCaptchaToken(null)}
              />

              <Button
  variant="contained"
  fullWidth
  sx={{
    mt: 2,
    borderRadius: 5,
    py: 1.2,
    fontWeight: 700,
    background: "linear-gradient(90deg,#7c3aed,#d946ef)",
    boxShadow: "0 4px 20px rgba(124,58,237,0.25)",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 8px 30px rgba(124,58,237,0.35)",
    },
  }}
  disabled={otpLoading || !phone}
  onClick={handleSendOtp}
>
  {otpLoading ? <CircularProgress size={22} color="inherit" /> : "ارسال کد تایید"}
</Button>

            </>
          ) : (
            <>
              <TextField
                fullWidth
                label="کد تایید"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                sx={{ mb: 2 }}
              />

              <Turnstile
                siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                onSuccess={(token) => setCaptchaToken(token)}
                onError={() => setCaptchaToken(null)}
                onExpire={() => setCaptchaToken(null)}
                options={{ theme: "light" }}
              />

              <Stack direction="row" spacing={1} mt={2}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleVerifyOtp}
                  disabled={otpLoading || !otp}
                >
                  {otpLoading ? (
                    <CircularProgress size={22} color="inherit" />
                  ) : (
                    "تایید و ادامه"
                  )}
                </Button>
                <Button
                  variant="outlined"
                  disabled={timer > 0}
                  onClick={handleSendOtp}
                  sx={{ whiteSpace: "nowrap", px: 2 }}
                >
                  {timer > 0 ? `ارسال مجدد (${timer})` : "ارسال مجدد"}
                </Button>
              </Stack>
            </>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </Modal>
    </Box>
  );
}
