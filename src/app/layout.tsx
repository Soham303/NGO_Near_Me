import type { Metadata, Viewport } from "next";
import "./globals.css";
import { FoodRescueProvider } from "@/lib/store";
import { RoleSwitcherBanner } from "@/components/ui/RoleSwitcherBanner";
import { Navbar } from "@/components/layout/Navbar";
import { MobileTabBar } from "@/components/layout/MobileTabBar";

export const metadata: Metadata = {
  title: "FoodRescue | Surplus Food Redistribution Platform",
  description: "Connecting hotels, restaurants, and event venues with surplus cooked food to verified NGOs and community kitchens in real time.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#2E7D32",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col bg-neutral-bg text-neutral-text font-sans pb-16 md:pb-0">
        <FoodRescueProvider>
          <RoleSwitcherBanner />
          <Navbar />
          <main className="flex-1 w-full">{children}</main>
          <MobileTabBar />
        </FoodRescueProvider>
      </body>
    </html>
  );
}
