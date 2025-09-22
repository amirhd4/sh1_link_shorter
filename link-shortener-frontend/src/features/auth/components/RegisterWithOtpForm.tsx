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

export function RegisterWithOtpForm() {
  const navigate = useNavigate();
  const { setUser } = useUserStore();

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [step, setStep] = useState<"phone" | "verify">("phone");
  const [showCode, setShowCode] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [snackbar, setSnackbar] = useState<{ message: string; severity: "success" | "error" } | null>(null);

  // --- ارسال OTP ---
  const sendOtpMutation = useMutation({
    mutationFn: (phone: string) => authService.sendOtpRegister(phone),
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

  // --- تایید OTP و ثبت‌نام ---
  const verifyOtpMutation = useMutation({
    mutationFn: ({ phone, code, firstName, lastName }: { phone: string; code: string; firstName: string; lastName: string }) =>
      authService.registerWithOtp(phone, code, firstName, lastName),
    onSuccess: async (data) => {
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem(
        "welcome_msg",
        JSON.stringify({
          message: "ثبت‌نام موفق 🎉 رمز عبور شما، شماره شماست، لطفا آن را تغییر دهید.",
          severity: "success"
        })
      );


      try {
        const user = await authService.getMe();
        setUser(user);
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
        <Typography variant="h4" sx={{ mb: 3, textAlign: "center", fontWeight: "bold" }}>
          ثبت‌نام با شماره موبایل
        </Typography>

        <Stack spacing={3}>

          {step === "phone" && (
            <>
              <TextField
                fullWidth
                label="شماره موبایل"
                placeholder="مثال: 09123456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                helperText="شماره موبایل خود را بدون فاصله وارد کنید"
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

          {step === "verify" && (
            <>
              <TextField
                fullWidth
                label="نام"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <TextField
                fullWidth
                label="نام خانوادگی"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              <TextField
                fullWidth
                label="کد تایید"
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
                  ),
                }}
              />
              <Button
                fullWidth
                variant="contained"
                color="success"
                size="large"
                onClick={() => verifyOtpMutation.mutate({ phone, code, firstName, lastName })}
                disabled={!code || !firstName || !lastName || verifyOtpMutation.isPending}
                startIcon={verifyOtpMutation.isPending ? <CircularProgress size={20} /> : null}
              >
                {verifyOtpMutation.isPending ? "در حال بررسی..." : "تایید و ثبت‌نام"}
              </Button>

              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button
                  variant="text"
                  size="small"
                  onClick={() => {
                    setStep("phone");
                    setCode("");
                  }}
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
