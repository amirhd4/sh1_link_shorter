import { Button } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import config from '../../../config';

export function GoogleLoginButton() {
  const handleGoogleLogin = () => {
    // کاربر را به اندپوینت بک‌اند برای شروع فرآیند OAuth هدایت می‌کنیم
    window.location.href = `${config.backendBaseUrl}/auth/google/login`;
  };

  return (
    <Button
      fullWidth
      variant="outlined"
      startIcon={<GoogleIcon />}
      onClick={handleGoogleLogin}
      sx={{ mt: 1, mb: 1 }}
    >
      ورود با گوگل
    </Button>
  );
}