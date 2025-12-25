"use client";

import Link from "next/link";
import Script from "next/script";
import { useMemo } from "react";
import { useThemeIcons } from "../../lib/useThemeIcons";
import { getInitialPreferences, resolveIcon } from "../../lib/themeUtils";

const sections = [
  {
    title: "About VendorsMarket",
    body:
      "VendorsMarket is a marketplace connecting buyers with independent vendors. Vendors manage their own listings and transactions; we operate the platform."
  },
  {
    title: "Eligibility & Accounts",
    list: [
      "You must be 18+ and able to form a binding contract.",
      "Keep your login secure; you are responsible for activity on your account.",
      "Vendors must provide accurate profile and listing information and keep it updated."
    ]
  },
  {
    title: "Listings & Content",
    list: [
      "Vendors control their listings (pricing, availability, descriptions, images). Listings must be accurate and lawful.",
      "Categories may include clothing, phone/tech accessories, cars, real estate, and other goods/services permitted by law.",
      "You grant VendorsMarket a license to host and display your submitted content (text, images, feedback) on the platform."
    ]
  },
  {
    title: "Transactions & Fulfillment",
    list: [
      "Unless stated otherwise, VendorsMarket is not the seller or merchant of record; transactions are between buyer and vendor.",
      "Buyers and vendors are responsible for payments, delivery, returns, warranties, taxes, registrations, and permits applicable to their transaction.",
      "Vendors must comply with all legal requirements for their category (e.g., vehicles/real estate rules)."
    ]
  },
  {
    title: "Prohibited Uses",
    list: [
      "No illegal, fraudulent, or misleading listings.",
      "No sale of prohibited items or items you lack rights/permits to sell.",
      "Do not infringe others’ IP, privacy, or publicity rights.",
      "Do not abuse ratings/feedback, scrape the site, or attempt to bypass security."
    ]
  },
  {
    title: "Feedback and Messaging",
    list: [
      "Feedback and contact tools are for genuine product/vendor inquiries and reviews only.",
      "We may moderate or remove feedback that is abusive, off-topic, or clearly fraudulent."
    ]
  },
  {
    title: "Intellectual Property",
    body:
      "VendorsMarket owns the platform’s software, branding, and design. You retain rights to your content but license us to host, display, and adapt it for the service."
  },
  {
    title: "Disclaimers",
    list: [
      "The platform and listings are provided “as is.” We do not guarantee product quality, availability, accuracy of listings, delivery times, or outcomes.",
      "We are not liable for indirect, incidental, or consequential damages, or lost profits, arising from your use of the platform or transactions with vendors."
    ]
  },
  {
    title: "Indemnity",
    body:
      "You agree to indemnify and hold VendorsMarket harmless from claims arising out of your listings, transactions, or misuse of the platform."
  },
  {
    title: "Changes and Termination",
    list: [
      "We may update these terms or modify/terminate the service at any time; continued use means you accept the updated terms.",
      "We may suspend or terminate accounts that violate these terms."
    ]
  },
  {
    title: "Contact",
    body:
      "Questions? Use the in-app Contact & Feedback form or email support@vendorsmarket.ng."
  }
];

export default function TermsPage() {
  const { theme } = useThemeIcons("clothing");
  const initialPrefs = useMemo(
    () => (typeof window === "undefined" ? { theme: "clothing", isDark: true } : getInitialPreferences("clothing")),
    []
  );
  const backIconSrc = resolveIcon("back", theme || initialPrefs.theme, initialPrefs.isDark);

  return (
    <>
      <div className="page-transition">
        <div className="page">
          <header
            className="subcategory-page-header"
            style={{
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              paddingTop: 24,
              paddingBottom: 12,
              marginTop: 8
            }}
          >
            <button
              className="back-button"
              aria-label="Back"
              onClick={() => window.history.back()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                position: "absolute",
                left: 0,
                top: "50%",
                transform: "translateY(-50%)"
              }}
            >
              <img
                src={backIconSrc || (theme === "clothing" ? "/icons/back.png" : "/icons/back-orange.png")}
                alt="Back"
                className="back-icon"
                data-icon="back"
                data-blue="/icons/back.png"
                data-brown="/icons/back-orange.png"
              />
            </button>
            <h1 id="termsTitle" style={{ margin: 0, textAlign: "center" }}>Terms &amp; Conditions</h1>
          </header>

          <section className="landing-featured" style={{ marginBottom: 16 }}>
            <p style={{ marginTop: 0, marginBottom: 8, color: "var(--color-muted)" }}>
              Last updated: November 2025. Please read these terms carefully before using VendorsMarket.
            </p>
            <div className="vendor-slider" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {sections.map((section) => (
                <article
                  key={section.title}
                  className="vendor-card"
                  style={{ alignItems: "flex-start", textAlign: "left", gap: 6 }}
                >
                  <h3 className="vendor-name" style={{ margin: 0 }}>
                    {section.title}
                  </h3>
                  {section.body ? (
                    <p className="vendor-username" style={{ margin: 0 }}>
                      {section.body}
                    </p>
                  ) : null}
                  {Array.isArray(section.list) ? (
                    <ul style={{ paddingLeft: 18, margin: "4px 0 0", color: "var(--color-muted)", lineHeight: 1.5 }}>
                      {section.list.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              ))}
            </div>
          </section>

        </div>
      </div>
      <Script src="/scripts/main.js" strategy="afterInteractive" />
    </>
  );
}
