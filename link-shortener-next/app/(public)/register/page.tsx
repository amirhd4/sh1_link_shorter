import { Metadata } from "next";
import { RegisterWithOtpForm } from "@/components/auth/RegisterWithOtpForm";

export const metadata: Metadata = {
  title: "ثبت‌نام با شماره موبایل | نام برند شما",
  description:
    "ثبت‌نام سریع و امن با شماره موبایل. بدون نیاز به رمز عبور، با ارسال کد تایید وارد حساب کاربری خود شوید.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/register",
  },
  openGraph: {
    title: "ثبت‌نام با شماره موبایل | نام برند شما",
    description:
      "ثبت‌نام سریع و امن با شماره موبایل و کد تایید",
    url: "/register",
    type: "website",
  },
};

export default function RegisterOtpPage() {
  return <RegisterWithOtpForm />;
}
