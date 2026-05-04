"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Box, Button, Typography, Paper, TextField, CircularProgress, Alert, Grid } from "@mui/material";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

export default function PasswordProtectedPage() {
  const { domainId, shortCode } = useParams<{ domainId: string; shortCode: string }>();
  const [password, setPassword] = useState("");
  const queryParams = new URLSearchParams(location.search);
  const initialError = queryParams.get("error") === "wrong_password" ? "رمز عبور اشتباه است" : null;
  const [error, setError] = useState<string | null>(initialError);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (!password) {
    setError("لطفاً رمز عبور را وارد کنید");
    return;
  }

  const backendBase = process.env.NEXT_PUBLIC_BACKEND_BASE_URL_ORIGIN;
  const effectiveDomainId = domainId ?? "0";
  const redirectUrl = `${backendBase}/${shortCode}?password=${encodeURIComponent(password)}&domainId=${effectiveDomainId}`;

  window.location.href = redirectUrl; // مرورگر خودش ریدایرکت رو انجام میده
};


  return (
    <>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e88e5, #8e24aa)",
          p: { xs: 2, sm: 3 },
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ width: "100%" }}
        >
          <Grid container justifyContent="center">
            <Grid size={{ xs: 12, sm: 10, md: 6, lg: 5 }}>
              <Paper
                sx={{
                  p: { xs: 3, sm: 4 },
                  borderRadius: 4,
                  textAlign: "center",
                  width: "100%",
                }}
              >
                <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
                  <Lock className="w-6 h-6 text-blue-500 inline-block" /> لینک رمزدار
                </Typography>

                <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
                  برای دسترسی به لینک مقصد، لطفاً رمز عبور را وارد کنید.
                </Typography>

                <form onSubmit={handleSubmit}>
                  <TextField
                    type="password"
                    label="رمز عبور"
                    fullWidth
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    sx={{ mb: 2 }}
                    disabled={isSubmitting}
                  />

                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  )}

                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={isSubmitting}
                    fullWidth
                    sx={{
                      py: 1.5,
                      borderRadius: 3,
                      fontWeight: "bold",
                      fontSize: "1rem",
                    }}
                  >
                    {isSubmitting ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "تأیید و ادامه"
                    )}
                  </Button>
                </form>
              </Paper>
            </Grid>
          </Grid>
        </motion.div>
      </Box>
    </>
  );
}
