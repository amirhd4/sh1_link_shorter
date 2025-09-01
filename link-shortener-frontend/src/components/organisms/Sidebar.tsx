import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { Link as RouterLink } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import { useUserStore } from '../../store/userStore'; // <<<< ایمپورت استور کاربر
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';


const drawerWidth = 240;

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}


export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useUserStore();
  const navItems   = [
        { text: 'داشبورد اصلی', icon: <DashboardIcon />, path: '/dashboard', roles: ['user', 'admin'] },
        { text: 'پروفایل من', icon: <AccountCircleIcon />, path: '/profile', roles: ['user', 'admin'] },
        { text: 'پنل ادمین', icon: <SupervisorAccountIcon />, path: '/admin/dashboard', roles: ['admin'] },
        { text: 'پلن‌ها و اشتراک', icon: <WorkspacePremiumIcon />, path: '/plans', roles: ['user', 'admin'] },
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
      <List>
        {navItems.map((item) => (
            user && item.roles.includes(user.role) && (
          <ListItem key={item.text} disablePadding>
            <ListItemButton component={RouterLink} to={item.path}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
            )
        ))}
      </List>
    </Drawer>
  );
}