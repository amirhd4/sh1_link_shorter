import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

export default function StatWidget({ title, value, icon }) {
    return (
        <Paper
            elevation={3}
            sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}
        >
            <Box>
                <Typography color="text.secondary">{title}</Typography>
                <Typography variant="h4">{value}</Typography>
            </Box>
            <Box sx={{ color: 'primary.main' }}>
                {icon}
            </Box>
        </Paper>
    );
}