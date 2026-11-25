import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import "./styles/index.css";
import { App } from "./App.jsx";
import { renderHeadTags } from "./seo/headTags.js";
import { resolvePageKey } from "./router.jsx";

export function render(url) {
  const pageKey = resolvePageKey(url);
  const html = renderToString(
    <StrictMode>
      <App initialPath={url} />
    </StrictMode>
  );
  const head = renderHeadTags(pageKey);
  return { html, head, pageKey };
}
