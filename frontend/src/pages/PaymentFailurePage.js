import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Link } from 'react-router-dom';

export default function PaymentFailurePage() {
    return (
        <Box textAlign="center" mt={5}>
            <ErrorOutlineIcon sx={{ fontSize: 80, color: 'error.main' }} />
            <Typography variant="h4" gutterBottom>Payment Failed</Typography>
            <Typography color="text.secondary">There was an issue with your payment. Please try again or contact support.</Typography>
            <Button component={Link} to="/pricing" variant="contained" sx={{ mt: 3 }}>
                Try Again
            </Button>
        </Box>
    );
}