"use client";

import Head from "next/head";
import { usePathname } from "next/navigation";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vendorsmarket.com.ng";

export default function CanonicalHead() {
  const pathname = usePathname() || "/";
  const href = `${SITE_URL}${pathname === "/" ? "" : pathname}`;

  return (
    <Head>
      <link rel="canonical" href={href} />
    </Head>
  );
}
