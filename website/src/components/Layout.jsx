import { SITE } from "../data/siteContent.js";
import { normalizePath, useRouter } from "../router.jsx";

export function Layout({ children }) {
  const { pathname, navigate } = useRouter();
  const activePath = normalizePath(pathname);

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] text-[#161616]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-[#161616] focus:text-[#fafafa] focus:px-3 focus:py-2 focus:text-sm focus:font-medium"
      >
        Skip to main content
      </a>

      <div className="w-full max-w-[680px] mx-auto px-5 sm:px-8 py-8 sm:py-14 flex-1 flex flex-col">
        <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3 pb-5 border-b border-neutral-200">
          <a
            href="/"
            onClick={(e) => navigate("/", e)}
            className="text-base font-semibold tracking-tight text-[#161616] no-underline hover:text-[#0b57d0]"
          >
            {SITE.name}
          </a>

          <nav aria-label="Primary" className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[15px]">
            {SITE.nav.map((item) => {
              const isCurrent = activePath === normalizePath(item.href);
              return (
                <a
                  key={item.href}
                  href={item.href}
                  aria-current={isCurrent ? "page" : undefined}
                  onClick={(e) => navigate(item.href, e)}
                  className={
                    isCurrent
                      ? "py-1.5 inline-block text-[#161616] font-medium underline decoration-[#0b57d0] decoration-2 underline-offset-4"
                      : "py-1.5 inline-block text-neutral-600 hover:text-[#0b57d0] hover:underline underline-offset-4"
                  }
                >
                  {item.label}
                </a>
              );
            })}
          </nav>
        </header>

        <main id="main-content" className="flex-1 pt-10 sm:pt-12">
          {children}
        </main>

        <footer className="mt-16 pt-6 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-sm text-neutral-600">
          <p>
            <a
              href={SITE.author.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-neutral-400 underline-offset-4 hover:text-[#0b57d0] hover:decoration-[#0b57d0]"
            >
              {SITE.author.name}
            </a>
            {" · "}
            <a
              href={SITE.license.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-neutral-400 underline-offset-4 hover:text-[#0b57d0] hover:decoration-[#0b57d0]"
            >
              {SITE.license.name}
            </a>
          </p>

          <p className="font-mono text-xs text-neutral-600">
            {SITE.name} v{SITE.appVersion}
          </p>
        </footer>
      </div>
    </div>
  );
}
