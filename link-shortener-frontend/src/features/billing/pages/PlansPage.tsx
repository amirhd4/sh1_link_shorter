import { useQuery, useMutation } from '@tanstack/react-query';
import { plansService } from '../../../services/plansService';
import { paymentService } from '../../../services/paymentService';
import { Box, Typography, Card, CardContent, CardActions, Button, CircularProgress, Grid, Alert } from '@mui/material';
import { useUserStore } from '../../../store/userStore';


export function PlansPage() {
  const { user } = useUserStore();
  const { data: plans, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['plans'],
    queryFn: plansService.getAllPlans,
  });

  const paymentMutation = useMutation({
    mutationFn: paymentService.createPaymentLink,
    onSuccess: (data) => {
      // هدایت کاربر به درگاه پرداخت
      if (data.payment_url) {
        window.location.href = data.payment_url;
      }
    },
  });

  if (isLoadingPlans) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        انتخاب پلن اشتراک
      </Typography>
      <Grid container spacing={3}>
        {plans?.map((plan) => {
          const isCurrentPlan = user?.plan?.name === plan.name;

          return (
              <Grid key={plan.id} xs={12} md={4}>
                <Card raised={isCurrentPlan}
                      sx={isCurrentPlan ? {borderColor: 'primary.main', borderWidth: 2, borderStyle: 'solid'} : {}}>
                  <CardContent>
                    <Typography variant="h5" component="div">{plan.name}</Typography>
                    <Typography sx={{mb: 1.5}} color="text.secondary">
                      {plan.price === 0 ? "رایگان" : `${(plan.price / 10).toLocaleString('fa-IR')} تومان`}
                    </Typography>
                    <Typography variant="body2">
                      - محدودیت {plan.link_limit_per_month} لینک در ماه
                      <br/>
                      - اعتبار {plan.duration_days} روزه
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                        size="small"
                        variant={isCurrentPlan ? "outlined" : "contained"}
                        onClick={() => !isCurrentPlan && paymentMutation.mutate(plan.name)}
                        // غیرفعال کردن دکمه برای پلن فعلی و هنگام انتقال به درگاه <<<<
                        disabled={isCurrentPlan || paymentMutation.isPending}
                    >
                      {isCurrentPlan ? 'پلن فعلی شما' : (paymentMutation.isPending ? 'در حال انتقال...' : 'انتخاب و پرداخت')}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
          )
        })}
      </Grid>
      {paymentMutation.isError && <Alert severity="error" sx={{mt: 2}}>خطا در اتصال به درگاه پرداخت.</Alert>}
    </Box>
  );
}