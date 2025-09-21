import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Toolbar, Divider, Box, Typography, Link
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import { Link as RouterLink } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';

const drawerWidth = 260;

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useUserStore();

  const navItems = [
    { text: 'داشبورد', icon: <DashboardIcon />, path: '/dashboard', roles: ['user', 'admin'] },
    { text: 'پروفایل من', icon: <AccountCircleIcon />, path: '/profile', roles: ['user', 'admin'] },
    { text: 'پلن‌ها و اشتراک', icon: <WorkspacePremiumIcon />, path: '/plans', roles: ['user', 'admin'] },
    { text: 'تاریخچه صورتحساب', icon: <ReceiptLongIcon />, path: '/billing', roles: ['user', 'admin'] },
  ];

  const adminNavItems = [
    { text: 'پنل ادمین', icon: <SupervisorAccountIcon />, path: '/admin/dashboard', roles: ['admin'] },
  ];

  return (
    <Drawer
      variant="temporary"
      open={isOpen}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: '#fafafa',
          borderRight: '2px solid #ede9fe',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <List>
          {navItems.map(
            (item) =>
              user && item.roles.includes(user.role) && (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton
                    component={RouterLink}
                    to={item.path}
                    onClick={onClose}
                    sx={{
                      borderRadius: 2,
                      mx: 1,
                      mb: 0.5,
                      '&:hover': { bgcolor: '#f3e8ff', color: '#6b21a8' },
                    }}
                  >
                    <ListItemIcon sx={{ color: '#6b21a8' }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              )
          )}
        </List>

        {user?.role === 'admin' && (
          <>
            <Divider sx={{ my: 1 }} />
            <List>
              {adminNavItems.map((item) => (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton
                    component={RouterLink}
                    to={item.path}
                    onClick={onClose}
                    sx={{
                      borderRadius: 2,
                      mx: 1,
                      mb: 0.5,
                      '&:hover': { bgcolor: '#f3e8ff', color: '#6b21a8' },
                    }}
                  >
                    <ListItemIcon sx={{ color: '#6b21a8' }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </>
        )}

        {/* پشتیبانی پایین سایدبار */}
        <Box sx={{ mt: 'auto', p: 2, textAlign: 'center', borderTop: '1px solid #e4e4e7' }}>
          <Typography variant="body2" sx={{ color: '#6b21a8', fontWeight: 600 }}>
            پشتیبانی
          </Typography>
          <Link href="mailto:support@l1s.ir" sx={{ display: 'block', fontSize: 13, color: '#6b21a8' }}>
            support@l1s.ir
          </Link>
          <Link href="tel:09396092135" sx={{ display: 'block', fontSize: 13, color: '#6b21a8' }}>
            09396092135
          </Link>
        </Box>
      </Box>
    </Drawer>
  );
}
