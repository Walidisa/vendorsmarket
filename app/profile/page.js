"use client";

import { useEffect } from "react";
import Script from "next/script";
import Link from "next/link";
import { useRouter } from "next/navigation";

function slugify(name) {
  return (name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ProfileLanding() {
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "1";
    const loggedInVendor = localStorage.getItem("loggedInVendorName");

    if (!isLoggedIn) {
      router.replace("/login");
      return;
    }

    const vendorName = loggedInVendor || localStorage.getItem("activeVendorName");
    if (!vendorName) {
      router.replace("/login");
      return;
    }

    const slug = slugify(vendorName) || "";
    if (!slug) {
      router.replace("/login");
      return;
    }
    localStorage.setItem("activeVendorName", vendorName);
    router.replace(`/profile/${slug}`);
  }, [router]);

  return (
    <>
      <p style={{ padding: "1rem" }}>Loading profile…</p>
      <Script src="/scripts/main.js" strategy="afterInteractive" />
    </>
  );
}
