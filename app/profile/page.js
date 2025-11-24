"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

function slugify(name) {
  return (name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ProfileLanding() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function go() {
      try {
        const { data } = await supabase.auth.getSession();
        const userId = data?.session?.user?.id || null;
        if (!userId) {
          router.replace("/login");
          return;
        }

        const res = await fetch("/api/profiles", { cache: "no-store" });
        const profiles = res.ok ? await res.json() : [];
        const vendor = profiles.find((p) => p.userId === userId) || null;
        if (!vendor) {
          router.replace("/login");
          return;
        }
        const slug = slugify(vendor.username || "");
        if (!slug) {
          router.replace("/login");
          return;
        }
        if (!active) return;
        router.replace(`/profile/${slug}`);
      } catch (e) {
        setError("Failed to resolve profile.");
        router.replace("/login");
      }
    }
    go();
    return () => {
      active = false;
    };
  }, [router]);

  return <p style={{ padding: "1rem" }}>{error || "Loading profile…"}</p>;
}
