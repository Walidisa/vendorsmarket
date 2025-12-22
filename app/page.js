import HomeClient from "./home-client";

// Force dynamic rendering to avoid stale cached homepage HTML
export const revalidate = 0;
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function Page() {
  return <HomeClient />;
}
