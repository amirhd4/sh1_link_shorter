import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LinkIcon from '@mui/icons-material/Link';
import { Link as RouterLink } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const drawerWidth = 240;

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
    { text: 'داشبورد اصلی', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'لینک‌های من', icon: <LinkIcon />, path: '/my-links' },
    { text: 'پروفایل من', icon: <AccountCircleIcon />, path: '/profile' },

];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
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
          <ListItem key={item.text} disablePadding>
            <ListItemButton component={RouterLink} to={item.path}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}