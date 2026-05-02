"use client";
import { Box, Typography } from '@mui/material';
import NoAccounts from '@mui/icons-material/NoAccounts';

export function CustomNoRowsOverlay() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
      }}
    >
      <NoAccounts sx={{ fontSize: 60, opacity: 0.4 }} />
      <Typography sx={{ mt: 2 }} variant="h6">
        داده ای موجود نیست!
      </Typography>
      {/*<Typography color="text.secondary">*/}
      {/*  برای شروع، روی دکمه "ایجاد لینک جدید" کلیک کنید.*/}
      {/*</Typography>*/}
    </Box>
  );
}