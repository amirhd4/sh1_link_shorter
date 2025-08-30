import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Link } from 'react-router-dom';

export default function PaymentFailedPage() {
    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="80vh"
            bgcolor="background.default"
        >
            <Paper
                elevation={4}
                sx={{ p: 5, textAlign: "center", borderRadius: 3, maxWidth: 450 }}
            >
                <ErrorOutlineIcon sx={{ fontSize: 90, color: 'error.main', mb: 2 }} />

                <Typography variant="h5" fontWeight="bold" gutterBottom color="error.main">
                    پرداخت ناموفق بود!
                </Typography>

                <Typography color="text.secondary" mb={3}>
                    متأسفانه تراکنش شما با خطا مواجه شد و اشتراک فعال نشد.
                    لطفاً دوباره تلاش کنید یا با پشتیبانی تماس بگیرید.
                </Typography>

                <Button
                    component={Link}
                    to="/"
                    variant="contained"
                    color="error"
                    size="large"
                    sx={{ borderRadius: 2, px: 4 }}
                >
                    بازگشت به داشبورد
                </Button>
            </Paper>
        </Box>
    );
}
