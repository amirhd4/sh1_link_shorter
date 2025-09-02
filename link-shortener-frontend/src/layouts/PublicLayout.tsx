import { Outlet } from 'react-router-dom';
import { Container } from '@mui/material';

export function PublicLayout() {
  // این Layout ساده فقط محتوای صفحات عمومی را در مرکز نمایش می‌دهد
  return (
    <Container component="main" maxWidth="xs" sx={{ mt: 8 }}>
      <Outlet />
    </Container>
  );
}