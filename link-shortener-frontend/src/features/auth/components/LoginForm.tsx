import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Link as MuiLink,
  Grid,
  Divider,
  Paper,
  IconButton,
  InputAdornment,
  Stack,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import EmailIcon from "@mui/icons-material/AlternateEmail";
import LockIcon from "@mui/icons-material/Lock";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { authService } from "../../../services/authService";
import { useUserStore } from "../../../store/userStore";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";
import { GoogleLoginButton } from "./GoogleLoginButton";

const emailOrPhoneSchema = z.object({
  emailOrPhone: z.string().refine(
    (val) => {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      const isPhone = /^[0-9]{10,15}$/.test(val);
      return isEmail || isPhone;
    },
    "ایمیل یا شماره موبایل معتبر وارد کنید ✨"
  ),
  password: z.string().min(1, "رمز عبور نمی‌تواند خالی باشد ⚡"),
});

type LoginFormInputs = z.infer<typeof emailOrPhoneSchema>;

export function LoginForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useUserStore();
  const [verificationError, setVerificationError] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isClient = typeof window !== "undefined";


  const { control, handleSubmit, getValues, formState: { errors } } = useForm<LoginFormInputs>({
    resolver: zodResolver(emailOrPhoneSchema),
    defaultValues: { emailOrPhone: "", password: "" },
  });

  const loginMutation = useMutation({
    mutationFn: (credentials: any) => authService.login(credentials),
    onSuccess: async (data) => {
          if (!isClient) return;

      localStorage.setItem("access_token", data.access_token);
      try {
        const user = await authService.getMe();
        setUser(user);
        navigate("/dashboard");
      } catch (error) {
        console.error("خطا در واکشی اطلاعات کاربر:", error);
      }
    },
    onError: (error: any) => {
    if (!isClient) return;

      if (
        error.response?.status === 403 &&
        error.response?.data?.detail?.includes("Email not verified")
      ) {
        setVerificationError(true);
      } else {
        setVerificationError(false);
      }
    },
  });

  const resendMutation = useMutation({


    mutationFn: authService.resendVerificationEmail,
    onSuccess: () => {
      setResendSuccess(true);
      setVerificationError(false);
    },
  });

  const handleResend = () => {
    const emailOrPhone = getValues("emailOrPhone");
    if (emailOrPhone) {
      resendMutation.mutate(emailOrPhone);
    } else {
      setVerificationError(true);
    }
  };

  const onSubmit = (data: LoginFormInputs) => {
    setVerificationError(false);
    setResendSuccess(false);
    loginMutation.mutate({
      email: data.emailOrPhone,
      password: data.password,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Paper
        elevation={16}
        sx={{
          p: { xs: 3, sm: 5 },
          borderRadius: 5,
          maxWidth: 500,
          mx: "auto",
          mt: { xs: 4, sm: 6 },
          background: "linear-gradient(180deg, #ffffff 0%, #f9f5ff 100%)",
          boxShadow: "0 20px 60px rgba(124,58,237,0.25)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              mb: 1,
              textAlign: "center",
              background: "linear-gradient(90deg,#7c3aed,#ec4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            🎉 خوش برگشتی
          </Typography>
          <Typography
            variant="body2"
            sx={{ textAlign: "center", mb: 4, color: "#6b21a8" }}
          >
            برای مدیریت بهتر لینک‌ها و تجربه‌ای خاص وارد حساب خود شوید
          </Typography>

          <Stack spacing={2}>
            {searchParams.get("registered") && (
              <Alert severity="success" sx={{ borderRadius: 2 }}>
                ثبت‌نام شما موفق بود ✅ لطفاً ایمیل خود را بررسی کنید.
              </Alert>
            )}

            {resendSuccess && (
              <Alert severity="success" sx={{ borderRadius: 2 }}>
                لینک فعال‌سازی دوباره برای شما ارسال شد 🚀
              </Alert>
            )}

            {loginMutation.isError && !verificationError && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                نام کاربری یا رمز عبور اشتباهه 😅
              </Alert>
            )}

            {verificationError && (
              <Alert
                severity="warning"
                sx={{
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>ایمیل شما هنوز تأیید نشده 😕</Box>
                <Button
                  onClick={handleResend}
                  disabled={resendMutation.isPending}
                  size="small"
                  variant="outlined"
                  sx={{
                    textTransform: "none",
                    borderRadius: 2,
                    borderColor: "#9333ea",
                    color: "#7e22ce",
                  }}
                >
                  {resendMutation.isPending ? "در حال ارسال..." : "ارسال مجدد"}
                </Button>
              </Alert>
            )}

            {/* Email / Phone */}
            <Controller
              name="emailOrPhone"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="ایمیل یا شماره موبایل"
                  autoComplete="email"
                  autoFocus
                  error={!!errors.emailOrPhone}
                  helperText={errors.emailOrPhone?.message}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="secondary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    background: "#fff",
                    borderRadius: 3,
                  }}
                />
              )}
            />

            {/* Password */}
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="رمز عبور"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="secondary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((s) => !s)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? (
                            <VisibilityOff fontSize="small" />
                          ) : (
                            <Visibility fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    background: "#fff",
                    borderRadius: 3,
                  }}
                />
              )}
            />

            {/* Submit Button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loginMutation.isPending}
                sx={{
                  mt: 1,
                  py: 1.6,
                  borderRadius: 50,
                  fontWeight: 700,
                  fontSize: "1rem",
                  background: "linear-gradient(90deg, #7c3aed, #d946ef)",
                  color: "#fff",
                  boxShadow: "0 12px 36px rgba(124,58,237,0.25)",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 16px 50px rgba(124,58,237,0.35)",
                  },
                }}
              >
                {loginMutation.isPending ? "⏳ در حال ورود..." : "🚀 ورود"}
              </Button>
            </motion.div>

            <Divider sx={{ my: 2 }}>یا</Divider>
            <GoogleLoginButton />
          </Stack>

          <Grid
            container
            sx={{ mt: 4 }}
            justifyContent="space-between"
            alignItems="center"
          >
            <Grid>
              <MuiLink
                component={RouterLink}
                to="/forgot-password"
                variant="body2"
                sx={{ color: "#7e22ce" }}
              >
                رمز عبورت رو یادت رفته؟ 🤔
              </MuiLink>
            </Grid>
            <Grid>
              <MuiLink
                component={RouterLink}
                to="/register"
                variant="body2"
                sx={{ color: "#7e22ce" }}
              >
                حساب نداری؟ همین الان بساز 💫
              </MuiLink>
            </Grid>
            <Grid>
              <MuiLink
                component={RouterLink}
                to="/login-otp"
                variant="body2"
                sx={{ color: "#7e22ce" }}
              >
                ورود با شماره موبایل 📱
              </MuiLink>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </motion.div>
  );
}
