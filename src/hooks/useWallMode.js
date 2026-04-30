import { useEffect, useState } from 'react';

export function useWallMode() {
  const [wallMode, setWallMode] = useState(new URLSearchParams(window.location.hash.split('?')[1] || '').get('wall') === 'true');

  useEffect(() => {
    const onKey = (event) => {
      if (event.key.toLowerCase() === 'w') {
        setWallMode((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return { wallMode, setWallMode };
}
