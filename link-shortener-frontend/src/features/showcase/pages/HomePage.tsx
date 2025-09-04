import React from 'react';
import { Box, Typography, Button, Container, Grid, Paper, keyframes, GlobalStyles, SvgIcon, useTheme, useMediaQuery } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';

// --- Type Definitions for TypeScript ---
interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
}

// --- آیکون‌های سفارشی با استایل حرفه‌ای ---
const DashboardIcon = (props: React.ComponentProps<typeof SvgIcon>) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path d="M10 3H3V12H10V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 3H14V8H21V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 12H14V21H21V12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 16H3V21H10V16Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </SvgIcon>
);

const SecurityIcon = (props: React.ComponentProps<typeof SvgIcon>) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path d="M12 22S19 18 19 12V5L12 2L5 5V12C5 18 12 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </SvgIcon>
);

const PaymentIcon = (props: React.ComponentProps<typeof SvgIcon>) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 10H22" stroke="currentColor" strokeWidth="1.5"/>
  </SvgIcon>
);

const AdminIcon = (props: React.ComponentProps<typeof SvgIcon>) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 21L18 17C18 15.1438 16.2062 14.2238 14.4998 15.0015L12 16L9.50016 15.0015C7.7938 14.2238 6 15.1438 6 17L6 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </SvgIcon>
);


// --- انیمیشن‌ها و استایل‌های پس‌زمینه ---
const auroraAnimation = keyframes`
  0% { transform: translate(-50%, -50%) rotate(0deg) scale(1.5); }
  50% { transform: translate(-50%, -50%) rotate(180deg) scale(1.6); }
  100% { transform: translate(-50%, -50%) rotate(360deg) scale(1.5); }
`;

