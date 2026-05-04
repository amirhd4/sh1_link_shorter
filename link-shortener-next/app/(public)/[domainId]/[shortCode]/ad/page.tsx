import type { Metadata } from "next";
import { adServiceServer } from "@/services/adService.server";
import AdRedirectClient from "./AdRedirectClient";

type Props = { params: { domainId: string; shortCode: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shortCode } = await params;
  const ad = await adServiceServer.getActiveAd(shortCode);


  if (!ad) {
    return {
      title: "تبلیغ",
      description: "در حال مشاهده تبلیغ",
    };
  }

  return {
    title: `تبلیغ: ${ad.title}`,
    description: `در حال مشاهده تبلیغ برای ${ad.title}.`,
    openGraph: {
      title: ad.title,
      description: `مشاهده تبلیغ ${ad.title}`,
    },
  };
}

export default async function Page({ params }: Props) {
  const { shortCode } = await params;
  const ad = await adServiceServer.getActiveAd(shortCode);

  return <AdRedirectClient ad={ad} />;
}