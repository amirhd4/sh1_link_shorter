import React from 'react';
import { Box, Typography, Button, Container, Grid, Paper, keyframes, GlobalStyles, SvgIcon, useTheme, useMediaQuery, IconButton, Tooltip } from '@mui/material';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import CheckIcon from '@mui/icons-material/Check';
import { Link as RouterLink } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

// --- Type Definitions for TypeScript ---
interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
}

// --- Custom icons ---
const DashboardIcon = (props: React.ComponentProps<typeof SvgIcon>) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path d="M10 3H3V12H10V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 3H14V8H21V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 12H14V21H21V12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 16H3V21H10V16Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </SvgIcon>
);

const ApiIcon = (props: React.ComponentProps<typeof SvgIcon>) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path d="M4 7H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 4V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 4V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="3" y="12" width="18" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/>
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

// --- Animations ---
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

// --- Data ---
const featureList: Feature[] = [
  { icon: DashboardIcon, title: 'داشبورد کاربری کامل', description: 'ایجاد، ویرایش، حذف لینک‌ و مشاهده آمار دقیق هر لینک با نمودار و صادرات CSV.' },
  { icon: ApiIcon, title: 'API عمومی برای توسعه‌دهندگان', description: 'ایجاد لینک به‌صورت برنامه‌نویسی (Api-Key) — مستندات کامل همراه مثال‌ها و SDK.' },
  { icon: SecurityIcon, title: 'سیستم احراز هویت امن', description: 'پشتیبانی JWT، OTP و بررسی CSRF/Turnstile برای فرم‌ها.' },
  { icon: PaymentIcon, title: 'پلن‌ها و پرداخت', description: 'مدیریت اشتراک، وب‌هوک پرداخت و تاریخچه تراکنش‌ها.' },
];

const techStack: string[] = ['FastAPI', 'React.js', 'PostgreSQL', 'Redis', 'Docker', 'MUI', 'TypeScript', 'Framer Motion'];

// --- Section helper ---
const Section: React.FC<{ children: React.ReactNode; sx?: object }> = ({ children, sx }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <Box component="section" sx={{ py: { xs: 6, md: 10 }, ...sx }}>
        {children}
      </Box>
    </motion.div>
  );
};

// --- Helper: copy to clipboard ---
async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    return false;
  }
}

