import UseAnimations from "react-useanimations";
import download from "react-useanimations/lib/download";
import github from "react-useanimations/lib/github";
import clipboard from "react-useanimations/lib/clipboard";
import notification from "react-useanimations/lib/notification";
import check from "react-useanimations/lib/check";
import shield from "react-useanimations/lib/shield";
import settings from "react-useanimations/lib/settings";
import terminal from "react-useanimations/lib/terminal";
import help from "react-useanimations/lib/help";
import { Store } from "lucide-react";
import { HOME, SITE } from "../data/siteContent.js";
import { CopySimulator } from "../components/CopySimulator.jsx";
import { ActionButton } from "../components/ActionButton.jsx";
import { triggerChildAnimations, stopChildAnimations } from "../utils/useAnimationsHover.js";

const STEP_ICONS = [clipboard, notification, check];
const HIGHLIGHT_ICONS = [shield, settings, terminal];

export function HomePage() {
  const hasStoreUrl = Boolean(SITE.links.microsoftStoreUrl);

  return (
    <article>
      <p className="font-mono text-xs uppercase tracking-wider text-neutral-600">
        {HOME.eyebrow}
      </p>

      <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-[#161616] leading-tight">
        {HOME.heading}
      </h1>

      <p className="mt-2 text-lg sm:text-xl font-medium text-neutral-700">
        {HOME.tagline}
      </p>

      <p className="mt-5 text-[16.5px] leading-[1.7] text-neutral-800">
        {HOME.summary}
      </p>

      {/* Interactive StopC Demonstration with TailChase loader and useanimations icons */}
      {/* <CopySimulator /> */}

      {/* CTA Download Section: Side-by-side with animated arrow from useanimations */}
      <section aria-labelledby="download-heading" className="mt-10 pt-8 border-t border-neutral-200">
        <h2
          id="download-heading"
          className="font-mono text-xs uppercase tracking-wider text-neutral-600"
        >
          {HOME.cta.heading}
        </h2>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          <ActionButton
            href={SITE.links.installerDownload}
            download
            variant="primary"
            size="lg"
            className="w-full"
            icon={
              <UseAnimations
                animation={download}
                size={22}
                strokeColor="#fafafa"
                autoplay={false}
                loop={false}
                interaction="hover-replay"
              />
            }
          >
            Download for Windows
          </ActionButton>

          {hasStoreUrl ? (
            <ActionButton
              href={SITE.links.microsoftStoreUrl}
              variant="secondary"
              size="lg"
              className="w-full"
              icon={<Store size={20} className="shrink-0 text-neutral-800" />}
            >
              Microsoft Store
            </ActionButton>
          ) : (
            <ActionButton
              disabled
              variant="secondary"
              size="lg"
              className="w-full"
              icon={<Store size={20} className="shrink-0 text-neutral-400" />}
            >
              Microsoft Store (In Review)
            </ActionButton>
          )}
        </div>

        <p className="mt-3 text-xs leading-relaxed text-neutral-600">
          {HOME.cta.githubRelease.note}
        </p>
      </section>

      {/* How it Works: Animated icons from useanimations (hover-triggered) */}
      <section aria-labelledby="how-it-works-heading" className="mt-10">
        <h2
          id="how-it-works-heading"
          className="font-mono text-xs uppercase tracking-wider text-neutral-600"
        >
          {HOME.howItWorks.heading}
        </h2>

        <ol className="mt-4 divide-y divide-neutral-200 border-y border-neutral-200">
          {HOME.howItWorks.steps.map((step, idx) => {
            const icon = STEP_ICONS[idx] || clipboard;
            return (
              <li
                key={step.index}
                onMouseEnter={(e) => triggerChildAnimations(e.currentTarget)}
                onMouseLeave={(e) => stopChildAnimations(e.currentTarget)}
                className="py-4 flex items-start gap-4 group cursor-pointer hover:bg-neutral-50/50 transition-colors px-2 -mx-2 rounded-md"
              >
                <span className="font-mono text-xs text-neutral-600 shrink-0 tabular-nums pt-1 pointer-events-none">
                  {step.index}
                </span>
                <div className="shrink-0 pt-0.5 text-neutral-700 pointer-events-none">
                  <UseAnimations
                    animation={icon}
                    size={22}
                    strokeColor="#161616"
                    autoplay={false}
                    loop={false}
                    interaction="hover-replay"
                  />
                </div>
                <p className="text-[16px] leading-[1.65] text-neutral-800 pointer-events-none">{step.text}</p>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Highlights: Icons from useanimations for each key benefit */}
      <section aria-labelledby="highlights-heading" className="mt-10">
        <h2
          id="highlights-heading"
          className="font-mono text-xs uppercase tracking-wider text-neutral-600"
        >
          {HOME.highlights.heading}
        </h2>

        <ul className="mt-4 divide-y divide-neutral-200 border-y border-neutral-200 text-[16px]">
          {HOME.highlights.items.map((item, idx) => {
            const icon = HIGHLIGHT_ICONS[idx] || shield;
            return (
              <li
                key={item}
                onMouseEnter={(e) => triggerChildAnimations(e.currentTarget)}
                onMouseLeave={(e) => stopChildAnimations(e.currentTarget)}
                className="py-3.5 flex items-start gap-3.5 group cursor-pointer hover:bg-neutral-50/50 transition-colors px-2 -mx-2 rounded-md"
              >
                <div className="shrink-0 pt-0.5 text-neutral-600 pointer-events-none">
                  <UseAnimations
                    animation={icon}
                    size={20}
                    strokeColor="#161616"
                    autoplay={false}
                    loop={false}
                    interaction="hover-replay"
                  />
                </div>
                <p className="text-[15.5px] leading-[1.65] text-neutral-800 pointer-events-none">{item}</p>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Quick Actions / Links: Animated arrows and icons from useanimations */}
      <section aria-labelledby="links-heading" className="mt-12 pt-8 border-t border-neutral-200">
        <h2
          id="links-heading"
          className="font-mono text-xs uppercase tracking-wider text-neutral-600"
        >
          {HOME.linksHeading}
        </h2>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full">
          <ActionButton
            href="/privacy/"
            variant="secondary"
            size="md"
            className="w-full"
            arrow="right"
            icon={
              <UseAnimations
                animation={shield}
                size={18}
                strokeColor="#161616"
                autoplay={false}
                loop={false}
                interaction="hover-replay"
              />
            }
          >
            Privacy Policy
          </ActionButton>

          <ActionButton
            href="/support/"
            variant="secondary"
            size="md"
            className="w-full"
            arrow="right"
            icon={
              <UseAnimations
                animation={help}
                size={18}
                strokeColor="#161616"
                autoplay={false}
                loop={false}
                interaction="hover-replay"
              />
            }
          >
            Support &amp; FAQ
          </ActionButton>

          <ActionButton
            href={SITE.links.githubRepo}
            variant="secondary"
            size="md"
            className="w-full"
            arrow="up-right"
            icon={
              <UseAnimations
                animation={github}
                size={18}
                strokeColor="#161616"
                autoplay={false}
                loop={false}
                interaction="hover-replay"
              />
            }
          >
            Source on GitHub
          </ActionButton>
        </div>
      </section>
    </article>
  );
}
