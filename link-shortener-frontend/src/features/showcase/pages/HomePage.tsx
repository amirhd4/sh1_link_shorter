import { Box, Typography, Button, Container, Paper, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export function HomePage() {
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 } }}>
        <Typography variant="h3" component="h1" gutterBottom textAlign="center">
          سرویس کوتاه کننده لینک
        </Typography>
        <Typography variant="h6" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
          [cite_start]طراحی شده بر اساس معماری جامع فنی و کسب درآمد برای بازار ایران [cite: 354]
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h5" component="h2" gutterBottom>ویژگی‌های کلیدی پیاده‌سازی شده:</Typography>
        <List>
          <ListItem>
            <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
            <ListItemText primary="داشبورد کاربری کامل" secondary="مدیریت کامل لینک‌ها (ایجاد، ویرایش، حذف، مشاهده آمار)" />
          </ListItem>
          <ListItem>
            <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
            <ListItemText primary="سیستم احراز هویت امن" secondary="ثبت‌نام، ورود و مدیریت پروفایل و رمز عبور" />
          </ListItem>
          <ListItem>
            <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
            [cite_start]<ListItemText primary="سیستم پلن و پرداخت" secondary="مشاهده پلن‌ها، اتصال به درگاه پرداخت و جلوگیری از خرید مجدد [cite: 850]" />
          </ListItem>
          <ListItem>
            <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
            <ListItemText primary="داشبورد ادمین قدرتمند" secondary="مدیریت کاربران، مدیریت تمام لینک‌ها و مشاهده آمار کلی سیستم" />
          </ListItem>
        </List>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h5" component="h2" gutterBottom>پشته فناوری (Technology Stack):</Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          [cite_start]این پروژه با استفاده از یک پشته فناوری مدرن و بر اساس اصول معماری میکروسرویس تکاملی و پایداری چندزبانه ساخته شده است[cite: 361, 660].
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
          <Button variant="outlined">FastAPI</Button>
          <Button variant="outlined">React.js</Button>
          <Button variant="outlined">PostgreSQL</Button>
          <Button variant="outlined">Redis</Button>
          <Button variant="outlined">Docker</Button>
          <Button variant="outlined">MUI</Button>
          <Button variant="outlined">TanStack Query</Button>
        </Box>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button component={RouterLink} to="/login" variant="contained" size="large">
            شروع کنید / ورود به داشبورد
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}