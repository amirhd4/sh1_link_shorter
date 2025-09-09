import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Paper,
  Stack,
  IconButton,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useMutation } from "@tanstack/react-query";
import { authService } from "../../../services/authService";
import { useSearchParams, Link as RouterLink } from "react-router-dom";

/* اسکیمای اعتبارسنجی */
const resetPasswordSchema = z
  .object({
    new_password: z.string().min(6, "رمز عبور جدید باید حداقل ۶ کاراکتر باشد."),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "رمز عبور جدید و تکرار آن مطابقت ندارند.",
    path: ["confirm_password"],
  });

type ResetPasswordFormInputs = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormInputs>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { new_password: "", confirm_password: "" },
  });

  const mutation = useMutation({
    mutationFn: (payload: { token: string; new_password: string }) =>
      authService.resetPassword(payload),
  });

  const onSubmit = (data: ResetPasswordFormInputs) => {
    if (!token) return;
    mutation.mutate({ token, new_password: data.new_password });
  };

  /* اگر توکن نیست، پیام خطا نشان بده */
  if (!token) {
    return (
      <Paper
        elevation={6}
        sx={{
          p: { xs: 3, sm: 5 },
          borderRadius: 3,
          maxWidth: 560,
          mx: "auto",
          mt: { xs: 4, sm: 6 },
          background: "linear-gradient(135deg,#fff 0%, #f8fafc 100%)",
        }}
      >
        <Alert severity="error">لینک بازیابی نامعتبر است یا منقضی شده.</Alert>
      </Paper>
    );
  }

  /* پیام موفقیت */
  if (mutation.isSuccess) {
    return (
      <Paper
        elevation={6}
        sx={{
          p: { xs: 3, sm: 5 },
          borderRadius: 3,
          maxWidth: 560,
          mx: "auto",
          mt: { xs: 4, sm: 6 },
          background: "linear-gradient(135deg,#f3e8ff 0%, #fff 100%)",
          textAlign: "center",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 800, color: "#4c1d95", mb: 1 }}>
          رمز با موفقیت تغییر کرد 🎉
        </Typography>
        <Typography variant="body2" sx={{ color: "#6b7280", mb: 2 }}>
          اکنون می‌توانید با رمز جدید وارد شوید.
        </Typography>
        <Button component={RouterLink} to="/login" variant="contained" sx={{ bgcolor: "#7c3aed" }}>
          بازگشت به صفحه ورود
        </Button>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={8}
      sx={{
        p: { xs: 3, sm: 5 },
        borderRadius: 3,
        maxWidth: 560,
        mx: "auto",
        mt: { xs: 4, sm: 6 },
        background: "linear-gradient(180deg, #ffffff 0%, #faf5ff 100%)",
        boxShadow: "0 12px 40px rgba(15,23,42,0.06)",
      }}
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, textAlign: "center", color: "#4c1d95" }}>
          تنظیم رمز عبور جدید
        </Typography>
        <Typography variant="body2" sx={{ textAlign: "center", mb: 3, color: "#6b7280" }}>
          رمز عبور جدید را وارد کنید و برای تایید آن را تکرار کنید.
        </Typography>

        {mutation.isError && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            خطا در ثبت رمز جدید — لینک ممکن است منقضی شده باشد یا مشکلی پیش آمده است.
          </Alert>
        )}

        <Stack spacing={2}>
          <Controller
            name="new_password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type={showNew ? "text" : "password"}
                label="رمز عبور جدید"
                fullWidth
                required
                error={!!errors.new_password}
                helperText={errors.new_password?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowNew((s) => !s)}
                        edge="end"
                        size="small"
                        aria-label={showNew ? "Hide password" : "Show password"}
                      >
                        {showNew ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  background: "#fff",
                  borderRadius: 2,
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": { borderColor: "#c084fc" },
                    "&.Mui-focused fieldset": { borderColor: "#7c3aed", borderWidth: 2 },
                  },
                }}
              />
            )}
          />

          <Controller
            name="confirm_password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type={showConfirm ? "text" : "password"}
                label="تکرار رمز عبور جدید"
                fullWidth
                required
                error={!!errors.confirm_password}
                helperText={errors.confirm_password?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirm((s) => !s)}
                        edge="end"
                        size="small"
                        aria-label={showConfirm ? "Hide password" : "Show password"}
                      >
                        {showConfirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  background: "#fff",
                  borderRadius: 2,
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": { borderColor: "#c084fc" },
                    "&.Mui-focused fieldset": { borderColor: "#7c3aed", borderWidth: 2 },
                  },
                }}
              />
            )}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={mutation.isPending}
            sx={{
              mt: 1,
              py: 1.4,
              borderRadius: 50,
              fontWeight: 700,
              fontSize: "1rem",
              background: "linear-gradient(90deg, #7c3aed, #d946ef)",
              color: "#fff",
              boxShadow: "0 8px 26px rgba(124,58,237,0.18)",
              "&:hover": { transform: "translateY(-2px)", boxShadow: "0 12px 40px rgba(124,58,237,0.22)" },
            }}
          >
            {mutation.isPending ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: "center" }}>
                <CircularProgress size={18} thickness={5} color="inherit" />
                ثبت رمز جدید...
              </Box>
            ) : (
              "ثبت رمز جدید"
            )}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}
