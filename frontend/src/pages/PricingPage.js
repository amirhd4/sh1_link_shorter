import React, { useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, CardActions, Button, CardHeader, List, ListItem, ListItemIcon, ListItemText, CircularProgress } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import api from '../api';
import { useAuth } from '../context/AuthContext';


const tiers = [
    {
        title: 'رایگان',
        price: '0',
        description: [
            '50 لینک در ماه',
            'تحلیل‌های پایه',
            'پشتیبانی از طریق ایمیل',
        ],
        buttonText: 'پلن فعلی شما',
        buttonVariant: 'outlined',
    },
    {
        title: 'حرفه‌ای',
        price: '29', // قیمت به تومان یا دلار
        description: [
            '1000 لینک در ماه',
            'تحلیل‌های پیشرفته',
            'دامنه سفارشی',
            'پشتیبانی اولویت‌دار',
        ],
        buttonText: 'ارتقا دهید',
        buttonVariant: 'contained',
    },
];


export default function PricingPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleUpgradeClick = async () => {
        setLoading(true);
        try {
            const response = await api.post('/payments/create-zarinpal-link', {
                plan_name: 'Pro'
            });
            const { payment_url } = response.data;
            if (payment_url) {
                window.location.href = payment_url;
            }
        } catch (error) {
            console.error("Failed to start payment process:", error);
            alert("Could not initiate payment. Please try again later.");
            setLoading(false);
        }
    };


    return (
        <Box>
            <Typography variant="h3" align="center" gutterBottom>
                پلن مناسب خود را انتخاب کنید
            </Typography>
            <Typography variant="h6" align="center" color="text.secondary" component="p">
                با ابزارهای قدرتمند ما، لینک‌های خود را به سطح بالاتری ببرید.
            </Typography>
            <Grid container spacing={5} alignItems="flex-end" sx={{ mt: 4 }}>
                {tiers.map((tier) => (
                    <Grid item key={tier.title} xs={12} sm={tier.title === 'Enterprise' ? 12 : 6} md={6}>
                        <Card>
                            <CardHeader
                                title={tier.title}
                                titleTypographyProps={{ align: 'center' }}
                                subheaderTypographyProps={{ align: 'center' }}
                                sx={{ bgcolor: 'grey.200' }}
                            />
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', mb: 2 }}>
                                    <Typography component="h2" variant="h3" color="text.primary">
                                        ${tier.price}
                                    </Typography>
                                    <Typography variant="h6" color="text.secondary">
                                        /ماه
                                    </Typography>
                                </Box>
                                <List>
                                    {tier.description.map((line) => (
                                        <ListItem disableGutters key={line}>
                                            <ListItemIcon>
                                                <CheckIcon />
                                            </ListItemIcon>
                                            <ListItemText primary={line} />
                                        </ListItem>
                                    ))}
                                </List>
                            </CardContent>
                            <CardActions>
                                <Box sx={{ width: '100%', position: 'relative' }}>
                                    <Button
                                        fullWidth
                                        variant={tier.title === 'Pro' ? 'contained' : 'outlined'}
                                        onClick={tier.title === 'Pro' ? handleUpgradeClick : null}
                                        disabled={loading || user?.plan?.name === 'Pro'}
                                    >
                                        {user?.plan?.name === tier.title ? 'پلن فعلی شما' : tier.buttonText}
                                    </Button>
                                    {loading && tier.title === 'Pro' && (
                                        <CircularProgress
                                            size={24}
                                            sx={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                marginTop: '-12px',
                                                marginLeft: '-12px',
                                            }}
                                        />
                                    )}
                                </Box>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}