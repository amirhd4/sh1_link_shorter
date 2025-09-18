import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Button,
  Alert,
  Grid,
  Container,
  useMediaQuery,
  Fade,
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

export function PaymentStatusPage() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const isSuccess = location.pathname.includes('success');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (isSuccess) {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    }
  }, [isSuccess, queryClient]);

  return (
    <Container maxWidth="md" sx={{ mt: { xs: 6, sm: 10 }, mb: 6 }}>
      <Fade in timeout={600}>
        <Grid
          container
          spacing={4}
          justifyContent="center"
          alignItems="center"
          direction="column"
          sx={{
            textAlign: 'center',
            px: { xs: 2, sm: 4 },
            py: { xs: 4, sm: 6 },
            borderRadius: 4,
            boxShadow: 3,
            backgroundColor: isSuccess ? 'success.light' : 'error.light',
          }}
        >
          <Grid size={{xs:12}}>
            <Alert
              severity={isSuccess ? 'success' : 'error'}
              sx={{
                fontSize: '1rem',
                py: 2,
                px: 3,
                borderRadius: 2,
                backgroundColor: isSuccess ? 'success.main' : 'error.main',
                color: '#fff',
              }}
            >
              <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight="bold">
                {isSuccess ? 'پرداخت موفق' : 'پرداخت ناموفق'}
              </Typography>
              <Typography sx={{ mt: 1 }}>
                {isSuccess
                  ? 'پلن شما با موفقیت فعال شد. از امکانات جدید لذت ببرید!'
                  : 'متاسفانه در فرآیند پرداخت خطایی رخ داد. لطفاً دوباره تلاش کنید.'}
              </Typography>
            </Alert>
          </Grid>

          <Grid>
            <Button
              component={RouterLink}
              to="/dashboard"
              variant="contained"
              size={isMobile ? 'medium' : 'large'}
              sx={{
                mt: 2,
                px: 4,
                py: 1.5,
                borderRadius: 3,
                fontWeight: 'bold',
                backgroundColor: isSuccess ? 'primary.main' : 'secondary.main',
                '&:hover': {
                  backgroundColor: isSuccess
                    ? 'primary.dark'
                    : 'secondary.dark',
                },
              }}
            >
              بازگشت به داشبورد
            </Button>
          </Grid>
        </Grid>
      </Fade>
    </Container>
  );
}
