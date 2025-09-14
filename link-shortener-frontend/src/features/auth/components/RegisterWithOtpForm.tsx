import { useState } from "react";
import { Button, TextField, Box, Typography, Alert } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { authService } from "../../../services/authService";

export function RegisterWithOtpForm() {
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
    onSuccess: (data) => {
      localStorage.setItem("access_token", data.access_token);
      window.location.href = "/dashboard";
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
