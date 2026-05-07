import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const prevTopLevelRoute = useRef(null);

  useEffect(() => {
    // Extract top-level route (first segment after /)
    // /user/cart -> 'user', /owner -> 'owner', / -> 'home'
    const pathSegments = pathname.split('/').filter(Boolean);
    const topLevelRoute = pathSegments[0] || 'home';
    
    // Only scroll to top if the top-level route actually changed
    // Don't scroll when navigating between sub-routes (e.g., /user -> /user/cart)
    if (prevTopLevelRoute.current !== null && prevTopLevelRoute.current !== topLevelRoute) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }, 10);
      
      return () => clearTimeout(timer);
    }
    
    prevTopLevelRoute.current = topLevelRoute;
  }, [pathname]);

  return null;
};

export default ScrollToTop;
