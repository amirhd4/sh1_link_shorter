import { LoginForm } from "../features/auth/components/LoginForm.tsx";
import { Helmet, HelmetProvider } from 'react-helmet-async';


export function LoginPage() {
  return (
    <>
      <Helmet>
        <title>ورود به حساب کاربری | لِس(l1s)</title>
        <meta name="description" content="وارد حساب کاربری خود شوید و لینک‌های کوتاه خود را مدیریت کنید." />
        <link rel="canonical" href="https://l1s.ir/pages/login" />
      </Helmet>

      <LoginForm />
    </>
  );
}