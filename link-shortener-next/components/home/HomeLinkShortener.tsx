import React, {type JSX, useEffect, useState} from "react";
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
import { linkService } from "@/services/linkService";
import { authService } from "@/services/authService";
import apiClient from "@/lib/axios";
import config from "@/config";
import {useUserStore} from "@/store/userStore";
import type { URLCreate } from '@/types/api';

// type URLCreate = {
//   long_url: string;
//   custom_alias?: string | null;
//   domain_id?: number | null;
// };

export default function HomeLinkShortener(): JSX.Element {
  const [longUrl, setLongUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  // OTP modal & captcha tokens (two separate tokens: one for send, one for verify)
  const [isOtpModalOpen, setOtpModalOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpStep, setOtpStep] = useState<"enter-phone" | "enter-code">("enter-phone");
  const [captchaTokenSend, setCaptchaTokenSend] = useState<string | null>(null);
  const [captchaTokenVerify, setCaptchaTokenVerify] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpMode, setOtpMode] = useState<"register" | "login" | null>(null);

  const setUser = useUserStore.getState().setUser;

  // local token name matches axios interceptor in lib/axios
  const storedToken = localStorage.getItem("access_token");

  // ===== Helpers =====
  const isValidUrl = (u: string) => {
    try {
      const parsed = new URL(u);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const isValidCustomAlias = (alias: string) => {
    if (!alias) return true;
    return /^[A-Za-z0-9_-]{1,50}$/.test(alias);
  };

  const buildFullShortUrl = (maybe: any) => {
  if (!maybe) return "";

  // اگر با دو تا پروتکل شروع شده مثل https://http://...
  if (/^https?:\/\/https?:\/\//i.test(maybe)) {
    return maybe.replace(/^https?:\/\//i, ""); // یکی از پروتکل‌ها رو حذف کن
  }

  // اگر خودش لینک کامل داشت، همونو برگردون
  if (/^https?:\/\//i.test(maybe)) {
    return maybe;
  }

  // در غیر این صورت base رو اضافه کن
  const base = config.backendBaseUrlOrigin.replace(/\/$/, "");
  return `${base}/${maybe.replace(/^\//, "")}`;
};




  // ===== Effects =====
  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(null), 4500);
      return () => clearTimeout(t);
    }
  }, [error]);

  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => setSuccessMessage(""), 3500);
      return () => clearTimeout(t);
    }
  }, [successMessage]);

  useEffect(() => {
    if (!resendTimer) return;
    const id = setInterval(() => setResendTimer((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  // اگر هنگام mount توکن داریم، header رو ست کن (تا instance همیشه هماهنگ باشه)
  useEffect(() => {
    const t = localStorage.getItem("access_token");
    if (t) {
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${t}`;
    } else {
      delete apiClient.defaults.headers.common["Authorization"];
    }
  }, []);

  // ===== Core: shorten =====
  const handleShorten = async () => {
    setError(null);
    setSuccessMessage("");
    setShortUrl("");

    if (!longUrl) {
      setError("لطفاً آدرس را وارد کنید.");
      return;
    }
    if (!isValidUrl(longUrl)) {
      setError("آدرس باید معتبر باشد و با http:// یا https:// شروع شود.");
      return;
    }
    if (!isValidCustomAlias(customAlias)) {
      setError("کد دلخواه فقط می‌تواند شامل حروف، اعداد، - و _ باشد (حداکثر 50 حرف).");
      return;
    }

    // اگر لاگین نیستیم، مودال OTP را باز کن و ساخت لینک را متوقف کن
    const tokenNow = localStorage.getItem("access_token");
    if (!tokenNow) {
      setOtpModalOpen(true);
      setOtpStep("enter-phone");
      return;
    }

    setLoading(true);
    try {
      const payload: URLCreate = {
        long_url: longUrl,
        custom_alias: customAlias || null,
        domain_id: 0
      };
      const res = await linkService.createShortLink(payload);
      const candidate = (res as any).short_url || (res as any).short_code || "";
      const full = buildFullShortUrl(candidate);
      setShortUrl(full);
      setSuccessMessage("لینک با موفقیت ساخته شد ✅");
      // optional: پاک کردن فیلدها
      // setLongUrl("");
      // setCustomAlias("");
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message || "خطایی در ساخت لینک رخ داد.";
      if (typeof detail === "string" && detail.includes("قبلاً استفاده")) {
        setError("کد انتخابی شما قبلاً استفاده شده است، لطفاً مورد دیگری انتخاب کنید.");
      } else if (typeof detail === "object" && detail?.message) {
        setError(detail.message);
      } else {
        setError(detail);
      }
    } finally {
      setLoading(false);
    }
  };

  // ===== OTP: send =====
  const handleSendOtp = async () => {
    if (otpLoading) return;
    setError(null);

    if (!/^09\d{9}$/.test(phone)) {
      setError("شماره موبایل باید با 09 شروع شود و 11 رقم باشد.");
      return;
    }
    if (!captchaTokenSend && !config.debug) {
      setError("لطفاً کپچا را کامل کنید.");
      return;
    }

    setOtpLoading(true);
    try {
      await authService.sendOtpRegister(phone, captchaTokenSend || "dummy");
      setOtpMode("register");
      setOtpStep("enter-code");
      setResendTimer(60);
    } catch (e: any) {
      const detail = e?.response?.data?.detail || "";
      if (typeof detail === "string" && detail.includes("قبلاً ثبت")) {
      await authService.sendOtpLogin(phone, captchaTokenSend || "dummy");
      setOtpMode("login");
      setOtpStep("enter-code");
      setResendTimer(60);
      setSuccessMessage("کاربر قبلاً وجود دارد، کد ورود ارسال شد ✅");
    }
 else {
    setError(detail || "ارسال کد با خطا مواجه شد.");
  }
} finally {
      setOtpLoading(false);
    }
  };

  // ===== OTP: verify (register/login) =====
  const handleVerifyOtp = async () => {
  if (otpLoading) return;
  setError(null);

  if (!otp) return setError("لطفاً کد تایید را وارد کنید.");
  if (!captchaTokenVerify && !config.debug) return setError("لطفاً کپچا را کامل کنید.");

  setOtpLoading(true);
  try {
    let res;
    if (otpMode === "login") {
      res = await authService.verifyOtpLogin(phone, otp, captchaTokenSend || "dummy");
    } else {
      // پیش‌فرض register (برای کاربران جدید)
      res = await authService.registerWithOtp(phone, otp, "کاربر", "سیستم", captchaTokenSend || "dummy");
    }

    const access = res?.access_token || null;
    if (access) {
      localStorage.setItem("access_token", access);
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${access}`;

      try {
    const me = await authService.getMe();
    setUser(me);
  } catch {
    setUser(null);
  }
    }

    setOtpModalOpen(false);
    setOtpStep("enter-phone");
    setOtp("");
    setPhone("");
    setCaptchaTokenSend(null);
    setCaptchaTokenVerify(null);
    setOtpMode(null);
    setSuccessMessage("ورود/ثبت‌نام موفق ✅");

    await new Promise((r) => setTimeout(r, 200));
    await handleShorten();
  } catch (e: any) {
    setError(e?.response?.data?.detail || "کد تایید اشتباه است یا منقضی شده است.");
  } finally {
    setOtpLoading(false);
  }
};


  // resend (باز ارسال کد) — اگر می‌خواهی کپچای جدید لازم باشه، باید Turnstile دوباره اجرا شود و captchaTokenSend تازه شود
  const handleResend = async () => {
    if (resendTimer > 0) return;
    if (!captchaTokenSend && !config.debug) {
      setError("برای ارسال مجدد کپچا را دوباره کامل کنید.");
      return;
    }
    setOtpLoading(true);
    try {
  await authService.sendOtpRegister(phone, captchaTokenSend || "dummy");
  setOtpStep("enter-code");
  setResendTimer(60);
} catch (e: any) {
  const detail = e?.response?.data?.detail || "";
  if (typeof detail === "string" && detail.includes("قبلاً ثبت")) {
    // یعنی کاربر قبلاً ثبت‌نام کرده → برو سراغ login
    await authService.sendOtpLogin(phone, captchaTokenSend || "dummy");
    setOtpStep("enter-code");
    setResendTimer(60);
  } else {
    setError(detail || "ارسال کد با خطا مواجه شد.");
  }
} finally {
      setOtpLoading(false);
    }
  };

  const handleCopyShort = async () => {
    if (!shortUrl) return;
    try {
      await navigator.clipboard.writeText(shortUrl);
      setSuccessMessage("لینک کپی شد 📋");
    } catch {
      setError("کپی ناموفق بود. لطفاً دستی کپی کنید.");
    }
  };

  // ===== Render =====
  return (
    <Box sx={{ maxWidth: 680, mx: "auto", mt: 6 }}>
      <Paper
        sx={{
          p: 4,
          borderRadius: 3,
          background: "linear-gradient(145deg, #ffffff 0%, #f9f5ff 100%)",
          boxShadow: "0 8px 25px rgba(168,85,247,0.06)",
        }}
      >
        <Typography variant="h5" textAlign="center" mb={2}>
          کوتاه‌کننده لینک
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="لینک اصلی (با http:// یا https://)"
            fullWidth
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
          />
          <TextField
            label="کد دلخواه (اختیاری)"
            fullWidth
            value={customAlias}
            onChange={(e) => setCustomAlias(e.target.value)}
            helperText="فقط حروف، اعداد، - و _ مجاز است"
          />

          <Button
            variant="contained"
            onClick={handleShorten}
            disabled={!longUrl || loading}
            sx={{
              background: "linear-gradient(90deg,#a855f7,#d946ef)",
              fontWeight: 600,
              py: 1.1,
            }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : "کوتاه کن"}
          </Button>

          {shortUrl && (
            <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} mt={1}>
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
              <Button size="small" onClick={handleCopyShort}>
                کپی
              </Button>
            </Stack>
          )}

          {successMessage && (
            <Typography textAlign="center" color="success.main" mt={1}>
              {successMessage}
            </Typography>
          )}

          {error && (
            <Typography textAlign="center" color="error.main" mt={1}>
              {String(error)}
            </Typography>
          )}
        </Stack>
      </Paper>

      {/* OTP Modal */}
      <Modal open={isOtpModalOpen} onClose={() => setOtpModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 380,
            maxWidth: "95%",
            bgcolor: "background.paper",
            borderRadius: 2,
            p: 3,
            boxShadow: "0 12px 40px rgba(15,23,42,0.12)",
          }}
        >
          <Typography variant="h6" mb={2} textAlign="center" sx={{ color: "#122" }}>
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
                placeholder="09XXXXXXXXX"
              />

              <Turnstile
  key={`send-${otpStep}`}
  siteKey={process.env.NEXT_PUBLICK_TURNSTILE_SITE_KEY!}
  onSuccess={(token) => setCaptchaTokenSend(token)}
  onError={() => setCaptchaTokenSend(null)}
  onExpire={() => setCaptchaTokenSend(null)}
/>

              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 2, borderRadius: 3, py: 1.1 }}
                disabled={otpLoading || !phone || !captchaTokenSend && !config.debug}
                onClick={handleSendOtp}
              >
                {otpLoading ? <CircularProgress size={20} color="inherit" /> : "ارسال کد تایید"}
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
                key={`verify-${otpStep}`}
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                onSuccess={(token) => setCaptchaTokenVerify(token)}
                onError={() => setCaptchaTokenVerify(null)}
                onExpire={() => setCaptchaTokenVerify(null)}
              />

              <Stack direction="row" spacing={1} mt={2}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleVerifyOtp}
                  disabled={otpLoading || !otp || !captchaTokenVerify && !config.debug}
                >
                  {otpLoading ? <CircularProgress size={20} color="inherit" /> : "تایید و ادامه"}
                </Button>
                <Button
                  variant="outlined"
                  disabled={resendTimer > 0 || otpLoading}
                  onClick={handleResend}
                >
                  {resendTimer > 0 ? `ارسال مجدد (${resendTimer})` : "ارسال مجدد"}
                </Button>
              </Stack>
            </>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: 1 }}>
              {String(error)}
            </Alert>
          )}
        </Box>
      </Modal>
    </Box>
  );
}
