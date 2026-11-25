import UseAnimations from "react-useanimations";
import github from "react-useanimations/lib/github";
import mail from "react-useanimations/lib/mail";
import help from "react-useanimations/lib/help";
import { PRIVACY, SITE } from "../data/siteContent.js";
import { ActionButton } from "../components/ActionButton.jsx";

export function PrivacyPage() {
  const hasEmail = Boolean(SITE.links.contactEmail);

  return (
    <article>
      <p className="font-mono text-xs uppercase tracking-wider text-neutral-600">
        {PRIVACY.eyebrow}
      </p>

      <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-[#161616] leading-tight">
        {PRIVACY.heading}
      </h1>

      <p className="mt-2 text-sm text-neutral-600">
        Effective date:{" "}
        <time dateTime={PRIVACY.effectiveIso} className="font-medium text-neutral-800">
          {PRIVACY.effectiveDate}
        </time>
      </p>

      <p className="mt-5 text-[16.5px] leading-[1.7] text-neutral-800">{PRIVACY.intro}</p>

      <div className="mt-10 divide-y divide-neutral-200 border-t border-neutral-200">
        {PRIVACY.sections.map((section) => (
          <section key={section.id} id={section.id} aria-labelledby={`heading-${section.id}`} className="py-7">
            <h2
              id={`heading-${section.id}`}
              className="flex items-baseline gap-3 text-lg font-semibold tracking-tight text-[#161616]"
            >
              <span className="font-mono text-xs font-normal text-neutral-600 tabular-nums">
                {section.index}
              </span>
              <span>{section.title}</span>
            </h2>

            {section.paragraphs && (
              <div className="mt-3 space-y-3 text-[16px] leading-[1.7] text-neutral-800">
                {section.paragraphs.map((text) => (
                  <p key={text}>{text}</p>
                ))}
              </div>
            )}

            {section.bullets && (
              <ul className="mt-3 space-y-2.5 text-[16px] leading-[1.68] text-neutral-800 list-disc pl-5">
                {section.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}

            {section.showContact && (
              <div className="mt-5 flex flex-wrap items-center gap-3">
                {hasEmail && (
                  <ActionButton
                    href={`mailto:${SITE.links.contactEmail}`}
                    variant="secondary"
                    size="md"
                    icon={
                      <UseAnimations
                        animation={mail}
                        size={18}
                        strokeColor="#161616"
                        autoplay={false}
                        loop={false}
                        interaction="hover-replay"
                      />
                    }
                  >
                    Email: {SITE.links.contactEmail}
                  </ActionButton>
                )}

                <ActionButton
                  href={SITE.links.githubIssues}
                  variant="primary"
                  size="md"
                  arrow="up-right"
                  icon={
                    <UseAnimations
                      animation={github}
                      size={18}
                      strokeColor="#fafafa"
                      autoplay={false}
                      loop={false}
                      interaction="hover-replay"
                    />
                  }
                >
                  Open an Issue on GitHub
                </ActionButton>

                <ActionButton
                  href="/support/"
                  variant="secondary"
                  size="md"
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
                  Visit Support &amp; FAQ
                </ActionButton>
              </div>
            )}
          </section>
        ))}
      </div>
    </article>
  );
}
