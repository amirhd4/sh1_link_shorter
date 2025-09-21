import { useState } from "react";
import { Button, TextField, Box, Typography, Alert } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { authService } from "../../../services/authService";
import { useNavigate } from "react-router-dom";
import { useUserStore } from '../../../store/userStore';


export function RegisterWithOtpForm() {
  const navigate = useNavigate();
  const { setUser } = useUserStore();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "verify">("phone");

  const sendOtpMutation = useMutation({
    mutationFn: (phone: string) => authService.sendOtp(phone),
    onSuccess: () => setStep("verify"),
  });

  const verifyOtpMutation = useMutation({
  mutationFn: ({ phone, code }: { phone: string; code: string }) =>
    authService.registerWithOtp(phone, code),
  onSuccess: async (data) => {
    console.log("Register token:", data.access_token); // 🔍
    console.log("Register response:", data);

    localStorage.setItem("access_token", data.access_token);
    // localStorage.setItem("welcome_msg", "ورود موفقیت‌آمیز بود 🎉 خوش اومدی. رمز عبور شما همان شماره شماست. آن را تغییر دهید!");

    localStorage.setItem("access_token", data.access_token);

    setTimeout(async () => {
      const user = await authService.getMe();
      setUser(user);
      navigate("/dashboard");
    }, 0);


    // try {
    //   const user = await authService.getMe();
    //   setUser(user); // state کاربر
    //   navigate("/dashboard"); // ✅ navigation بدون refresh
    // } catch (err) {
    //   console.error("خطا در واکشی اطلاعات کاربر:", err);
    // }
  },
});

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>
        ثبت‌نام با شماره موبایل
      </Typography>

      {step === "phone" && (
        <>
          <TextField
            fullWidth
            label="شماره موبایل"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            fullWidth
            variant="contained"
            onClick={() => sendOtpMutation.mutate(phone)}
          >
            ارسال کد تایید
          </Button>
        </>
      )}

      {step === "verify" && (
        <>
          <TextField
            fullWidth
            label="کد تایید"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            fullWidth
            variant="contained"
            onClick={() => verifyOtpMutation.mutate({ phone, code })}
          >
            تایید و ثبت‌نام
          </Button>
        </>
      )}
    </Box>
  );
}
