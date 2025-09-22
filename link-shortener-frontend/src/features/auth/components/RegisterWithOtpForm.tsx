import { useState } from "react";
import { 
  Button, TextField, Box, Typography, Alert, Stack, CircularProgress, InputAdornment, IconButton 
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
  const [step, setStep] = useState<"phone" | "verify">("phone");
  const [showCode, setShowCode] = useState(false);

  // --- ارسال OTP
  const sendOtpMutation = useMutation({
    mutationFn: (phone: string) => authService.sendOtp(phone),
    onSuccess: () => setStep("verify"),
    onError: (error) => {
      (error as any).customMessage = getOtpErrorMessage(error, "phone");
    }
  });

  // --- تایید OTP
  const verifyOtpMutation = useMutation({
    mutationFn: ({ phone, code }: { phone: string; code: string }) =>
      authService.registerWithOtp(phone, code),
    onSuccess: async (data) => {
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem(
        "welcome_msg",
        JSON.stringify({
          text: "ثبت‌نام موفق 🎉 رمز عبور شما شماره موبایل است! لطفاً آن را تغییر دهید.",
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
    }
  });

  const toggleShowCode = () => setShowCode(prev => !prev);

  return (
    <Box
      sx={{
        maxWidth: 400,
        mx: "auto",
        mt: 8,
        p: 4,
        borderRadius: 3,
        boxShadow: 4,
        backgroundColor: "background.paper",
      }}
    >
      <Typography variant="h4" sx={{ mb: 3, textAlign: "center", fontWeight: "bold" }}>
        ثبت‌نام با شماره موبایل
      </Typography>

      <Stack spacing={2}>
        {/* --- مرحله وارد کردن شماره موبایل --- */}
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
              InputProps={{
                startAdornment: <InputAdornment position="start">📱</InputAdornment>
              }}
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

            {sendOtpMutation.isError && (
              <Alert severity="error" variant="filled" sx={{ mt: 2, borderRadius: 2 }}>
                {(sendOtpMutation.error as any)?.customMessage}
              </Alert>
            )}
          </>
        )}

        {/* --- مرحله وارد کردن کد تایید --- */}
        {step === "verify" && (
          <>
            <TextField
              fullWidth
              label="کد تایید"
              placeholder="کد ارسال شده به موبایل"
              type={showCode ? "text" : "password"}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              helperText="کد ۴ یا ۶ رقمی ارسال شده به موبایل خود را وارد کنید"
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
              onClick={() => verifyOtpMutation.mutate({ phone, code })}
              disabled={!code || verifyOtpMutation.isPending}
              startIcon={verifyOtpMutation.isPending ? <CircularProgress size={20} /> : null}
            >
              {verifyOtpMutation.isPending ? "در حال بررسی..." : "تایید و ثبت‌نام"}
            </Button>

            {verifyOtpMutation.isError && (
              <Alert severity="error" variant="outlined" sx={{ mt: 2, borderRadius: 2 }}>
                {(verifyOtpMutation.error as any)?.customMessage}
              </Alert>
            )}

            <Button
              variant="text"
              size="small"
              onClick={() => setStep("phone")}
              sx={{ mt: 1 }}
            >
              تغییر شماره موبایل
            </Button>
          </>
        )}
      </Stack>
    </Box>
  );
}
