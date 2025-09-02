import { Box, Typography } from '@mui/material';
import LinkOffIcon from '@mui/icons-material/LinkOff';

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
      <LinkOffIcon sx={{ fontSize: 60, opacity: 0.4 }} />
      <Typography sx={{ mt: 2 }} variant="h6">
        هنوز لینکی نساخته‌اید!
      </Typography>
      <Typography color="text.secondary">
        برای شروع، روی دکمه "ایجاد لینک جدید" کلیک کنید.
      </Typography>
    </Box>
  );
}