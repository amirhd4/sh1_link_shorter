import { useState } from 'react';
import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Box,
    Tooltip,
    Avatar,
    Menu,
    MenuItem,
    Divider,
    ListItemIcon,
    Chip,
    Badge
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Logout from '@mui/icons-material/Logout';
import AccountCircle from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';
import { getDaysRemaining } from '../../utils/dateUtils';

interface HeaderProps {
  // این تابع از ClientLayout برای باز و بسته کردن سایدبار پاس داده می‌شود
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const { user, setUser } = useUserStore();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const daysRemaining = getDaysRemaining(user?.subscription_end_date);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    navigate('/profile');
    handleClose();
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    navigate('/login');
    handleClose();
  };

  return (
    <AppBar position="fixed">
      <Toolbar>
        {/* دکمه منو که همیشه نمایش داده می‌شود و سایدبار را کنترل می‌کند */}
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

        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="اعلان‌ها (به زودی!)">
              <IconButton color="inherit">
                <Badge badgeContent={0} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="تنظیمات حساب کاربری">
              <IconButton onClick={handleMenu} sx={{ p: 0 }}>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  {user.first_name ? user.first_name.charAt(0) : user.email.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>

            <Menu
              sx={{ mt: '45px' }}
              anchorEl={anchorEl}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={open}
              onClose={handleClose}
            >
              <Box sx={{ px: 2, py: 1, minWidth: 220 }}>
                <Typography variant="subtitle1" noWrap>
                  {user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'کاربر'}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {user.email}
                </Typography>
              </Box>
              <Divider />
              {user.plan && (
                <Box sx={{ px: 2, py: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                   <Chip
                      icon={<WorkspacePremiumIcon fontSize="small" />}
                      label={`پلن: ${user.plan.name}`}
                      size="small"
                      variant="outlined"
                    />
                   {daysRemaining !== null && (
                      <Chip
                        icon={<CalendarTodayIcon fontSize="small" />}
                        label={`${daysRemaining.toLocaleString('fa-IR')} روز باقی‌مانده`}
                        color={daysRemaining < 10 ? 'warning' : 'success'}
                        size="small"
                        variant="outlined"
                      />
                   )}
                </Box>
              )}
              <Divider />
              <MenuItem onClick={handleProfile}>
                <ListItemIcon><AccountCircle fontSize="small" /></ListItemIcon>
                پروفایل من
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
                خروج
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}