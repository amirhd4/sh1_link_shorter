import { Helmet } from "react-helmet-async";
import { LoginForm } from "../components/LoginForm";


export function LoginPage() {
  return (
    <>
      <Helmet>
        <title>ورود به حساب کاربری | L1s</title>
        <meta name="description" content="وارد حساب کاربری خود شوید و لینک‌های کوتاه خود را مدیریت کنید." />
        <link rel="canonical" href="https://l1s.ir/login" />
      </Helmet>

      <LoginForm />
    </>
  );
}