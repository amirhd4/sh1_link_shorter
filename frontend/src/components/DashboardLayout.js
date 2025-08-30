import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    Typography,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    CssBaseline,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Divider
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LinkIcon from '@mui/icons-material/Link';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LiveClock from './LiveClock';

const drawerWidth = 240;

const navItems = [
    { text: 'داشبورد', icon: <DashboardIcon />, path: '/' },
    { text: 'لینک\u200cهای من', icon: <LinkIcon />, path: '/my-links' },
    { text: 'تحلیل\u200cها', icon: <AnalyticsIcon />, path: '/analytics' },
    { text: 'قیمت\u200cگذاری', icon: <MonetizationOnIcon />, path: '/pricing' },
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

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    // ✨ FIX: The AppBar's width is calculated to NOT cover the Drawer
                    width: `calc(100% - ${drawerWidth}px)`,
                    // ✨ FIX: A margin-right is added to push the AppBar away from the right edge
                    mr: `${drawerWidth}px`,
                }}
            >
                <Toolbar>
                    <Typography variant="h6" noWrap component="div">
                        پلتفرم مدیریت لینک
                    </Typography>
                    <Box sx={{ flexGrow: 1, px: 2 }}>
                       <LiveClock />
                    </Box>
                    {user && (
                        <div>
                            <IconButton onClick={handleMenu} sx={{ p: 0 }}>
                                <Avatar alt={user.email} sx={{ bgcolor: 'secondary.main' }}>
                                    {user.email.charAt(0).toUpperCase()}
                                </Avatar>
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                                keepMounted
                                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
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

            <Drawer
                variant="permanent"
                anchor="right" // ✨ FIX: Ensures the Drawer is on the right for RTL
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                    },
                }}
            >
                <Toolbar /> {/* Spacer to push content below AppBar */}
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
                            <Typography sx={{ px: 2, py: 1, color: 'text.secondary', fontSize: '0.875rem' }}>
                                پنل ادمین
                            </Typography>
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
            </Drawer>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    bgcolor: 'background.default'
                }}
            >
                <Toolbar /> {/* Spacer to push main content below AppBar */}
                {children}
            </Box>
        </Box>
    );
}