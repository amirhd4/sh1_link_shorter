import { AppBar, Toolbar, IconButton, Typography, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useUserStore } from '../../store/userStore';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const { setUser } = useUserStore();

  const handleLogout = () => {
    // 1. پاک کردن توکن از حافظه
    localStorage.removeItem('access_token');
    // 2. پاک کردن اطلاعات کاربر از استور Zustand
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
        <Button color="inherit" onClick={handleLogout}>
          خروج
        </Button>
      </Toolbar>
    </AppBar>
  );
}