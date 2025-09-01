import { Box, Typography, Paper, Divider } from '@mui/material';
import { UpdateProfileForm } from '../components/UpdateProfileForm';
import { ChangePasswordForm } from '../components/ChangePasswordForm';

export function ProfilePage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        پروفایل کاربری
      </Typography>
      <Paper sx={{ p: 3, maxWidth: 720, mx: 'auto' }}>
        <Typography variant="h6" component="h2">اطلاعات شخصی</Typography>
        <UpdateProfileForm />

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" component="h2">تغییر رمز عبور</Typography>
        <ChangePasswordForm />
      </Paper>
    </Box>
  );
}