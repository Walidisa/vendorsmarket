import "./globals.css";
import "./styles/base.css";
import "./styles/components.css";
import "./styles/pages.css";
import "./styles/themes.css";
import { Inter } from "next/font/google";
import Footer from "./components/Footer";
import RouteLoader from "./components/RouteLoader";
import PwaProvider from "./components/PwaProvider";
import InstallPrompt from "./components/InstallPrompt";
import { Suspense } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata = {
  title: "VendorsMarket",
  description: "Vendors Market",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Vendors Market"
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: "/icons/apple-touch-icon.png"
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "contain",
  // theme color handled dynamically in PwaProvider
  themeColor: "transparent"
};

const inter = Inter({ subsets: ["latin"], display: "swap" });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" crossOrigin="use-credentials" />
      </head>
      <body className={`${inter.className} dark theme-clothing`} suppressHydrationWarning={true}>
        <PwaProvider />
        <InstallPrompt />
        <RouteLoader />
        <main>
          <Suspense fallback={null}>{children}</Suspense>
        </main>
        <Footer />
        <SpeedInsights />
      </body>
    </html>
  );
}
