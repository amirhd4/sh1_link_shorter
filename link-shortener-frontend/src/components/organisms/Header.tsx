import { AppBar, Toolbar, IconButton, Typography, Button, Box, Chip, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';
import { getDaysRemaining } from '../../utils/dateUtils';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const { user, setUser } = useUserStore();
  const daysRemaining = getDaysRemaining(user?.subscription_end_date);

  /**
   * کاربر را از سیستم خارج کرده، توکن را پاک می‌کند و به صفحه ورود هدایت می‌کند.
   */
  const handleLogout = () => {
    // 1. پاک کردن توکن از حافظه محلی مرورگر
    localStorage.removeItem('access_token');

    // 2. پاک کردن اطلاعات کاربر از استور سراسری Zustand
    setUser(null);

    // 3. هدایت کاربر به صفحه ورود
    navigate('/login');
  };

  return (
    <AppBar position="fixed">
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          داشبورد مدیریت لینک
        </Typography>

        {/* بخش نمایش اطلاعات اشتراک کاربر */}
        {user && user.plan && (
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2, mx: 2 }}>
            <Tooltip title="پلن فعلی شما">
              <Chip
                icon={<WorkspacePremiumIcon />}
                label={user.plan.name}
                color="secondary"
                variant="filled"
              />
            </Tooltip>
            {daysRemaining !== null && (
               <Tooltip title="روزهای باقی‌مانده از اشتراک">
                <Chip
                  icon={<CalendarTodayIcon />}
                  label={`${daysRemaining.toLocaleString('fa-IR')} روز باقی‌مانده`}
                  color={daysRemaining < 10 ? "error" : "success"}
                  variant="filled"
                />
               </Tooltip>
            )}
          </Box>
        )}

        <Button color="inherit" onClick={handleLogout}>
          خروج
        </Button>
      </Toolbar>
    </AppBar>
  );
}