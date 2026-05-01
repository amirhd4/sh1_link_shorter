import { ReactNode } from "react";

// ایمپورت تمام آیکن‌ها
import InstagramIcon from "@mui/icons-material/Instagram";
import TelegramIcon from "@mui/icons-material/Telegram";
import TwitterIcon from "@mui/icons-material/Twitter";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LinkIcon from "@mui/icons-material/Link";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import YouTubeIcon from "@mui/icons-material/YouTube";
import FacebookIcon from "@mui/icons-material/Facebook";
import TikTokIcon from "@mui/icons-material/MusicNote";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import Note from "@mui/icons-material/Notes";
import Description from "@mui/icons-material/Description";
import Payments from "@mui/icons-material/Payments";
import CreditCard from "@mui/icons-material/CreditCard";
import Download from "@mui/icons-material/Download";
import Person from "@mui/icons-material/Person";


export type IconOption = {
  name: string;
  component: ReactNode;
  value: string;
};

export const iconOptions: IconOption[] = [
  { name: "Website", component: <LinkIcon />, value: "website" },

  { name: "Instagram", component: <InstagramIcon />, value: "instagram" },
  { name: "Telegram", component: <TelegramIcon />, value: "telegram" },
  { name: "Twitter", component: <TwitterIcon />, value: "twitter" },
  { name: "YouTube", component: <YouTubeIcon />, value: "youtube" },
  { name: "WhatsApp", component: <WhatsAppIcon />, value: "whatsapp" },
  { name: "GitHub", component: <GitHubIcon />, value: "github" },
  { name: "LinkedIn", component: <LinkedInIcon />, value: "linkedin" },
  { name: "Facebook", component: <FacebookIcon />, value: "facebook" },
  { name: "TikTok", component: <TikTokIcon />, value: "tiktok" },

  { name: "Copy", component: <ContentCopyIcon />, value: "copy" },
  { name: "Phone", component: <PhoneIcon />, value: "phone" },
  { name: "Email", component: <EmailIcon />, value: "email" },
  { name: "Location", component: <LocationOnIcon />, value: "location" },

  { name: "Text", component: <Note />, value: "text" },
  { name: "Description", component: <Description />, value: "description" },

  { name: "Wallet", component: <AccountBalanceWalletIcon />, value: "wallet" },
  { name: "Payment", component: <Payments />, value: "payment" },
  { name: "Credit Card", component: <CreditCard />, value: "credit_card" },

  { name: "Download", component: <Download />, value: "download" },
  { name: "Profile", component: <Person />, value: "person" },
];

export const iconMap = Object.fromEntries(
  iconOptions.map((i) => [i.value, i.component])
);