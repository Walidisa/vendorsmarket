"use client";

import Link from "next/link";
import Script from "next/script";
import { useThemeIcons } from "../../lib/useThemeIcons";

const sections = [
  {
    title: "Who we are",
    body:
      "VendorsMarket connects buyers with independent vendors. Vendors manage their own listings; we operate the platform experience."
  },
  {
    title: "What we collect",
    list: [
      "Account & profile: name, email, username, password, contact details (e.g., WhatsApp), state, town/LGA, shop name, profile and banner images.",
      "Listings: product/service info (descriptions, prices, images, categories like clothing, tech accessories, cars, real estate, etc.).",
      "Feedback & messages: ratings, comments, and messages sent through Contact & Feedback or to vendors.",
      "Usage data: device/browser info, IP, pages viewed, searches and clicks to keep the site running and improve it.",
      "Optional socials: Instagram handle and WhatsApp for buyer–vendor contact."
    ]
  },
  {
    title: "How we use it",
    list: [
      "Provide and improve the platform (accounts, profiles, listings, search, discovery).",
      "Facilitate buyer–vendor contact and show vendor details you choose to publish.",
      "Secure the platform (fraud/spam prevention, abuse monitoring).",
      "Communicate with you (service notices, support).",
      "Enforce our Terms and meet legal obligations."
    ]
  },
  {
    title: "How we share",
    list: [
      "With vendors/buyers: vendor profiles, listings, and contact info you publish; messages you send to a vendor are shared with that vendor.",
      "Service providers: hosting, storage, analytics, and support tools under confidentiality.",
      "Legal/safety: if required by law or to protect rights, safety, or prevent fraud.",
      "Business transfers: as part of a merger, acquisition, or asset sale."
    ]
  },
  {
    title: "Cookies",
    body:
      "We may use cookies or similar tech to keep you logged in, remember preferences, and understand usage. You can manage cookies in your browser; some features may not work without them."
  },
  {
    title: "Data retention",
    body:
      "We keep data as long as needed to operate the service, comply with legal duties, resolve disputes, and enforce agreements. You can request deletion; some data may be retained for legal/security reasons."
  },
  {
    title: "Your choices",
    list: [
      "Access/update your profile (including username/contact details).",
      "Edit or remove listings and uploaded media.",
      "Request account deletion.",
      "Opt out of non-essential emails/notifications (where applicable)."
    ]
  },
  {
    title: "Security",
    body:
      "We use reasonable technical and organizational measures to protect data, but no online service is 100% secure. Keep your login credentials safe."
  },
  {
    title: "International transfers",
    body:
      "Your data may be processed in countries where our providers operate. We take steps to protect it consistent with this policy."
  },
  {
    title: "Contact",
    body:
      "For privacy questions or requests, use the in-app Contact & Feedback form or email us at privacy@vendorsmarket.ng."
  }
];

export default function PrivacyPage() {
  const { theme } = useThemeIcons("clothing");

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
                src={theme === "clothing" ? "/icons/back.png" : "/icons/back-orange.png"}
                alt="Back"
                className="back-icon"
                data-blue="/icons/back.png"
                data-brown="/icons/back-orange.png"
              />
            </button>
            <h1 id="privacyTitle" style={{ margin: 0, textAlign: "center", flex: 1 }}>Privacy Policy</h1>
          </header>

          <section className="landing-featured" style={{ marginBottom: 16 }}>
            <p style={{ marginTop: 0, marginBottom: 8, color: "#4b5563" }}>
              Last updated: November 2025. We explain what we collect, how we use it, and your choices.
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
                    <p className="vendor-username" style={{ color: "#4b5563", margin: 0 }}>
                      {section.body}
                    </p>
                  ) : null}
                  {Array.isArray(section.list) ? (
                    <ul style={{ paddingLeft: 18, margin: "4px 0 0", color: "#4b5563", lineHeight: 1.5 }}>
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
