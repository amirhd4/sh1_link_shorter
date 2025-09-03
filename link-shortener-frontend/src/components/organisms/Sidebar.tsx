import {Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Divider, Box} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import { Link as RouterLink } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';

const drawerWidth = 240;

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
      ModalProps={{ keepMounted: true }} // For better performance on mobile.
      sx={{
        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {navItems.map((item) => (
            user && item.roles.includes(user.role) && (
              <ListItem key={item.text} disablePadding>
                <ListItemButton component={RouterLink} to={item.path} onClick={onClose}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            )
          ))}
        </List>

        {user?.role === 'admin' && (
          <>
            <Divider />
            <List>
              {adminNavItems.map((item) => (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton component={RouterLink} to={item.path} onClick={onClose}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </>
        )}
      </Box>
    </Drawer>
  );
}