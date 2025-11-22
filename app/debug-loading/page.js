export default async function DebugLoadingPage() {
  // Simulate a short server-side delay to trigger the global loading UI
  await new Promise((resolve) => setTimeout(resolve, 1800));
  return (
    <div style={{ padding: "1.5rem", fontSize: "1rem" }}>
      <h1 style={{ margin: "0 0 0.5rem" }}>Debug Loading Page</h1>
      <p style={{ margin: 0 }}>This page intentionally delayed to show the loading overlay.</p>
    </div>
  );
}