// --- Main component ---
export const HomePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // copy state for sample commands
  const [copiedCmd, setCopiedCmd] = React.useState(false);
  const curlExample = `curl -X POST \"https://l1s.ir/api/v1/shorten\" -H \"Api-Key: sk_your_api_key_here\" -H \"Content-Type: application/json\" -d '{\"long_url\":\"https://example.com\"}'`;
  const fetchExample = `fetch('https://l1s.ir/api/v1/shorten', {\n  method: 'POST',\n  headers: { 'Api-Key': 'sk_your_api_key_here', 'Content-Type': 'application/json' },\n  body: JSON.stringify({ long_url: 'https://example.com' })\n})`;

  return (
    <>
      <Helmet>
        <title>کوتاه‌کننده لینک L1s | API برای توسعه‌دهندگان، سریع و امن</title>
        <meta name="description" content="L1s سرویس کوتاه‌کننده لینک با API عمومی برای توسعه‌دهندگان، داشبورد، آمار و پلن‌های اشتراکی. مناسب کسب‌وکارها و تیم‌ها." />
        <link rel="canonical" href="https://l1s.ir/" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="کوتاه‌کننده لینک L1s | API برای توسعه‌دهندگان" />
        <meta property="og:description" content="ایجاد لینک کوتاه از طریق API یا پنل کاربری، مشاهده آمار و مدیریت پلن‌ها." />
        <meta property="og:url" content="https://l1s.ir/" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="کوتاه‌کننده لینک L1s" />
        <meta name="twitter:description" content="API و داشبورد برای مدیریت لینک‌ها و ردیابی آمار." />

        {/* SEO helpers: preconnect/prefetch */}
        <link rel="preconnect" href="https://l1s.ir" />
        <link rel="preconnect" href="https://api.l1s.ir" />
        <link rel="dns-prefetch" href="https://l1s.ir" />

        {/* Structured data JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            'name': 'L1s Link Shortener',
            'url': 'https://l1s.ir/',
            'description': 'سرویس کوتاه‌کننده لینک با API برای توسعه‌دهندگان، داشبورد و سیستم پلن.',
            'applicationCategory': 'Web Application',
            'operatingSystem': 'All',
            'publisher': {
              '@type': 'Organization',
              'name': 'L1s',
              'url': 'https://l1s.ir/'
            }
          })}
        </script>

        {/* Robots: allow indexing but set reasonable crawl-delay via robots.txt on the server side */}
        <meta name="robots" content="index, follow" />
      </Helmet>

      <GlobalStyles styles={{
        body: { backgroundColor: '#020617', color: '#e2e8f0', overflowX: 'hidden' },
        '::selection': { background: '#a855f7', color: '#fff' },
      }} />

      <motion.div style={{ scaleX, position: 'fixed', top: 0, left: 0, right: 0, height: '5px', background: 'linear-gradient(90deg, #a855f7, #ec4899)', transformOrigin: '0%', zIndex: 1400 }} />

      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', width: '200%', height: '200%', backgroundImage: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, rgba(168,85,247,0) 50%)', animation: `${auroraAnimation} 24s linear infinite`, zIndex: 0 }} />

        <Container maxWidth={false} disableGutters sx={{ position: 'relative', zIndex: 1 }}>
          {/* Hero */}
          <Box sx={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', px: 3 }}> 
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9 }}>
              <Typography component="h1" sx={{ fontSize: { xs: '2.6rem', sm: '3.6rem', md: '4.8rem' }, fontWeight: 800, letterSpacing: '-1px', background: 'linear-gradient(90deg, #f0abfc, #d8b4fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.05, mb: 2 }}>
                کوتاه‌کننده لینک نسل جدید — L1s
              </Typography>

              <Typography sx={{ fontSize: { xs: '1rem', md: '1.2rem' }, color: '#94a3b8', maxWidth: '760px', mx: 'auto', mb: 4 }}>
                سریع، امن و قابل برنامه‌نویسی — API اختصاصی برای توسعه‌دهندگان، داشبورد مدیریتی و آمار کامل بازدیدها.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button component={RouterLink} to="/register" variant="contained" size="large" sx={{ borderRadius: '50px', px: 5, py: 1.5, fontWeight: 700, color: 'white', background: 'linear-gradient(45deg, #a855f7 30%, #d946ef 90%)', boxShadow: '0 12px 30px rgba(168,85,247,0.35)' }}>
                  ثبت‌نام رایگان
                </Button>
                <Button component={RouterLink} to="/pages/docs" variant="outlined" size="large" sx={{ borderRadius: '50px', px: 4, py: 1.4, color: '#cbd5e1', borderColor: 'rgba(255,255,255,0.06)' }}>
                  مستندات API
                </Button>
              </Box>
            </motion.div>
          </Box>

          {/* Features */}
          <Section sx={{ backgroundColor: 'rgba(6, 8, 15, 0.45)', backdropFilter: 'blur(6px)' }}>
            <Container maxWidth="xl">
              <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography component="h2" sx={{ fontSize: { xs: '1.9rem', md: '2.6rem' }, fontWeight: 700, mb: 1 }}>یک پلتفرم، تمام امکانات</Typography>
                <Typography sx={{ color: '#94a3b8' }}>هر آنچه برای مدیریت حرفه‌ای لینک‌ها و یک API کامل برای توسعه‌دهندگان نیاز دارید.</Typography>
              </Box>

              <Grid container spacing={isMobile ? 2 : 4}>
                {featureList.map((feature, idx) => (
                  <Grid size={{xs:12, sm: 6, md: 3}} key={feature.title}>
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: idx * 0.08 }}>
                      <Paper elevation={0} sx={{ p: 3, height: '100%', borderRadius: 3, backgroundColor: 'rgba(21, 24, 32, 0.5)', border: '1px solid rgba(255,255,255,0.03)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                          <Box sx={{ color: '#a855f7', fontSize: 28 }}><feature.icon /></Box>
                          <Typography sx={{ fontWeight: 700 }}>{feature.title}</Typography>
                        </Box>
                        <Typography sx={{ color: '#94a3b8' }}>{feature.description}</Typography>
                      </Paper>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </Container>
          </Section>

          {/* API Showcase */}
          <Section>
            <Container maxWidth="lg">
              <Grid container spacing={4} alignItems="center">
                  <Grid size={{xs:12, md: 6}}>
                  <Box sx={{ mb: 2 }}>
                    <Typography component="h3" sx={{ fontSize: '1.8rem', fontWeight: 800, mb: 1 }}>API برای توسعه‌دهندگان</Typography>
                    <Typography sx={{ color: '#94a3b8', mb: 2 }}>با استفاده از Api-Key می‌توانید مستقیماً از برنامه یا سرور خود لینک کوتاه بسازید. پشتیبانی از Rate-limit، گزارش خطا و پاسخ JSON استاندارد.</Typography>

                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                      <Button size="small" variant="contained" startIcon={<ApiIcon />} sx={{ borderRadius: 2 }}>v1 — REST</Button>
                      <Button size="small" variant="outlined" sx={{ borderRadius: 2, color: '#cbd5e1' }}>Api-Key header</Button>
                    </Box>

                    <Typography sx={{ color: '#cbd5e1', mt: 2, mb: 1, fontWeight: 600 }}>نمونهٔ درخواست (curl)</Typography>

                    <Paper elevation={0} sx={{ p: 2, backgroundColor: 'rgba(7,10,14,0.6)', borderRadius: 2, position: 'relative' }}>
                      <Box component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace', fontSize: 13, color: '#e6eef8', m: 0 }}>
{`curl -X POST "https://l1s.ir/api/v1/shorten" \
  -H "Api-Key: sk_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{"long_url":"https://example.com"}'`}
                      </Box>
                      <Tooltip title={copiedCmd ? 'Copied' : 'Copy'}>
                        <IconButton onClick={async () => { const ok = await copyToClipboard(curlExample); setCopiedCmd(ok); setTimeout(() => setCopiedCmd(false), 1800); }} sx={{ position: 'absolute', top: 8, right: 8, color: copiedCmd ? '#22c55e' : '#cbd5e1' }}>
                          {copiedCmd ? <CheckIcon fontSize="small" /> : <ContentCopyOutlinedIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </Paper>

                    <Typography sx={{ color: '#cbd5e1', mt: 2 }}>پاسخ موفق:</Typography>
                    <Paper elevation={0} sx={{ p: 2, mt: 1, backgroundColor: 'rgba(7,10,14,0.45)', borderRadius: 2 }}>
                      <Box component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace', fontSize: 13, color: '#e6eef8', m: 0 }}>
{`{
  "long_url": "https://example.com",
  "short_url": "https://l1s.ir/Ab12Xy"
}`}
                      </Box>
                    </Paper>

                    <Typography sx={{ color: '#94a3b8', mt: 2 }}>نکات امنیتی: Api-Key را در سمت سرور نگهداری کنید (never expose in client JS). محدودیت درخواست به ازای هر کلید اعمال می‌شود.</Typography>

                  </Box>
                </Grid>

                <Grid size={{xs:12, md: 6}}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 3, background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <Typography sx={{ fontWeight: 700, mb: 1 }}>مستندات خلاصهٔ Endpoints</Typography>
                    <Box component="ul" sx={{ pl: 3, color: '#cbd5e1' }}>
                      <li><strong>POST /api/v1/shorten</strong> — کوتاه‌سازی URL (هدر Api-Key)</li>
                      <li><strong>GET /api/v1/links/:code</strong> — جزئیات لینک و آمار</li>
                      <li><strong>POST /api/v1/auth/api-key</strong> — تولید/ری‌جنریت Api-Key امن (نیاز به لاگین)</li>
                    </Box>

                    <Typography sx={{ mt: 2, fontWeight: 700 }}>بهبود SEO در این صفحه</Typography>
                    <Box sx={{ color: '#94a3b8', mt: 1 }}>
                      <Typography component="div">• JSON-LD برای نرم‌افزار و سازمان — برای rich results.</Typography>
                      <Typography component="div">• Open Graph و Twitter Card — برای اشتراک بهتر در شبکه‌های اجتماعی.</Typography>
                      <Typography component="div">• preconnect/dns-prefetch و canonical — بهبود سرعت و جلوگیری از محتوای تکراری.</Typography>
                      <Typography component="div">• Server-side rendering (یا prerender) برای صفحات عمومی و docs برای SEO قوی‌تر.</Typography>
                    </Box>

                  </Paper>
                </Grid>
              </Grid>
            </Container>
          </Section>

          {/* Tech stack */}
          <Section sx={{ backgroundColor: 'rgba(6, 8, 15, 0.35)' }}>
            <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
              <Typography component="h3" sx={{ fontSize: '1.8rem', fontWeight: 800, mb: 2 }}>تکنولوژی‌ها</Typography>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                {techStack.map(t => (
                  <Paper key={t} elevation={0} sx={{ px: 2, py: 1, borderRadius: 2, border: '1px solid rgba(255,255,255,0.03)', color: '#cbd5e1' }}>{t}</Paper>
                ))}
              </Box>
            </Container>
          </Section>

          {/* CTA */}
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography sx={{ fontSize: '1.4rem', fontWeight: 700, mb: 1 }}>آماده‌اید شروع کنید؟</Typography>
            <Typography sx={{ color: '#94a3b8', mb: 2 }}>اکنون ثبت‌نام کنید و Api-Key خود را تولید کنید — یکپارچه با اپ یا سرور شما.</Typography>
            <Button component={RouterLink} to="/register" size="large" variant="contained" sx={{ borderRadius: 3, px: 5, background: 'linear-gradient(90deg,#a855f7,#d946ef)', color: '#fff' }}>ثبت‌نام و دریافت Api-Key</Button>
          </Box>

        </Container>
      </Box>
    </>
  );
};

export default HomePage;
