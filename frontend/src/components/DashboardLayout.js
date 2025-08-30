import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import {
    Box, Drawer, AppBar, Toolbar, Typography, List, ListItem, ListItemButton,
    ListItemIcon, ListItemText, CssBaseline, IconButton, Avatar, Menu, MenuItem, Divider
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LinkIcon from '@mui/icons-material/Link';
import AnalyticsIcon from '@mui/icons-material/Analytics'; // <--- خطای شما: این import جا افتاده بود
import SettingsIcon from '@mui/icons-material/Settings';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const drawerWidth = 240;

const navItems = [
    { text: 'داشبورد', icon: <DashboardIcon />, path: '/' },
    { text: 'لینک‌های من', icon: <LinkIcon />, path: '/my-links' }, // در آینده ساخته می‌شود
    { text: 'تحلیل‌ها', icon: <AnalyticsIcon />, path: '/analytics' }, // در آینده ساخته می‌شود
    { text: 'قیمت‌گذاری', icon: <MonetizationOnIcon />, path: '/pricing' },
];

const adminNavItems = [
    { text: 'مدیریت کاربران', icon: <AdminPanelSettingsIcon />, path: '/admin' },
];

export default function DashboardLayout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenu = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleLogout = () => {
        handleClose();
        logout();
        navigate('/login');
    };

    const handleProfile = () => {
        handleClose();
        navigate('/profile');
    };

    const drawerContent = (
        <div>
            <Toolbar />
            <Box sx={{ overflow: 'auto' }}>
                <List>
                    {navItems.map((item) => (
                        <ListItem key={item.text} disablePadding>
                            <ListItemButton
                                component={RouterLink}
                                to={item.path}
                                selected={location.pathname === item.path}
                            >
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
                <Divider />
                {user?.role === 'admin' && (
                     <List>
                        <Typography sx={{ px: 2, py: 1, color: 'text.secondary', fontSize: '0.875rem' }}>پنل ادمین</Typography>
                        {adminNavItems.map((item) => (
                            <ListItem key={item.text} disablePadding>
                                <ListItemButton
                                    component={RouterLink}
                                    to={item.path}
                                    selected={location.pathname === item.path}
                                >
                                    <ListItemIcon>{item.icon}</ListItemIcon>
                                    <ListItemText primary={item.text} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                )}
            </Box>
        </div>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        پلتفرم مدیریت لینک
                    </Typography>
                    {user && (
                        <div>
                            <IconButton onClick={handleMenu} sx={{ p: 0 }}>
                                <Avatar alt={user.email} sx={{ bgcolor: 'secondary.main' }}>
                                    {user.email.charAt(0).toUpperCase()}
                                </Avatar>
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                keepMounted
                                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                            >
                                <MenuItem disabled>{user.email}</MenuItem>
                                <Divider />
                                <MenuItem onClick={handleProfile}>
                                    <ListItemIcon><AccountCircleIcon fontSize="small" /></ListItemIcon>
                                    پروفایل
                                </MenuItem>
                                <MenuItem onClick={handleLogout}>خروج</MenuItem>
                            </Menu>
                        </div>
                    )}
                </Toolbar>
            </AppBar>
            <Drawer variant="permanent" sx={{ width: drawerWidth, flexShrink: 0, [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' } }}>
                {drawerContent}
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
}