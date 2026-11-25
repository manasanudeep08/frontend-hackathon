
import React, { createContext, useContext, useState, useEffect } from 'react';

const RouterContext = createContext({
  currentPath: '/',
  navigate: () => {}
});

const BASE_URL = import.meta.env.BASE_URL;

function getAppPath() {
  let path = window.location.pathname;

  if (path.startsWith(BASE_URL)) {
    path = '/' + path.slice(BASE_URL.length);
  }

  return path || '/';
}

function getBrowserPath(path) {
  const cleanPath = path.replace(/^\/+/, '');
  return BASE_URL + cleanPath;
}

export function Router({ children }) {
  const [currentPath, setCurrentPath] = useState(getAppPath);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(getAppPath());
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const navigate = (to, { replace = false } = {}) => {
    const browserPath = getBrowserPath(to);

    if (replace) {
      window.history.replaceState(null, '', browserPath);
    } else {
      window.history.pushState(null, '', browserPath);
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

export function useRouter() {
  return useContext(RouterContext);
}

export function Link({ href, className = '', children, onClick, ...props }) {
  const { navigate } = useRouter();

  const browserHref = href.startsWith('/')
    ? getBrowserPath(href)
    : href;

  const handleClick = (e) => {
    if (onClick) onClick(e);

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
    <a
      href={browserHref}
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </a>
  );
}

export function Route({ path, element }) {
  const { currentPath } = useRouter();

  return currentPath === path ? element : null;
}
