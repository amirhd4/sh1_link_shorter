import { useState, useEffect } from "react";
import { 
  Button, TextField, Box, Typography, Alert, Stack, CircularProgress, InputAdornment, IconButton, Snackbar
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { authService } from "../../../services/authService";
import { useNavigate } from "react-router-dom";
import { useUserStore } from '../../../store/userStore';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { getOtpErrorMessage } from "../../../utils/otpErrorHandler";
import i18n from "../../../i18n";

export function LoginWithOtpForm() {
  const navigate = useNavigate();
  const { setUser } = useUserStore();

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "verify">("phone");
  const [showCode, setShowCode] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [snackbar, setSnackbar] = useState<{ message: string; severity: "success" | "error" } | null>(null);

  // --- ارسال OTP ---
  const sendOtpMutation = useMutation({
    mutationFn: (phone: string) => authService.sendOtp(phone),
    onSuccess: () => {
      setStep("verify");
      startResendTimer();
      setSnackbar({ message: "کد تایید ارسال شد 📩", severity: "success" });
    },
    onError: (error) => {
      (error as any).customMessage = getOtpErrorMessage(error, "phone");
      setSnackbar({ message: (error as any).customMessage, severity: "error" });
    }
  });

  // --- تایید OTP و ورود ---
  const verifyOtpMutation = useMutation({
    mutationFn: ({ phone, code }: { phone: string; code: string }) =>
      authService.verifyOtp(phone, code),
    onSuccess: async (data) => {
      localStorage.setItem("access_token", data.access_token);
      try {
        const user = await authService.getMe();
        setUser(user);
        localStorage.setItem(
          "welcome_msg",
          JSON.stringify({ text: "ورود موفقیت‌آمیز بود 🎉 خوش آمدید!", severity: "success" })
        );
        navigate("/dashboard");
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
      <Box
        sx={{
          maxWidth: 400,
          mx: "auto",
          mt: 8,
          p: 4,
          borderRadius: 3,
          boxShadow: 4,
          backgroundColor: "background.paper",
          transition: "all 0.3s ease-in-out",
        }}
      >
        <Typography variant="h4" sx={{ mb: 3, textAlign: "center", fontWeight: "bold" }}>
          ورود با شماره موبایل
        </Typography>

        <Stack spacing={2}>
          {/* --- مرحله وارد کردن شماره موبایل --- */}
          {step === "phone" && (
            <>
              <TextField
                fullWidth
                label={i18n.t("otp.phoneLabel") || "شماره موبایل"}
                placeholder="مثال: 09922768848"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                helperText={i18n.t("otp.phoneHelper") || "شماره موبایل خود را بدون فاصله وارد کنید"}
                error={sendOtpMutation.isError}
                InputProps={{ startAdornment: <InputAdornment position="start">📱</InputAdornment> }}
              />
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                onClick={() => sendOtpMutation.mutate(phone)}
                disabled={!phone || sendOtpMutation.isPending}
                startIcon={sendOtpMutation.isPending ? <CircularProgress size={20} /> : null}
              >
                {sendOtpMutation.isPending ? "در حال ارسال..." : "ارسال کد تایید"}
              </Button>
            </>
          )}

          {/* --- مرحله وارد کردن کد تایید --- */}
          {step === "verify" && (
            <>
              <TextField
                fullWidth
                label={i18n.t("verify.codeLabel") || "کد تایید"}
                placeholder="کد ارسال شده به موبایل"
                type={showCode ? "text" : "password"}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                error={verifyOtpMutation.isError}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={toggleShowCode} edge="end">
                        {showCode ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <Button
                fullWidth
                variant="contained"
                color="success"
                size="large"
                onClick={() => verifyOtpMutation.mutate({ phone, code })}
                disabled={!code || verifyOtpMutation.isPending}
                startIcon={verifyOtpMutation.isPending ? <CircularProgress size={20} /> : null}
              >
                {verifyOtpMutation.isPending ? "در حال بررسی..." : "تایید و ورود"}
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
                  disabled={!canResend}
                  onClick={() => {
                    sendOtpMutation.mutate(phone);
                    startResendTimer();
                  }}
                >
                  {canResend ? "ارسال دوباره کد" : `ارسال دوباره در ${resendTimer} ثانیه`}
                </Button>
              </Stack>
            </>
          )}
        </Stack>
      </Box>

      {/* --- Snackbar پیام‌ها --- */}
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
