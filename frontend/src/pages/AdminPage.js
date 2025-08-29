import React, { useEffect, useState } from 'react';
import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from '@mui/material';
import axios from 'axios'; // فرض می‌کنیم یک instance از axios برای API calls داریم

const api = axios.create({
    baseURL: 'http://localhost:8000',
});

export default function AdminPage() {
    const [users, setUsers] = useState([]);

    // این تابع باید توکن ادمین را از جایی (مثلا localStorage) بخواند
    const getAdminToken = () => localStorage.getItem('accessToken');

    const fetchUsers = async () => {
        // در یک اپ واقعی، یک endpoint برای گرفتن لیست کاربران لازم است
        // فعلا آن را شبیه‌سازی می‌کنیم
        // TODO: Add a GET /admin/users endpoint to the backend
        setUsers([
            { id: 1, email: 'user1@example.com', plan: { name: 'Free' } },
            { id: 2, email: 'user2@example.com', plan: { name: 'Free' } },
        ]);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAssignProPlan = async (userId) => {
        const token = getAdminToken();
        if (!token) {
            alert('Admin token not found!');
            return;
        }
        try {
            await api.post(
                `/admin/users/${userId}/assign-plan`,
                { plan_name: 'Pro' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(`Pro plan assigned to user ${userId} successfully!`);
            fetchUsers(); // Refresh the list
        } catch (error) {
            console.error('Failed to assign plan:', error);
            alert('Failed to assign plan.');
        }
    };

    return (
        <>
            <Typography variant="h4" gutterBottom>
                پنل مدیریت
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID کاربر</TableCell>
                            <TableCell>ایمیل</TableCell>
                            <TableCell>پلن فعلی</TableCell>
                            <TableCell>عملیات</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.id}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.plan?.name || 'N/A'}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="contained"
                                        onClick={() => handleAssignProPlan(user.id)}
                                        disabled={user.plan?.name === 'Pro'}
                                    >
                                        ارتقا به Pro
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
}