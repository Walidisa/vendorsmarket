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

const bootstrapThemeClassesScript = `
(function() {
  try {
    var theme = 'clothing';
    try {
      var storedTheme = localStorage.getItem('activeTheme');
      if (storedTheme === 'food' || storedTheme === 'clothing') theme = storedTheme;
    } catch (e) {}
    var storedDark = null;
    try { storedDark = localStorage.getItem('darkMode'); } catch (e) {}
    var isDark = storedDark === null ? true : storedDark === 'true';
    var apply = function() {
      var body = document.body;
      if (!body) return;
      body.classList.remove('theme-food', 'theme-clothing', 'dark');
      body.classList.add(theme === 'food' ? 'theme-food' : 'theme-clothing');
      if (isDark) body.classList.add('dark');
      body.style.backgroundColor = isDark ? '#1a1a1a' : '#ffffff';
      body.style.color = isDark ? '#e1e1e1' : '#1d1d1d';
    };
    if (document.body) {
      apply();
    } else {
      document.addEventListener('DOMContentLoaded', apply, { once: true });
    }
    document.documentElement.classList.toggle('dark', !!isDark);
    document.documentElement.style.backgroundColor = isDark ? '#1a1a1a' : '#ffffff';
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
  } catch (e) {
    // ignore
  }
})();
`;

export default function Head() {
  return (
    <>
      <meta name="theme-color" content="#1a1a1a" />
      <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
      <meta name="theme-color" content="#1a1a1a" media="(prefers-color-scheme: dark)" />
      <style
        dangerouslySetInnerHTML={{
          __html: `
            /* Fallback to reduce flash before JS applies stored preference */
            html, body { background-color: #1a1a1a; color: #e1e1e1; }
          `
        }}
      />
      <script dangerouslySetInnerHTML={{ __html: bootstrapThemeScript }} />
      <script dangerouslySetInnerHTML={{ __html: bootstrapThemeClassesScript }} />
    </>
  );
}