const pulseAnimation = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.7); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(168, 85, 247, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(168, 85, 247, 0); }
`;


// --- داده‌های صفحه ---
const featureList: Feature[] = [
  { icon: DashboardIcon, title: "داشبورد کاربری کامل", description: "مدیریت کامل لینک‌ها (ایجاد، ویرایش، حذف) به همراه مشاهده آمار دقیق بازدید." },
  { icon: SecurityIcon, title: "سیستم احراز هویت امن", description: "ثبت‌نام، ورود و مدیریت پروفایل کاربری و رمز عبور با بالاترین سطح امنیت." },
  { icon: PaymentIcon, title: "سیستم پلن و پرداخت", description: "مشاهده پلن‌های متنوع، اتصال امن به درگاه پرداخت و مدیریت اشتراک‌ها." },
  { icon: AdminIcon, title: "داشبورد ادمین قدرتمند", description: "مدیریت کاربران، نظارت بر تمام لینک‌ها و مشاهده آمار کلی سیستم." },
];

const techStack: string[] = ["FastAPI", "React.js", "PostgreSQL", "Redis", "Docker", "MUI", "TypeScript", "Framer Motion"];

// --- کامپوننت‌های کمکی ---
const Section: React.FC<{ children: React.ReactNode; sx?: object }> = ({ children, sx }) => {
  const ref = React.useRef(null);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <Box component="section" sx={{ py: { xs: 8, md: 12 }, ...sx }}>
        {children}
      </Box>
    </motion.div>
  );
};


// --- کامپوننت اصلی صفحه ---
export const HomePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <>
      <GlobalStyles styles={{
        body: {
          backgroundColor: '#020617', // رنگ پس‌زمینه بسیار تیره
          color: '#e2e8f0',
          overflowX: 'hidden',
        },
        '::selection': {
          background: '#a855f7',
          color: '#fff',
        },
        '*': {
          scrollbarWidth: 'thin',
          scrollbarColor: '#a855f7 #020617',
        },
        '*::-webkit-scrollbar': {
          width: '8px',
        },
        '*::-webkit-scrollbar-track': {
          background: '#0f172a',
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: '#a855f7',
          borderRadius: '10px',
          border: '2px solid #0f172a',
        },
      }} />
      <motion.div style={{ scaleX, position: 'fixed', top: 0, left: 0, right: 0, height: '5px', background: 'linear-gradient(90deg, #a855f7, #ec4899)', transformOrigin: '0%', zIndex: 1000 }} />
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>

        {/* افکت پس‌زمینه شفق قطبی (Aurora) */}
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '200%',
          height: '200%',
          backgroundImage: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, rgba(168, 85, 247, 0) 50%)',
          animation: `${auroraAnimation} 20s linear infinite`,
          zIndex: 0,
        }}/>

        <Container maxWidth={false} disableGutters sx={{ position: 'relative', zIndex: 1 }}>
          {/* بخش Hero */}
          <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            px: 3
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            >
              <Typography component="h1" sx={{
                fontSize: { xs: '3rem', sm: '4.5rem', md: '6rem' },
                fontWeight: 800,
                letterSpacing: '-2px',
                background: 'linear-gradient(90deg, #f0abfc, #d8b4fe, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.1,
                mb: 3
              }}>
                کوتاه‌کننده لینک نسل جدید
              </Typography>
              <Typography sx={{
                fontSize: { xs: '1.1rem', md: '1.4rem' },
                color: '#94a3b8',
                maxWidth: '800px',
                mx: 'auto',
                mb: 5,
              }}>
                طراحی شده بر اساس معماری جامع فنی و کسب درآمد برای بازار ایران. لینک‌های خود را کوتاه، مدیریت و تحلیل کنید.
              </Typography>
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                size="large"
                sx={{
                  borderRadius: '50px',
                  px: { xs: 4, md: 8 },
                  py: { xs: 1.5, md: 2 },
                  fontSize: { xs: '1rem', md: '1.2rem' },
                  fontWeight: 700,
                  color: 'white',
                  background: 'linear-gradient(45deg, #a855f7 30%, #d946ef 90%)',
                  boxShadow: '0 8px 30px rgba(168, 85, 247, 0.4)',
                  transition: 'all 0.3s ease',
                  animation: `${pulseAnimation} 2.5s infinite cubic-bezier(0.66, 0, 0, 1)`,
                  '&:hover': {
                    transform: 'translateY(-3px) scale(1.05)',
                    boxShadow: '0 12px 40px rgba(168, 85, 247, 0.5)',
                  }
                }}
              >
                شروع کنید
              </Button>
            </motion.div>
          </Box>

          {/* بخش ویژگی‌ها */}
          <Section sx={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(10px)'}}>
            <Container maxWidth="xl">
              <Box sx={{ textAlign: 'center', mb: 8 }}>
                 <Typography component="h2" sx={{ fontSize: { xs: '2.5rem', md: '3rem' }, fontWeight: 700, mb: 2, color: 'white' }}>
                  یک پلتفرم، تمام امکانات
                </Typography>
                <Typography sx={{ color: '#94a3b8', fontSize: '1.2rem' }}>
                  هر آنچه برای مدیریت حرفه‌ای لینک‌هایتان نیاز دارید.
                </Typography>
              </Box>
              <Grid container spacing={isMobile ? 3 : 4}>
                {featureList.map((feature, index) => (
                  // استفاده صحیح از گرید با props های واکنش‌گرا
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <motion.div
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.5 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      style={{height: '100%'}}
                    >
                      <Paper
                        elevation={0}
                        sx={{
                          p: {xs: 3, md: 4},
                          height: '100%',
                          backgroundColor: 'rgba(30, 41, 59, 0.5)',
                          border: '1px solid rgba(51, 65, 85, 0.7)',
                          borderRadius: '20px',
                          transition: 'all 0.3s ease-out',
                          position: 'relative',
                          overflow: 'hidden',
                          '&:before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background: 'radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgba(168, 85, 247, 0.15) 0%, transparent 40%)',
                            opacity: 0,
                            transition: 'opacity 0.3s ease',
                          },
                          '&:hover': {
                            transform: 'translateY(-10px)',
                            borderColor: 'rgba(168, 85, 247, 0.5)',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                            '&:before': { opacity: 1 },
                            '& .feature-icon': {
                                color: '#d8b4fe',
                                transform: 'scale(1.1)'
                            }
                          },
                        }}
                        onMouseMove={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                          e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
                        }}
                      >
                        <Box className="feature-icon" sx={{ mb: 2.5, color: '#a855f7', fontSize: '2.5rem', transition: 'all 0.3s ease' }}>
                          <feature.icon fontSize="inherit" />
                        </Box>
                        <Typography variant="h5" component="h3" sx={{ fontWeight: 600, mb: 1.5, color: 'white' }}>
                          {feature.title}
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#94a3b8' }}>
                          {feature.description}
                        </Typography>
                      </Paper>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </Container>
          </Section>

          {/* بخش پشته فناوری */}
          <Section>
            <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
               <Box sx={{ mb: 6 }}>
                 <Typography component="h2" sx={{ fontSize: { xs: '2.5rem', md: '3rem' }, fontWeight: 700, mb: 2, color: 'white' }}>
                  قدرت گرفته از بهترین‌ها
                </Typography>
                <Typography sx={{ color: '#94a3b8', maxWidth: '600px', mx: 'auto', fontSize: '1.2rem' }}>
                  ساخته شده با پشته فناوری مدرن بر اساس اصول معماری میکروسرویس تکاملی.
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: {xs: 1.5, md: 2.5}, flexWrap: 'wrap', justifyContent: 'center' }}>
                {techStack.map((tech, index) => (
                  <motion.div
                    key={tech}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  >
                    <Button
                      variant="outlined"
                      sx={{
                        color: '#cbd5e1',
                        borderColor: 'rgba(51, 65, 85, 0.7)',
                        borderRadius: '12px',
                        padding: '10px 24px',
                        fontSize: '1rem',
                        fontWeight: 500,
                        transition: 'all 0.3s ease',
                        backdropFilter: 'blur(5px)',
                        backgroundColor: 'rgba(30, 41, 59, 0.3)',
                        '&:hover': {
                          backgroundColor: 'rgba(168, 85, 247, 0.1)',
                          borderColor: '#a855f7',
                          color: '#fff',
                          transform: 'scale(1.05)',
                        }
                      }}
                    >
                      {tech}
                    </Button>
                  </motion.div>
                ))}
              </Box>
            </Container>
          </Section>

          {/* بخش فوتر */}
          <Box component="footer" sx={{
              borderTop: '1px solid rgba(51, 65, 85, 0.7)',
              py: 5,
              backgroundColor: 'rgba(2, 6, 23, 0.5)'
          }}>
              <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
                  <Typography sx={{ color: '#64748b' }}>
                     کلیه حقوق محفوظ است. ساخته شده با 💜 در ایران.
                  </Typography>
                  <Typography sx={{ color: '#ffffff' }}>
                     تبلیغات: 09396092135
                  </Typography>
              </Container>
          </Box>
        </Container>
      </Box>
    </>
  );
};
