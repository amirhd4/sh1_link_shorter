import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  direction: 'rtl',

  typography: {
    fontFamily: 'Vazirmatn, Arial, sans-serif',
  },

  components: {
    // 3. تزریق قانون @font-face برای بارگذاری فونت‌های محلی [cite: 214, 226]
    MuiCssBaseline: {
      styleOverrides: `
        @font-face {
          font-family: 'Vazirmatn';
          font-style: normal;
          font-display: swap;
          font-weight: 400;
          src: url('/fonts/Vazirmatn-Regular.woff2') format('woff2');
        }
        @font-face {
          font-family: 'Vazirmatn';
          font-style: normal;
          font-display: swap;
          font-weight: 700;
          src: url('/fonts/Vazirmatn-Bold.woff2') format('woff2');
        }
      `,
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
  },
});

export default theme;