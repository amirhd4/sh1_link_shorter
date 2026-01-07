'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@mui/material";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "16px",
        textAlign: "center",
      }}
    >
      <h1>خطایی رخ داده 😕</h1>
      <p>مشکلی در پردازش درخواست به وجود آمده</p>

      <div style={{ display: "flex", gap: "8px" }}>
        <Button variant="contained" onClick={() => reset()}>
          تلاش مجدد
        </Button>

        <Button
          variant="outlined"
          onClick={() => router.push("/")}
        >
          بازگشت به خانه
        </Button>
      </div>
    </div>
  );
}
