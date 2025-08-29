import React from 'react';
import { Box, Drawer, AppBar, Toolbar, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, CssBaseline } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LinkIcon from '@mui/icons-material/Link';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SettingsIcon from '@mui/icons-material/Settings';

const drawerWidth = 240;

const navItems = [
    { text: 'داشبورد', icon: <DashboardIcon /> },
    { text: 'لینک‌ها', icon: <LinkIcon /> },
    { text: 'تحلیل‌ها', icon: <AnalyticsIcon /> },
    { text: 'تنظیمات', icon: <SettingsIcon /> },
];

export default function DashboardLayout({ children }) {
    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <Typography variant="h6" noWrap component="div">
                        پلتفرم مدیریت لینک
                    </Typography>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto' }}>
                    <List>
                        {navItems.map((item) => (
                            <ListItem key={item.text} disablePadding>
                                <ListItemButton>
                                    <ListItemIcon>{item.icon}</ListItemIcon>
                                    <ListItemText primary={item.text} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
}