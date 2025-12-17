"use client";

import { RegisterForm } from "@/components/auth/RegisterForm";
import { Helmet, HelmetProvider } from 'react-helmet-async';


export default function RegisterPage() {
  return (
  <>
      <Helmet>
        <title>ثبت‌نام در لِس (l1s)</title>
        <meta
          name="description"
          content="اکانت رایگان خود را بسازید و لینک‌هایتان را کوتاه و مدیریت کنید."
        />
        <link rel="canonical" href="https://a.l1s.ir/register" />
      </Helmet>
  <RegisterForm />
    </>
  );

}
