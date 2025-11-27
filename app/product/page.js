
"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ProductRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  useEffect(() => {
    const id = searchParams.get("id") || (typeof window !== "undefined" ? localStorage.getItem("activeProductId") : null);
    if (id) {
      router.replace(`/product/${id}`);
    }
  }, [router, searchParams]);
  return <div style={{ padding: "1.5rem" }}>Redirecting to product…</div>;
}


