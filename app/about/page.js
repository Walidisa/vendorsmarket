"use client";

import Script from "next/script";
import { useThemeIcons } from "../../lib/useThemeIcons";

const sections = [
  {
    title: "What we do",
    body:
      "VendorsMarket connects buyers with independent vendors. We host the marketplace; vendors own their shops and manage their listings across categories like clothing, phone/tech accessories, cars, real estate, and more."
  },
  {
    title: "How it works for buyers",
    list: [
      "Browse or search products and services by category.",
      "Open a listing to view details, vendor profile, and feedback.",
      "Contact the vendor via their published contact info, and share feedback through our form."
    ]
  },
  {
    title: "How it works for vendors",
    list: [
      "Create a profile with shop details, state/town, contact info, and visuals.",
      "Add listings with photos, pricing, and descriptions; update anytime.",
      "Receive inquiries and feedback directly from buyers."
    ]
  },
  {
    title: "Why VendorsMarket",
    list: [
      "Local focus: easy discovery of nearby vendors.",
      "Simple setup: add products in minutes with images and pricing.",
      "Trust signals: vendor ratings/feedback help buyers choose."
    ]
  },
  {
    title: "Safety & expectations",
    list: [
      "VendorsMarket is a platform; vendors handle their own sales, delivery, and warranties.",
      "Review listings carefully and confirm details with the vendor.",
      "Report suspicious or abusive behavior via the Contact & Feedback form."
    ]
  },
  {
    title: "Need help?",
    body:
      "Use the Contact & Feedback button in the footer to reach us with questions or issues."
  }
];

export default function AboutPage() {
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
            <h1 id="aboutTitle" style={{ margin: 0, textAlign: "center" }}>About VendorsMarket</h1>
          </header>

          <section className="landing-featured" style={{ marginBottom: 16 }}>
            <p style={{ marginTop: 0, marginBottom: 8, color: "var(--color-muted)" }}>
              Discover who we are, how we work, and how to get the most from VendorsMarket.
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
