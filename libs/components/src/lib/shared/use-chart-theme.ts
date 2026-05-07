import { useEffect, useState } from 'react';

interface ChartTheme {
  gridColor: string
  textColor: string
}

function readTheme(): ChartTheme {
  if (typeof document === 'undefined') {
    return { gridColor: 'rgba(0,0,0,0.1)', textColor: '#1e293b' };
  }
  const styles = getComputedStyle(document.documentElement);
  return {
    gridColor: styles.getPropertyValue('--bs-border-color').trim() || 'rgba(0,0,0,0.1)',
    textColor: styles.getPropertyValue('--bs-body-color').trim() || '#1e293b',
  };
}

export function useChartTheme(): ChartTheme {
  const [theme, setTheme] = useState<ChartTheme>(readTheme);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(readTheme());
    });
    observer.observe(document.documentElement, {
      attributeFilter: ['data-bs-theme'],
      attributes: true,
    });
    return () => observer.disconnect();
  }, []);

  return theme;
}
