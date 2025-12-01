const bootstrapThemeScript = `
(function() {
  try {
    var color = '#ffffff';
    var meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', color);
  } catch (e) {
    // ignore
  }
})();
`;

export default function Head() {
  return (
    <>
      <meta name="theme-color" content="#ffffff" />
      <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
      <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: dark)" />
      <script dangerouslySetInnerHTML={{ __html: bootstrapThemeScript }} />
    </>
  );
}
