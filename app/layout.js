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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vendorsmarket.com.ng";
const defaultTitle = "Vendors Market | Local vendors, great products";
const defaultDescription = "Discover local vendors, browse products, and connect directly on Vendors Market.";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: defaultTitle,
    template: "%s | Vendors Market"
  },
  description: defaultDescription,
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: SITE_URL
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Vendors Market",
    title: defaultTitle,
    description: defaultDescription,
    images: [
      {
        url: `${SITE_URL}/icons/app-icon.png`,
        width: 512,
        height: 512,
        alt: "Vendors Market"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    site: "@vendorsmarket",
    title: defaultTitle,
    description: defaultDescription,
    images: [`${SITE_URL}/icons/app-icon.png`]
  },
  robots: {
    index: true,
    follow: true
  },
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
        {process.env.NEXT_PUBLIC_GSC_VERIFICATION ? (
      <meta name="google-site-verification" content={process.env.NEXT_PUBLIC_GSC_VERIFICATION} />
        ) : null}
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
