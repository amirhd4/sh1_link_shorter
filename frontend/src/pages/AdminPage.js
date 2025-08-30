import React, { useState, useEffect, useCallback } from 'react';
import {
    Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, Box, CircularProgress, Alert, Chip,
    Tooltip, IconButton, Menu, MenuItem
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import api from '../api';
import CreateUserModal from '../components/admin/CreateUserModal';

export default function AdminPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);

    // State for action menu
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data);
        } catch (err) {
            setError('Failed to fetch users. You might not have admin privileges or the server is down.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleMenuClick = (event, user) => {
        setAnchorEl(event.currentTarget);
        setSelectedUser(user);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedUser(null);
    };

    const handleAssignPlan = async (planName) => {
        if (!selectedUser) return;
        try {
            await api.post(`/admin/users/${selectedUser.id}/assign-plan`, { plan_name: planName });
            alert(`${planName} plan assigned to ${selectedUser.email}`);
            fetchUsers();
        } catch (err) { alert('Failed to assign plan.'); }
        handleMenuClose();
    };

    const handleToggleAdmin = async () => {
        if (!selectedUser) return;
        const newRole = selectedUser.role === 'admin' ? 'user' : 'admin';
        try {
            await api.patch(`/admin/users/${selectedUser.id}/role`, { role: newRole });
            alert(`User role updated to ${newRole}`);
            fetchUsers();
        } catch (err) { alert('Failed to update role.'); }
        handleMenuClose();
    };

    const handleDeleteUser = async () => {
        if (!selectedUser || !window.confirm(`Are you sure you want to delete user ${selectedUser.email}? THIS CANNOT BE UNDONE.`)) {
            handleMenuClose();
            return;
        }
        try {
            await api.delete(`/admin/users/${selectedUser.id}`);
            alert(`User ${selectedUser.email} has been deleted.`);
            fetchUsers();
        } catch (err) { alert('Failed to delete user.'); }
        handleMenuClose();
    };

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" gutterBottom>User Management</Typography>
                <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={() => setCreateModalOpen(true)}>
                    Create User
                </Button>
            </Box>

            {/* ... (بخش نمایش خطا و لودینگ) ... */}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ backgroundColor: 'grey.100' }}>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Plan</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id} hover>
                                <TableCell>{user.id}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell><Chip label={user.role} color={user.role === 'admin' ? 'secondary' : 'default'} size="small" /></TableCell>
                                <TableCell>{user.plan?.name || 'N/A'}</TableCell>
                                <TableCell align="center">
                                    <IconButton onClick={(e) => handleMenuClick(e, user)}>
                                        <MoreVertIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* منوی عملیات برای هر کاربر */}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={() => handleAssignPlan('Pro')}>Assign Pro Plan</MenuItem>
                <MenuItem onClick={() => handleAssignPlan('Free')}>Assign Free Plan</MenuItem>
                <MenuItem onClick={handleToggleAdmin}>
                    {selectedUser?.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                </MenuItem>
                <MenuItem onClick={handleDeleteUser} sx={{ color: 'error.main' }}>Delete User</MenuItem>
            </Menu>

            <CreateUserModal open={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} onSuccess={fetchUsers} />
        </>
    );
}