"use client";

import { useQuery, useMutation } from '@tanstack/react-query';
import { plansService } from '@/services/plansService';
import { paymentService } from '@/services/paymentService';

import {
  Box, Typography, Card, CardContent, CardActions,
  Button, CircularProgress, Grid, Alert, Chip, Divider
} from '@mui/material';

import StarIcon from '@mui/icons-material/Star';
import CheckIcon from '@mui/icons-material/Check';
import { useUserStore } from '@/store/userStore';
import { useEffect } from "react";

export default function PlansPage() {
  const { user, quota } = useUserStore();

  useEffect(() => {
    document.title = "پلن‌های اشتراک";
  }, []);

  const { data: plans, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['plans'],
    queryFn: plansService.getAllPlans,
  });

  const paymentMutation = useMutation({
    mutationFn: paymentService.createPaymentLink,
    onSuccess: (data) => {
      if (typeof window !== "undefined" && data.payment_url) {
        window.location.href = data.payment_url;
      }
    },
  });

  if (isLoadingPlans) return <CircularProgress />;

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
        انتخاب پلن اشتراک
      </Typography>

      {user?.plan && quota && (
        <Alert severity="info" sx={{ mb: 3 }}>
          پلن فعلی شما: <strong>{user.plan.name}</strong> | لینک‌های باقی‌مانده این ماه: <strong>{quota.remaining}</strong> از {quota.limit}
        </Alert>
      )}

      <Grid container spacing={3}>
        {plans?.map((plan) => {
          const today = new Date();
          const isSubscriptionActive =
            Boolean(user?.subscription_end_date && new Date(user.subscription_end_date) >= today);

          const isCurrentPlan =
            isSubscriptionActive && user?.plan?.name === plan.name;

          const isPro = plan.name === "Pro";

          return (
            <Grid size={{ xs: 12, md: 4 }} key={plan.id}>
              <Card
                raised={isCurrentPlan}
                sx={{
                  position: "relative",
                  borderRadius: 3,
                  overflow: "hidden",
                  transition: "0.3s",
                  border: isCurrentPlan ? '2px solid #1976d2' : '1px solid #e0e0e0',
                  boxShadow: isPro ? "0 0 30px rgba(0,0,0,0.1)" : "none",
                  background: isPro
                    ? "linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)"
                    : "#fff",
                  "&:hover": {
                    transform: isCurrentPlan ? "none" : "translateY(-6px)",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.12)"
                  }
                }}
              >
                {isPro && (
                  <Chip
                    label="محبوب‌ترین"
                    color="primary"
                    icon={<StarIcon />}
                    sx={{
                      position: 'absolute',
                      top: 16,
                      left: 16,
                      fontWeight: "bold",
                      px: 1
                    }}
                  />
                )}

                <CardContent>
                  <Typography variant="h5" fontWeight="bold">
                    {plan.name}
                  </Typography>

                  <Typography sx={{ mb: 2 }} color="text.secondary" fontSize="1.1rem">
                    {plan.price === 0
                      ? "رایگان"
                      : `${(plan.price / 10).toLocaleString('fa-IR')} تومان`}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="body2" sx={{ mb: 1.5 }}>
                    <CheckIcon fontSize="small" color="primary" /> محدودیت {plan.link_limit_per_month} لینک در ماه
                    <br />
                    <CheckIcon fontSize="small" color="primary" /> اعتبار {plan.duration_days} روزه
                  </Typography>

                  <Typography variant="body2" sx={{ mb: 1.5 }}>
                    {plan.name === "Free"
                      ? "• فقط 1 لینک بیو"
                      : "• امکان ایجاد 3 لینک در بیو"}
                  </Typography>

                  {isPro && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body1" fontWeight="bold">
                        امکانات ویژه پلن Pro
                      </Typography>

                      <Typography variant="body2" sx={{ mt: 1 }}>
                        • دسترسی به آمار کامل لینک‌ها
                        • امکان اتصال تا 5 دامنه اختصاصی
                        • دسترسی کامل به تمام دامنه‌های کوتاه‌کننده سایت
                        • سرعت بالاتر و محدودیت کمتر
                        • پشتیبانی ویژه
                      </Typography>
                    </Box>
                  )}

                  {isCurrentPlan && user?.subscription_start_date && user?.subscription_end_date && (
                    <Box mt={2}>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2">
                        <strong>شروع اشتراک:</strong>{" "}
                        {new Date(user.subscription_start_date).toLocaleDateString('fa-IR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </Typography>
                      <Typography variant="body2">
                        <strong>پایان اشتراک:</strong>{" "}
                        {new Date(user.subscription_end_date).toLocaleDateString('fa-IR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </Typography>
                    </Box>
                  )}
                </CardContent>

                <CardActions sx={{ p: 2 }}>
                  <Button
                    fullWidth
                    size="large"
                    variant={isCurrentPlan ? "outlined" : "contained"}
                    onClick={() => !isCurrentPlan && paymentMutation.mutate(plan.name)}
                    disabled={
                      plan.name === "Free" ||
                      (isSubscriptionActive && user?.plan?.name === plan.name) ||
                      paymentMutation.isPending
                    }
                    sx={{
                      borderRadius: 2,
                      fontWeight: "bold",
                      py: 1.2
                    }}
                  >
                    {plan.name === "Free"
                      ? "پلن رایگان"
                      : isCurrentPlan
                        ? "پلن فعلی شما"
                        : paymentMutation.isPending
                          ? "در حال انتقال..."
                          : "انتخاب و پرداخت"}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {paymentMutation.isError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          خطا در اتصال به درگاه پرداخت.
        </Alert>
      )}
    </Box>
  );
}
