import { Box, Typography, Paper, Divider } from '@mui/material';
import { UpdateProfileForm } from '@/components/profile/UpdateProfileForm';
import { ChangePasswordForm } from '@/components/profile/ChangePasswordForm';

export default function ProfilePage() {
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