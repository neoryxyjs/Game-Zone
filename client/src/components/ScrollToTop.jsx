import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll instantáneo al inicio cuando cambia la ruta
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

