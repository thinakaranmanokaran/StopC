import { useEffect } from "react";
import { Layout } from "./components/Layout.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { PrivacyPage } from "./pages/PrivacyPage.jsx";
import { SupportPage } from "./pages/SupportPage.jsx";
import { NotFoundPage } from "./pages/NotFoundPage.jsx";
import { RouterProvider, useRouter } from "./router.jsx";
import { getPageMeta } from "./seo/headTags.js";

function PageSwitch() {
  const { pageKey } = useRouter();

  useEffect(() => {
    const meta = getPageMeta(pageKey);
    document.title = meta.title;

    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", meta.description);

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical && pageKey !== "notFound") {
      canonical.setAttribute("href", meta.canonicalUrl);
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", meta.title);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", meta.description);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute("content", meta.canonicalUrl);

    const twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute("content", meta.title);

    const twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute("content", meta.description);
  }, [pageKey]);

  return (
    <Layout>
      {pageKey === "home" && <HomePage />}
      {pageKey === "privacy" && <PrivacyPage />}
      {pageKey === "support" && <SupportPage />}
      {pageKey === "notFound" && <NotFoundPage />}
    </Layout>
  );
}

export function App({ initialPath = "/" }) {
  return (
    <RouterProvider initialPath={initialPath}>
      <PageSwitch />
    </RouterProvider>
  );
}
