"use client";

import {useState} from "react";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {
    Alert,
    Box,
    Button,
    Divider,
    Grid,
    IconButton,
    InputAdornment,
    Link as MuiLink,
    Paper,
    Snackbar,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import EmailIcon from "@mui/icons-material/AlternateEmail";
import LockIcon from "@mui/icons-material/Lock";
import {motion} from "framer-motion";
import {useMutation} from "@tanstack/react-query";
import {authService} from "@/services/authService";
import {useUserStore} from "@/store/userStore";

import Link from "next/link";
import {useRouter, useSearchParams} from "next/navigation";
import {Turnstile} from "@marsidev/react-turnstile";
import config from "@/config";

const phoneSchema = z.object({
  phone_number: z.string().refine(
    (val) => {
      // const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        return /^[0-9]{10,15}$/.test(val);
    },
    "شماره موبایل معتبر وارد کنید ✨"
  ),
  password: z.string().min(1, "رمز عبور نمی‌تواند خالی باشد ⚡"),
});

type LoginFormInputs = z.infer<typeof phoneSchema>;

export function LoginForm() {
  const navigate = useRouter();
  const searchParams = useSearchParams();

  const { setUser } = useUserStore();
  const [verificationError, setVerificationError] = useState(false);
  // const [resendSuccess, setResendSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const isClient = typeof window !== "undefined";

  const { control, handleSubmit, getValues, formState: { errors } } = useForm<LoginFormInputs>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone_number: "", password: "" },
  });

  const loginMutation = useMutation({
    mutationFn: (credentials: any) => authService.login(credentials),
    onSuccess: async (data) => {
      if (!isClient) return;
      // localStorage.setItem("access_token", data.access_token);
      // document.cookie = `access_token=${data.access_token}; path=/`;
      try {
        const user = await authService.getMe();
        setUser(user);
        navigate.push("/dashboard");
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
        setSnackbarMessage("نام کاربری یا رمز عبور اشتباهه 😅");
      }
    },
  });

  // const resendMutation = useMutation({
  //   mutationFn: authService.resendVerificationEmail,
  //   onSuccess: () => {
  //     setResendSuccess(true);
  //     setVerificationError(false);
  //     setSnackbarMessage("لینک فعال‌سازی دوباره برای شما ارسال شد 🚀");
  //   },
  // });

  // const handleResend = () => {
  //   const emailOrPhone = getValues("emailOrPhone");
  //   if (emailOrPhone) {
  //     resendMutation.mutate(emailOrPhone);
  //   } else {
  //     setVerificationError(true);
  //   }
  // };

  const onSubmit = (data: LoginFormInputs) => {
    if (!captchaToken && !config.debug) {
      setSnackbarMessage("لطفاً کپچا را کامل کنید 🛡️");
      return;
    }
    setVerificationError(false);
    // setResendSuccess(false);
    loginMutation.mutate({
      username: data.phone_number,
      password: data.password,
      captcha_token: captchaToken,
    });
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
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
            <Typography variant="body2" sx={{ textAlign: "center", mb: 4, color: "#6b21a8" }}>
              برای مدیریت بهتر لینک‌ها و تجربه‌ای خاص وارد حساب خود شوید
            </Typography>

            <Stack spacing={2}>
              {/*{searchParams.get("registered") && (*/}
              {/*  <Alert severity="success" sx={{ borderRadius: 2 }}>*/}
              {/*    ثبت‌نام شما موفق بود ✅ لطفاً ایمیل خود را بررسی کنید.*/}
              {/*  </Alert>*/}
              {/*)}*/}

              {/*{resendSuccess && (*/}
              {/*  <Alert severity="success" sx={{ borderRadius: 2 }}>*/}
              {/*    لینک فعال‌سازی دوباره برای شما ارسال شد 🚀*/}
              {/*  </Alert>*/}
              {/*)}*/}

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
                  <Box>شماره شما هنوز تایید نشده است 😕. لطفا با پشتیبانی تماس بگیرید</Box>
                </Alert>
              )}

              {/* Email / Phone */}
              <Controller
                name="phone_number"
                control={control}
                render={({ field }: { field: any }) => (

                  <TextField
                    {...field}
                    fullWidth
                    label="شماره موبایل"
                    autoComplete="email"
                    autoFocus
                    error={!!errors.phone_number}
                    helperText={errors.phone_number?.message}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="secondary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ background: "#fff", borderRadius: 3 }}
                  />
                )}
              />

              {/* Password */}
              <Controller
                name="password"
                control={control}
                render={({ field } : {field: any}) => (
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
                          <IconButton onClick={() => setShowPassword((s) => !s)} edge="end" size="small">
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ background: "#fff", borderRadius: 3 }}
                  />
                )}
              />

              <Turnstile
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                onSuccess={(token) => setCaptchaToken(token)}
                onError={() => setCaptchaToken(null)}
                onExpire={() => setCaptchaToken(null)}
                options={{ theme: "light", size: "normal" }}
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
              {/*<GoogleLoginButton />*/}
              {/*    TODO: Change here to enable google login mode!    */}
            </Stack>

            <Grid container sx={{ mt: 4 }} justifyContent="space-between" alignItems="center">
              {/*<Grid>*/}
              {/*  <MuiLink component={Link} href="/forgot-password" variant="body2" sx={{ color: "#7e22ce" }}>*/}
              {/*    رمز عبورت رو یادت رفته؟ 🤔*/}
              {/*  </MuiLink>*/}
              {/*</Grid>*/}
              <Grid>
                <MuiLink component={Link} href="/register" variant="body2" sx={{ color: "#7e22ce" }}>
                  حساب نداری؟ همین الان بساز 💫
                </MuiLink>
              </Grid>
              <Grid>
                <MuiLink component={Link} href="/login-otp" variant="body2" sx={{ color: "#7e22ce" }}>
                  ورود با رمز یکبار مصرف 📱
                </MuiLink>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </motion.div>

      <Snackbar
        open={!!snackbarMessage}
        autoHideDuration={4000}
        onClose={() => setSnackbarMessage(null)}
        message={snackbarMessage || ""}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </>
  );
}
