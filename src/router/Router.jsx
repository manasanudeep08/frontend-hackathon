import React, { createContext, useContext, useState, useEffect } from 'react';

const RouterContext = createContext({
  currentPath: '/',
  navigate: () => {}
});

/**
 * Lightweight, zero-dependency History API router provider.
 * Intercepts popstate and supports programmatic pushState/replaceState navigation.
 */
export function Router({ children }) {
  const [currentPath, setCurrentPath] = useState(
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to, { replace = false } = {}) => {
    if (typeof window === 'undefined') return;

    if (replace) {
      window.history.replaceState(null, '', to);
    } else {
      window.history.pushState(null, '', to);
    }

    setCurrentPath(to);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <RouterContext.Provider value={{ currentPath, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

/**
 * Hook to access current navigation path and navigate function.
 */
export function useRouter() {
  return useContext(RouterContext);
}

/**
 * Accessible navigational anchor tag that intercepts internal clicks.
 */
export function Link({ href, className = '', children, onClick, ...props }) {
  const { navigate } = useRouter();

  const handleClick = (e) => {
    if (onClick) onClick(e);

    // Allow default browser behavior for modifier keys or external links
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.altKey ||
      e.ctrlKey ||
      e.shiftKey ||
      href.startsWith('http://') ||
      href.startsWith('https://') ||
      href.startsWith('mailto:') ||
      props.target === '_blank'
    ) {
      return;
    }

    e.preventDefault();
    navigate(href);
  };

  return (
    <a href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}

/**
 * Route matcher component.
 */
export function Route({ path, element }) {
  const { currentPath } = useRouter();
  if (currentPath === path) {
    return element;
  }
  return null;
}
