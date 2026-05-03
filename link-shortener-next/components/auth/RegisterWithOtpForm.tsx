"use client";

import { useState, useEffect, useRef } from "react";
import {
    Button, TextField, Typography, Stack, CircularProgress,
    InputAdornment, IconButton, Snackbar, Paper, Link as MuiLink
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/authService";
import { useRouter } from "next/navigation";
import { useUserStore } from '@/store/userStore';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { getOtpErrorMessage } from "@/utils/otpErrorHandler";
import { Turnstile } from "@marsidev/react-turnstile";
import Link from "next/link";
import config from "@/config";
import { Checkbox, FormControlLabel } from "@mui/material";

export function RegisterWithOtpForm() {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const navigate = useRouter();
  const { setUser } = useUserStore();

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [step, setStep] = useState<"phone" | "verify">("phone");
  const [showCode, setShowCode] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // 🔑 دو توکن جدا برای هر مرحله
  const [captchaTokenSend, setCaptchaTokenSend] = useState<string | null>(null);
  const [captchaTokenVerify, setCaptchaTokenVerify] = useState<string | null>(null);

  const [snackbar, setSnackbar] = useState<{ message: string; severity: "success" | "error" } | null>(null);
  const turnstileRef = useRef<any>(null);

  // --- ارسال OTP ---
  const sendOtpMutation = useMutation({
    mutationFn: (payload: { phone: string; captcha_token: string | null }) =>
      authService.sendOtpRegister(payload.phone, payload.captcha_token),
    onSuccess: () => {
      setStep("verify");
      startResendTimer();
      setSnackbar({ message: "کد تایید ارسال شد 📩", severity: "success" });
      // ریست کپچا برای مرحله بعد
      turnstileRef.current?.reset();
      setCaptchaTokenSend(null);
    },
    onError: (error) => {
        (error as any).customMessage = getOtpErrorMessage(error, "phone");
        setSnackbar({ message: (error as any).customMessage, severity: "error" });
        // If there's an error sending OTP, allow resending immediately (or after a short delay if needed)
        setCanResend(true); // Allow resend on error
        setResendTimer(0);   // Reset timer
      },
  });

  // --- تایید OTP و ثبت‌نام ---
  const verifyOtpMutation = useMutation({
    mutationFn: ({ phone, code, firstName, lastName, captchaToken }: 
      { phone: string; code: string; firstName: string; lastName: string; captchaToken: string | null }) =>
      authService.registerWithOtp(phone, code, firstName, lastName, captchaToken),
    onSuccess: async (data) => {
      // localStorage.setItem("access_token", data.access_token);
      // document.cookie = `access_token=${data.access_token}; path=/`;
      localStorage.setItem(
        "welcome_msg",
        JSON.stringify({
          text: "ثبت‌نام موفق 🎉 لطفا رمز عبور خود را ذخیره کنید.",
          severity: "success"
        })
      );
      try {
        const user = await authService.getMe();
        setUser(user);
        navigate.push("/dashboard");
      } catch (err) {
        console.error("خطا در واکشی اطلاعات کاربر:", err);
      }
    },
    onError: (error) => {
      (error as any).customMessage = getOtpErrorMessage(error, "verify");
      setSnackbar({ message: (error as any).customMessage, severity: "error" });
    }
  });

  // --- Timer ارسال دوباره ---
  const startResendTimer = () => {
    setCanResend(false);
    setResendTimer(60);
  };

  useEffect(() => {
    let timer: number;
    if (resendTimer > 0) {
      timer = window.setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    } else if (resendTimer === 0 && step === "verify") {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [resendTimer, step]);

  const toggleShowCode = () => setShowCode(prev => !prev);

  return (
    <>
      <Paper
        elevation={8}
        sx={{
          maxWidth: 420,
          mx: "auto",
          mt: 8,
          p: 5,
          borderRadius: 4,
          boxShadow: 6,
          backgroundColor: "background.paper",
          transition: "all 0.3s ease-in-out",
        }}
      >
        <Typography
  variant="h4"
  component="h1"
  sx={{ mb: 3, textAlign: "center", fontWeight: "bold" }}
>
  ثبت‌نام با شماره موبایل
</Typography>

          <Typography
  component="p"
  sx={{
    position: "absolute",
    left: "-10000px",
    top: "auto",
    width: "1px",
    height: "1px",
    overflow: "hidden",
  }}
>
  ثبت‌نام کاربران با شماره موبایل و دریافت کد تایید برای ورود امن به سامانه
</Typography>



        <Stack spacing={3}>
          {/* --- مرحله شماره موبایل --- */}
          {step === "phone" && (
            <>
              <TextField
                fullWidth
                label="شماره موبایل"
                placeholder="نمونه: 09920004501"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => {
                    const onlyNumbers = e.target.value.replace(/\D/g, "");
                    setPhone(onlyNumbers);
                  }}
                helperText="شماره موبایل خود را بدون فاصله وارد کنید"
                error={sendOtpMutation.isError}
                slotProps={{
                    input: {
                      inputMode: "numeric",      // کیبورد عددی موبایل
                      inputProps: {
                          pattern: "[0-9]*",
                          maxLength: 12,             // اختیاری (برای موبایل ایران)
                      },
                      startAdornment: (
                        <InputAdornment position="start">📱</InputAdornment>
                      ),
                    },
                  }}
              />
              <FormControlLabel
                  sx={{
                    alignItems: "flex-start",
                    m: 0,
                    "& .MuiFormControlLabel-label": {
                      fontSize: { xs: "0.8rem", sm: "0.9rem" },
                      lineHeight: 1.9,
                      color: "text.secondary",
                    },
                  }}
                  control={
                    <Checkbox
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      sx={{ mt: 0.3 }}
                    />
                  }
                  label={
                    <Typography
                        fontSize={"smaller"}

                        component="span">
                      با ثبت‌نام در سامانه،{" "}
                      <MuiLink
                        component={Link}
                        href="/terms"
                        sx={{ fontWeight: 700}}
                      >
                        قوانین و مقررات
                      </MuiLink>{" "}
                      را مطالعه کرده‌ام و با آن‌ها موافقم.
                    </Typography>
                  }
                />

              <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() => {
                    if (!acceptedTerms) {
                      setSnackbar({ message: "برای ادامه باید با قوانین و مقررات موافقت کنید.", severity: "error" });
                      return;
                    }

                    if (!captchaTokenSend && config.captcha) {
                      setSnackbar({ message: "لطفاً کپچا را کامل کنید 🛡️", severity: "error" });
                      return;
                    }

                    sendOtpMutation.mutate({ phone, captcha_token: captchaTokenSend });
                  }}
                  disabled={!phone || !acceptedTerms || sendOtpMutation.isPending}
                  startIcon={sendOtpMutation.isPending ? <CircularProgress size={20} /> : null}
                >
                  {sendOtpMutation.isPending ? "در حال ارسال..." : "ارسال کد تایید"}
                </Button>

            </>
          )}

            <Typography variant="body2" sx={{ textAlign: 'center', color: '#4b5563' }}>
            حساب کاربری دارید؟{' '}
            <MuiLink component={Link} href="/login" sx={{ color: '#9333ea', fontWeight: 600 }}>
              وارد شوید
            </MuiLink>
          </Typography>

          {/* --- مرحله تایید کد --- */}
          {step === "verify" && (
  <>
    <Typography
      variant="body2"
      sx={{
        mb: 1,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        bgcolor: "#f3f4f6",
        p: 1.2,
        borderRadius: 2,
        fontSize: "0.9rem",
        color: "#374151",
      }}
    >
      <span>
        شماره وارد شده:{" "}
        <strong style={{ direction: "ltr", unicodeBidi: "plaintext" }}>
          {phone}
        </strong>
      </span>

      <Button
        variant="text"
        size="small"
        sx={{ fontSize: "0.8rem", minWidth: "unset" }}
        onClick={() => {
          setStep("phone");
          setCode("");
        }}
      >
        تغییر شماره
      </Button>
    </Typography>

              <TextField
                fullWidth
                label="نام"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <TextField
                fullWidth
                label="نام خانوادگی"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              <TextField
                fullWidth
                label="کد تایید"
                autoComplete="one-time-code"
                placeholder="کد ارسال شده به موبایل"
                type={showCode ? "number" : "password"}
                value={code}
                onChange={(e) => {
                    const onlyNumbers = e.target.value.replace(/\D/g, "");
                    setCode(onlyNumbers);
                  }}
                error={verifyOtpMutation.isError}
                slotProps={{
                    input: {
                      inputMode: "numeric",
                      inputProps:{
                          pattern: "[0-9]*",
                          maxLength: 6,
                      },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={toggleShowCode}
                            edge="end"
                            aria-label="نمایش یا مخفی کردن کد"
                          >
                            {showCode ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
              />

              <Button
                fullWidth
                variant="contained"
                color="success"
                size="large"
                onClick={() => {
                  if (!captchaTokenVerify && config.captcha) {
                    setSnackbar({ message: "لطفاً کپچا را کامل کنید 🛡️", severity: "error" });
                    return;
                  }
                  verifyOtpMutation.mutate({ phone, code, firstName, lastName, captchaToken: captchaTokenVerify });
                }}
                disabled={!code || !firstName || !lastName || verifyOtpMutation.isPending || (!captchaTokenVerify && config.captcha)}
                startIcon={verifyOtpMutation.isPending ? <CircularProgress size={20} /> : null}
              >
                {verifyOtpMutation.isPending ? "در حال بررسی..." : "تایید و ثبت‌نام"}
              </Button>

              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button
                  variant="text"
                  size="small"
                  onClick={() => { setStep("phone"); setCode(""); }}
                >
                  تغییر شماره موبایل
                </Button>
                <Button
      variant="text"
      size="small"
      disabled={!canResend} // This should now be controlled by the timer logic
      onClick={() => {
        // Reset captcha for the resend attempt
        turnstileRef.current?.reset();
        setCaptchaTokenVerify(null); // Assuming this is for the verification step

        // Re-trigger the OTP sending mutation
        sendOtpMutation.mutate({ phone: phone, captcha_token: null }); // Pass null for captcha initially, user will solve it

        // Reset the timer
        startResendTimer();
      }}
    >
      {canResend ? "ارسال دوباره کد" : `ارسال دوباره در ${resendTimer} ثانیه`}
    </Button>
              </Stack>
            </>
          )}

          {/* کپچا */}
          {(step === "phone" || step === "verify") && (
            <Turnstile
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
              ref={turnstileRef}
              onSuccess={(token) => {
                if (step === "phone") setCaptchaTokenSend(token);
                if (step === "verify") setCaptchaTokenVerify(token);
              }}
              onError={() => {
                if (step === "phone") setCaptchaTokenSend(null);
                if (step === "verify") setCaptchaTokenVerify(null);
              }}
              onExpire={() => {
                if (step === "phone") setCaptchaTokenSend(null);
                if (step === "verify") setCaptchaTokenVerify(null);
              }}
              options={{ theme: "light", size: "normal" }}
            />
          )}
        </Stack>
      </Paper>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={4000}
        onClose={() => setSnackbar(null)}
        message={snackbar?.message}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </>
  );
}
