"use client";

import { LoginForm } from "@/components/auth/LoginForm";
import { Helmet, HelmetProvider } from 'react-helmet-async';


export default function  LoginPage() {
  return (
    <>
      <Helmet>
        <title>ورود به حساب کاربری | لِس (l1s)</title>
        <meta name="description" content="وارد حساب کاربری خود شوید و لینک‌های کوتاه خود را مدیریت کنید." />
        <link rel="canonical" href="https://a.l1s.ir/login" />
      </Helmet>

      <LoginForm />
    </>
  );
}