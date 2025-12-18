import { cookies } from "next/headers";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

export const adServiceServer = {
  async getActiveAd(shortCode: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    const res = await fetch(
      `${BASE_URL}/ads/active?link_code=${shortCode}`,
      {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        cache: "no-store", // مهم برای تبلیغ
      }
    );

    if (!res.ok) return null;
    return res.json();
  },
};
