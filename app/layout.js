import "./globals.css";
import "./styles/base.css";
import "./styles/components.css";
import "./styles/pages.css";
import "./styles/themes.css";
import Footer from "./components/Footer";
import RouteLoader from "./components/RouteLoader";
import { Suspense } from "react";

export const metadata = {
  title: "VendorsMarket",
  description: "Vendors Market"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <RouteLoader />
        <main>
          <Suspense fallback={null}>{children}</Suspense>
        </main>
        <Footer />
      </body>
    </html>
  );
}
