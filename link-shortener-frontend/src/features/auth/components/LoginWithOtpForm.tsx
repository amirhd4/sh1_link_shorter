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

export function LoginWithOtpForm() {
  const navigate = useNavigate();
  const { setUser } = useUserStore();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "verify">("phone");
  const [showCode, setShowCode] = useState(false);

  const sendOtpMutation = useMutation({
    mutationFn: (phone: string) => authService.sendOtp(phone),
    onSuccess: () => setStep("verify"),
  });

  const verifyOtpMutation = useMutation({
    mutationFn: ({ phone, code }: { phone: string; code: string }) =>
      authService.verifyOtp(phone, code),
    onSuccess: async (data) => {
      localStorage.setItem("access_token", data.access_token);

      try {
        const user = await authService.getMe(); // واکشی اطلاعات کاربر بعد از ست شدن توکن
        setUser(user); // state کاربر
        localStorage.setItem(
          "welcome_msg",
          JSON.stringify({ text: "ورود موفقیت‌آمیز بود 🎉 خوش آمدید!", severity: "success" })
        );
        navigate("/dashboard"); // navigation بدون refresh
      } catch (err) {
        console.error("خطا در واکشی اطلاعات کاربر:", err);
      }
    },
  });

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value);
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value);

  const toggleShowCode = () => setShowCode(prev => !prev);

  return (
    <Box 
      sx={{ 
        maxWidth: 400, 
        mx: "auto", 
        mt: 8, 
        p: 4, 
        borderRadius: 3, 
        boxShadow: 3, 
        backgroundColor: "background.paper"
      }}
    >
      <Typography variant="h4" sx={{ mb: 3, textAlign: "center", fontWeight: "bold" }}>
        ورود با شماره موبایل
      </Typography>

      <Stack spacing={2}>
        {step === "phone" && (
          <>
            <TextField
              fullWidth
              label="شماره موبایل"
              placeholder="مثال: 09123456789"
              value={phone}
              onChange={handlePhoneChange}
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
              <Alert severity="error" sx={{ mt: 1 }}>
                {sendOtpMutation.error instanceof Error ? sendOtpMutation.error.message : "خطا در ارسال کد. دوباره تلاش کنید."}
              </Alert>
            )}
          </>
        )}

        {step === "verify" && (
          <>
            <TextField
              fullWidth
              label="کد تایید"
              placeholder="کد ارسال شده به موبایل"
              type={showCode ? "text" : "password"}
              value={code}
              onChange={handleCodeChange}
              helperText="کد ۴ یا ۶ رقمی ارسال شده به موبایل خود را وارد کنید"
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
            {verifyOtpMutation.isError && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {verifyOtpMutation.error instanceof Error ? verifyOtpMutation.error.message : "کد وارد شده صحیح نیست."}
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
