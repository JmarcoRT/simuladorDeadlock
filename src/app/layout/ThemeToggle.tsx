import React from 'react';

function getInitialTheme(): 'light'|'dark' {
  const saved = localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = React.useState<'light'|'dark'>(getInitialTheme);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(t => (t === 'light' ? 'dark' : 'light'))}
      aria-label={`Cambiar a tema ${isDark ? 'claro' : 'oscuro'}`}
      title={`Cambiar a tema ${isDark ? 'claro' : 'oscuro'}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 40, height: 40,
        borderRadius: 12,
        background: 'var(--bg-muted)',
        border: '1px solid var(--border)',
        color: 'var(--text)',
        lineHeight: 0,
        padding: 0,
        transition: 'transform 120ms ease, background var(--transition-fast), border-color var(--transition-fast)',
      }}
      onMouseDown={e => (e.currentTarget.style.transform = 'scale(.96)')}
      onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {/* SVG */}
      <svg viewBox="0 0 24 24" width="22" height="22" style={{ display: 'block' }}>
        {/* disco base */}
        <circle cx="12" cy="12" r="5.5" fill="currentColor" opacity={isDark ? 0.95 : 0.55}/>
        {/* recorte de luna */}
        <path d="M15 4a7.5 7.5 0 1 0 5 13A8.2 8.2 0 1 1 15 4z"
              fill="var(--bg-panel)" opacity={isDark ? 1 : 0}/>
        {/* rayos del sol */}
        <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity={isDark ? 0 : 1}>
          <line x1="12" y1="1.8" x2="12" y2="4.1"/>
          <line x1="12" y1="19.9" x2="12" y2="22.2"/>
          <line x1="1.8" y1="12" x2="4.1" y2="12"/>
          <line x1="19.9" y1="12" x2="22.2" y2="12"/>
          <line x1="4.6" y1="4.6" x2="6.3" y2="6.3"/>
          <line x1="17.7" y1="17.7" x2="19.4" y2="19.4"/>
          <line x1="17.7" y1="6.3" x2="19.4" y2="4.6"/>
          <line x1="4.6" y1="19.4" x2="6.3" y2="17.7"/>
        </g>
      </svg>
    </button>
  );
};
