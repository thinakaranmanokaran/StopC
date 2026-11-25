import { PAGES, PRIVACY, SITE, SUPPORT } from "../data/siteContent.js";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeJsonLd(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

export function getPageMeta(pageKey) {
  const page = PAGES[pageKey] ?? PAGES.notFound;
  const canonicalUrl =
    pageKey === "notFound"
      ? `${SITE.siteUrl}/404.html`
      : `${SITE.siteUrl}${page.path}`;
  return { ...page, canonicalUrl };
}

export function buildJsonLd(pageKey) {
  const meta = getPageMeta(pageKey);

  if (pageKey === "home") {
    const downloadUrl = SITE.links.microsoftStoreUrl || SITE.links.githubReleases;
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": `${SITE.siteUrl}/#website`,
          name: SITE.name,
          url: `${SITE.siteUrl}/`,
          description: meta.description,
          inLanguage: SITE.language,
        },
        {
          "@type": "SoftwareApplication",
          "@id": `${SITE.siteUrl}/#app`,
          name: SITE.name,
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Windows 10, Windows 11",
          softwareVersion: SITE.appVersion,
          url: `${SITE.siteUrl}/`,
          downloadUrl,
          license: SITE.license.url,
          description: meta.description,
          author: {
            "@type": "Person",
            name: SITE.author.name,
            url: SITE.author.url,
          },
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
        },
      ],
    };
  }

  if (pageKey === "privacy") {
    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: meta.title,
      description: meta.description,
      url: meta.canonicalUrl,
      dateModified: PRIVACY.effectiveIso,
      inLanguage: SITE.language,
      publisher: {
        "@type": "Person",
        name: SITE.author.name,
        url: SITE.author.url,
      },
    };
  }

  if (pageKey === "support") {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      name: meta.title,
      description: meta.description,
      url: meta.canonicalUrl,
      inLanguage: SITE.language,
      mainEntity: SUPPORT.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    };
  }

  return null;
}

export function renderHeadTags(pageKey) {
  const meta = getPageMeta(pageKey);
  const keywords = (meta.keywords || []).join(", ");
  const jsonLd = buildJsonLd(pageKey);
  const isIndexable = pageKey !== "notFound";
  const ogImageUrl = `${SITE.siteUrl}/og-image.png`;

  const lines = [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    keywords ? `<meta name="keywords" content="${escapeHtml(keywords)}" />` : "",
    `<meta name="author" content="${escapeHtml(SITE.author.name)}" />`,
    `<meta name="creator" content="${escapeHtml(SITE.author.name)}" />`,
    `<meta name="publisher" content="${escapeHtml(SITE.author.name)}" />`,
    `<meta name="robots" content="${escapeHtml(meta.robots)}" />`,
    `<meta name="googlebot" content="${isIndexable ? 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' : 'noindex, follow'}" />`,
    `<meta name="bingbot" content="${isIndexable ? 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' : 'noindex, follow'}" />`,

    // Search Engine Verifications (Google & Bing)
    `<meta name="google-site-verification" content="googleb2d538de4396f59b" />`,
    `<meta name="msvalidate.01" content="E24C428681AEBDE525F9697BFD1456E0" />`,

    // Canonical & Alternates
    isIndexable ? `<link rel="canonical" href="${escapeHtml(meta.canonicalUrl)}" />` : "",
    isIndexable ? `<link rel="alternate" hreflang="en" href="${escapeHtml(meta.canonicalUrl)}" />` : "",
    isIndexable ? `<link rel="alternate" hreflang="x-default" href="${escapeHtml(meta.canonicalUrl)}" />` : "",

    // Open Graph
    `<meta property="og:type" content="${escapeHtml(meta.ogType)}" />`,
    `<meta property="og:site_name" content="${escapeHtml(SITE.name)}" />`,
    `<meta property="og:locale" content="${escapeHtml(SITE.locale)}" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(meta.canonicalUrl)}" />`,
    `<meta property="og:image" content="${escapeHtml(ogImageUrl)}" />`,
    `<meta property="og:image:secure_url" content="${escapeHtml(ogImageUrl)}" />`,
    `<meta property="og:image:type" content="image/png" />`,
    `<meta property="og:image:width" content="1024" />`,
    `<meta property="og:image:height" content="576" />`,
    `<meta property="og:image:alt" content="${escapeHtml(SITE.name)} | ${escapeHtml(SITE.tagline)}" />`,

    // Twitter / X
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(ogImageUrl)}" />`,
    `<meta name="twitter:image:alt" content="${escapeHtml(SITE.name)} | ${escapeHtml(SITE.tagline)}" />`,

    // Mobile & Web App
    `<meta name="application-name" content="${escapeHtml(SITE.name)}" />`,
    `<meta name="apple-mobile-web-app-title" content="${escapeHtml(SITE.name)}" />`,
    `<meta name="apple-mobile-web-app-capable" content="yes" />`,
    `<meta name="apple-mobile-web-app-status-bar-style" content="default" />`,
    `<meta name="mobile-web-app-capable" content="yes" />`,
    `<meta name="format-detection" content="telephone=no, address=no, email=no" />`,
    `<meta name="theme-color" content="${escapeHtml(SITE.themeColor)}" media="(prefers-color-scheme: light)" />`,
    `<meta name="theme-color" content="#161616" media="(prefers-color-scheme: dark)" />`,
    `<meta name="color-scheme" content="light" />`,

    // Microsoft Tiles
    `<meta name="msapplication-TileColor" content="${escapeHtml(SITE.themeColor)}" />`,
    `<meta name="msapplication-config" content="none" />`,

    // Standards & Security
    `<meta name="referrer" content="strict-origin-when-cross-origin" />`,
    `<meta name="rating" content="general" />`,

    // Favicons & Web Manifest
    `<link rel="icon" href="/favicon.ico" sizes="any" />`,
    `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />`,
    `<link rel="icon" type="image/png" sizes="192x192" href="/icon.png" />`,
    `<link rel="apple-touch-icon" sizes="128x128" href="/apple-touch-icon.png" />`,
    `<link rel="manifest" href="/site.webmanifest" />`,

    // Structured Data JSON-LD
    jsonLd ? `<script type="application/ld+json">${escapeJsonLd(jsonLd)}</script>` : "",
  ];

  return lines.filter(Boolean).join("\n    ");
}
