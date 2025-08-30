import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    CardHeader,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Skeleton,
    Alert,
    Container,
    CircularProgress
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function PricingPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tiers, setTiers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paymentLoading, setPaymentLoading] = useState(null);
    const [error, setError] = useState('');

    const fetchPlans = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/plans/');
            const formattedTiers = response.data.map(plan => ({
                title: plan.name === 'Free' ? 'رایگان' : 'حرفه‌ای',
                price: plan.price,
                planName: plan.name,
                description: [
                    `${plan.link_limit_per_month.toLocaleString('fa-IR')} لینک در ماه`,
                    `پشتیبانی از دامنه سفارشی ${plan.name === 'Pro' ? '✅' : '❌'}`,
                    `تحلیل‌های پیشرفته ${plan.name === 'Pro' ? '✅' : '❌'}`,
                    'پشتیبانی ۲۴/۷ از طریق تیکت',
                ],
            }));
            setTiers(formattedTiers);
        } catch (err) {
            setError("خطا در دریافت لیست پلن‌ها. لطفاً بعداً تلاش کنید.");
            console.error("Failed to fetch plans", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    const handleUpgradeClick = async (planName) => {
        if (!user) {
            navigate('/login');
            return;
        }
        setPaymentLoading(planName);
        try {
            const response = await api.post('/payments/create-zarinpal-link', { plan_name: planName });
            const { payment_url } = response.data;
            if (payment_url) {
                window.location.href = payment_url;
            }
        } catch (error) {
            console.error("Failed to start payment process:", error);
            alert("شروع فرآیند پرداخت با خطا مواجه شد. لطفاً دوباره تلاش کنید.");
        } finally {
            setPaymentLoading(null);
        }
    };

    return (
        <Container maxWidth="md">
            <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
                پلن مناسب خود را انتخاب کنید
            </Typography>
            <Typography variant="h6" align="center" color="text.secondary" component="p" sx={{ mb: 6 }}>
                با ابزارهای قدرتمند ما، لینک‌های خود را به دارایی‌های استراتژیک تبدیل کنید.
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

            <Grid container spacing={5} alignItems="stretch">
                {loading ? (
                    Array.from(new Array(2)).map((_, index) => (
                        <Grid item key={index} xs={12} md={6}>
                            <Card sx={{ height: '100%' }}>
                                <CardHeader
                                    title={<Skeleton animation="wave" height={40} width="60%" />}
                                    sx={{ bgcolor: 'grey.100' }}
                                />
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', mb: 2 }}>
                                        <Skeleton animation="wave" height={60} width="50%" />
                                    </Box>
                                    <Skeleton animation="wave" height={25} sx={{ mb: 1 }} />
                                    <Skeleton animation="wave" height={25} sx={{ mb: 1 }} />
                                    <Skeleton animation="wave" height={25} />
                                </CardContent>
                                <CardActions sx={{p: 2}}>
                                    <Skeleton animation="wave" variant="rounded" height={40} width="100%" />
                                </CardActions>
                            </Card>
                        </Grid>
                    ))
                ) : (
                    tiers.map((tier) => (
                        <Grid item key={tier.title} xs={12} md={6}>
                            <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', border: tier.planName === 'Pro' ? 2 : 0, borderColor: 'primary.main', boxShadow: tier.planName === 'Pro' ? 5 : 1 }}>
                                <CardHeader
                                    title={tier.title}
                                    titleTypographyProps={{ align: 'center', variant: 'h5', fontWeight: 'bold' }}
                                    sx={{ bgcolor: 'grey.100' }}
                                />
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', mb: 2 }}>
                                        <Typography component="h2" variant="h3" color="text.primary">
                                            {tier.price.toLocaleString('fa-IR')}
                                        </Typography>
                                        <Typography variant="h6" color="text.secondary" sx={{ mr: 1 }}>
                                            تومان/ماهانه
                                        </Typography>
                                    </Box>
                                    <List>
                                        {tier.description.map((line) => (
                                            <ListItem disableGutters key={line}>
                                                <ListItemIcon sx={{ minWidth: 32 }}>
                                                    <CheckIcon color="success" />
                                                </ListItemIcon>
                                                <ListItemText primary={line} />
                                            </ListItem>
                                        ))}
                                    </List>
                                </CardContent>
                                <CardActions sx={{ p: 2 }}>
                                    <Button
                                        fullWidth
                                        variant={(user?.plan?.name === tier.planName) ? 'outlined' : 'contained'}
                                        onClick={() => handleUpgradeClick(tier.planName)}
                                        disabled={paymentLoading !== null || user?.plan?.name === tier.planName || tier.planName === 'Free'}
                                        size="large"
                                    >
                                        {paymentLoading === tier.planName ? <CircularProgress size={26} /> : (user?.plan?.name === tier.planName ? 'پلن فعلی شما' : 'انتخاب و پرداخت')}
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>
        </Container>
    );
}