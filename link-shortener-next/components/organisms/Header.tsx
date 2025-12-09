"use client";

import { useState } from "react";
import {
  AppBar, Toolbar, IconButton, Typography, Box, Tooltip, Avatar, Menu,
  MenuItem, Divider, ListItemIcon, Chip, Badge, CircularProgress
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import Logout from "@mui/icons-material/Logout";
import AccountCircle from "@mui/icons-material/AccountCircle";
import NotificationsIcon from "@mui/icons-material/Notifications";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LinkIcon from "@mui/icons-material/Link";

import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { getDaysRemaining } from "@/utils/dateUtils";
import { useLinkQuota } from "@/hooks/useLinkQuota";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const { user, setUser } = useUserStore();

  const isClient = typeof window !== "undefined";
  const { data: quota, isLoading: isLoadingQuota } = useLinkQuota(
    isClient ? undefined : null
  );

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const daysRemaining = getDaysRemaining(user?.subscription_end_date);

  const handleMenu = (e: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);

  const handleClose = () => setAnchorEl(null);

  const handleProfile = () => {
    router.push("/profile");
    handleClose();
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
    router.push("/login");
    handleClose();
  };

  return (
    <AppBar position="fixed" sx={{ bgcolor: "#6b21a8" }}>
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 600 }}>
          داشبورد مدیریت لینک
        </Typography>

        {user && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Tooltip title="اعلان‌ها (به زودی)">
              <IconButton color="inherit">
                <Badge badgeContent={0} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="حساب کاربری">
              <IconButton onClick={handleMenu} sx={{ p: 0 }}>
                <Avatar sx={{ bgcolor: "#9333ea" }}>
                  {user.first_name
                    ? user.first_name.charAt(0)
                    : (user.email || user.phone_number || "")
                        .charAt(0)
                        .toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>

            <Menu
              sx={{ mt: "45px" }}
              anchorEl={anchorEl}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              open={open}
              onClose={handleClose}
            >
              <Box sx={{ px: 2, py: 1, minWidth: 220 }}>
                <Typography variant="subtitle1" noWrap>
                  {user.first_name || "کاربر"}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {user.email || user.phone_number}
                </Typography>
              </Box>

              <Divider />

              {user.plan && (
                <Box
                  sx={{
                    px: 2,
                    py: 1.5,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                  }}
                >
                  <Chip
                    icon={<WorkspacePremiumIcon fontSize="small" />}
                    label={`پلن: ${user.plan.name}`}
                    size="small"
                    variant="outlined"
                  />

                  {daysRemaining !== null && (
                    <Chip
                      icon={<CalendarTodayIcon fontSize="small" />}
                      label={`${daysRemaining.toLocaleString(
                        "fa-IR"
                      )} روز باقی‌مانده`}
                      color={daysRemaining < 10 ? "warning" : "success"}
                      size="small"
                      variant="outlined"
                    />
                  )}

                  {isLoadingQuota ? (
                    <CircularProgress size={20} />
                  ) : (
                    <Chip
                      icon={<LinkIcon fontSize="small" />}
                      label={`لینک‌های باقی‌مانده: ${
                        quota?.remaining ?? 0
                      } از ${
                        quota?.limit ?? user.plan.link_limit_per_month
                      }`}
                      size="small"
                      color={
                        (quota?.remaining ?? 0) === 0
                          ? "error"
                          : (quota?.remaining ?? 0) < 5
                          ? "warning"
                          : "success"
                      }
                      variant="outlined"
                    />
                  )}
                </Box>
              )}

              <Divider />

              <MenuItem onClick={handleProfile}>
                <ListItemIcon>
                  <AccountCircle fontSize="small" />
                </ListItemIcon>
                پروفایل من
              </MenuItem>

              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                خروج
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
