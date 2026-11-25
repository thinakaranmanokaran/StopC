import { createContext, useCallback, useContext, useEffect, useState } from "react";

export function normalizePath(rawPath = "/") {
  const clean = (rawPath.split("?")[0].split("#")[0] || "/").trim();
  if (clean === "/" || clean === "") return "/";
  if (clean === "/404.html" || clean === "/404") return "/404.html";
  if (clean === "/privacy" || clean === "/privacy/") return "/privacy/";
  if (clean === "/support" || clean === "/support/") return "/support/";
  return clean;
}

export function resolvePageKey(pathname) {
  const normalized = normalizePath(pathname);
  if (normalized === "/") return "home";
  if (normalized === "/privacy/") return "privacy";
  if (normalized === "/support/") return "support";
  return "notFound";
}

const RouterContext = createContext({
  pathname: "/",
  pageKey: "home",
  navigate: () => {},
});

export function RouterProvider({ initialPath = "/", children }) {
  const [pathname, setPathname] = useState(() =>
    typeof window !== "undefined" ? normalizePath(window.location.pathname) : normalizePath(initialPath)
  );

  useEffect(() => {
    const onPopState = () => {
      setPathname(normalizePath(window.location.pathname));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = useCallback((href, event) => {
    if (!href || typeof window === "undefined") return;
    if (
      event &&
      (event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey)
    ) {
      return;
    }
    if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:")) {
      return;
    }

    const [rawPath, hash] = href.split("#");
    const targetPath = normalizePath(rawPath || "/");
    const currentPath = normalizePath(window.location.pathname);

    if (event) event.preventDefault();

    if (targetPath !== currentPath || hash) {
      const nextUrl = hash ? `${targetPath}#${hash}` : targetPath;
      window.history.pushState({}, "", nextUrl);
      setPathname(targetPath);
    }

    if (hash) {
      requestAnimationFrame(() => {
        document.getElementById(hash)?.scrollIntoView();
      });
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, []);

  const pageKey = resolvePageKey(pathname);

  return (
    <RouterContext.Provider value={{ pathname, pageKey, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  return useContext(RouterContext);
}
