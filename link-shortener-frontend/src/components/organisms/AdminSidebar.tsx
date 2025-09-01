import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import { Link as RouterLink } from 'react-router-dom';

const drawerWidth = 240;

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
    { text: 'داشبورد ادمین', icon: <DashboardIcon />, path: '/admin/dashboard' },
    { text: 'مدیریت کاربران', icon: <PeopleIcon />, path: '/admin/users' },
];

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  return (
    <Drawer
      variant="temporary"
      open={isOpen}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
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