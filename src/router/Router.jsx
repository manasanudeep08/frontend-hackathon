
import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from 'react';

const RouterContext = createContext({
  currentPath: '/',
  navigate: () => {}
});

const BASE_URL = import.meta.env.BASE_URL || '/';

// Convert GitHub Pages URL into an application route.
function getAppPath(pathname) {
  let path = pathname;

  if (BASE_URL !== '/' && path.startsWith(BASE_URL)) {
    path = '/' + path.slice(BASE_URL.length);
  }

  if (!path) return '/';

  return path.startsWith('/') ? path : `/${path}`;
}

// Convert application route into a GitHub Pages URL.
function getBrowserPath(path) {
  const appPath = getAppPath(path);

  if (BASE_URL === '/') return appPath;

  return BASE_URL + appPath.replace(/^\/+/, '');
}

export function Router({ children }) {
  const [currentPath, setCurrentPath] = useState(() =>
    getAppPath(window.location.pathname)
  );

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(getAppPath(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const navigate = (to, { replace = false } = {}) => {
    const appPath = getAppPath(to);
    const browserPath = getBrowserPath(appPath);

    if (replace) {
      window.history.replaceState(null, '', browserPath);
    } else {
      window.history.pushState(null, '', browserPath);
    }

    setCurrentPath(appPath);
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

export function Link({
  href,
  className = '',
  children,
  onClick,
  ...props
}) {
  const { navigate } = useRouter();

  const isInternal =
    href.startsWith('/') && !href.startsWith('//');

  const browserHref = isInternal
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
      !isInternal ||
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
