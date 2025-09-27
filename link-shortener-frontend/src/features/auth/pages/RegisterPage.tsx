import { RegisterForm } from "../components/RegisterForm";
import { Helmet } from "react-helmet-async";


export function RegisterPage() {
  return (
  <>
      <Helmet>
        <title>ثبت‌نام در L1s</title>
        <meta
          name="description"
          content="اکانت رایگان خود را بسازید و لینک‌هایتان را کوتاه و مدیریت کنید."
        />
        <link rel="canonical" href="https://l1s.ir/pages/register" />
      </Helmet>
  <RegisterForm />;
    </>
  );

}
