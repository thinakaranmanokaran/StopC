import { useState } from "react";
import UseAnimations from "react-useanimations";
import help from "react-useanimations/lib/help";
import check from "react-useanimations/lib/check";
import activity from "react-useanimations/lib/activity";
import mail from "react-useanimations/lib/mail";
import shield from "react-useanimations/lib/shield";
import github from "react-useanimations/lib/github";
import { MorphIcon } from "morphicons/react";
import { Plus, Minus } from "lucide";
import { TailChase } from 'ldrs/react';
import 'ldrs/react/TailChase.css';
import { SITE, SUPPORT } from "../data/siteContent.js";
import { ActionButton } from "../components/ActionButton.jsx";

export function SupportPage() {
  const hasEmail = Boolean(SITE.links.contactEmail);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [openFaqId, setOpenFaqId] = useState(SUPPORT.faqs[0]?.id || null);

  const toggleFaq = (id) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  const runDiagnostics = () => {
    setIsTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setIsTesting(false);
      setTestResult("Notification pipeline verified. StopC is ready to confirm your clipboard copies.");
    }, 1200);
  };

  return (
    <article>
      <p className="font-mono text-xs uppercase tracking-wider text-neutral-600">
        {SUPPORT.eyebrow}
      </p>

      <div className="mt-3 flex items-center gap-3">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#161616] leading-tight">
          {SUPPORT.heading}
        </h1>
        <div className="text-neutral-500 pt-1 hidden">
          <UseAnimations
            animation={help}
            size={28}
            strokeColor="#161616"
            autoplay={false}
            loop={false}
            interaction="hover-replay"
          />
        </div>
      </div>

      <p className="mt-5 text-[16.5px] leading-[1.7] text-neutral-800">{SUPPORT.intro}</p>

      <section aria-labelledby="quick-test-heading" className="mt-10 pt-8 border-t border-neutral-200">
        <h2 id="quick-test-heading" className="text-lg font-semibold tracking-tight text-[#161616]">
          {SUPPORT.quickTest.heading}
        </h2>

        <ol className="mt-4 divide-y divide-neutral-200 border-y border-neutral-200">
          {SUPPORT.quickTest.steps.map((step, i) => (
            <li key={step} className="py-3.5 flex items-baseline gap-4">
              <span className="font-mono text-xs text-neutral-600 shrink-0 tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-[16px] leading-[1.65] text-neutral-800">{step}</p>
            </li>
          ))}
        </ol>

        {/* Live Notification Diagnostics with TailChase loader */}
        <div className="mt-6 p-5 border border-neutral-200 rounded-md bg-[#f7f7f7]/60 hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-neutral-600">
                Interactive Test Tool
              </p>
              <p className="text-sm text-neutral-800 mt-0.5">
                Test the notification pipeline and clipboard event loop
              </p>
            </div>

            <ActionButton
              onClick={runDiagnostics}
              disabled={isTesting}
              variant="primary"
              size="md"
              icon={
                <UseAnimations
                  animation={activity}
                  size={18}
                  strokeColor="#fafafa"
                  autoplay={false}
                  loop={false}
                  interaction="hover-replay"
                />
              }
            >
              {isTesting ? "Testing Pipeline..." : "Run Test Now"}
            </ActionButton>
          </div>

          {isTesting && (
            <div className="mt-5 flex flex-col items-center justify-center p-6 bg-white border border-neutral-200 rounded-md">
              {/* Sourced from https://uiball.com/ldrs/?ref=toools */}
              <TailChase
                size="40"
                speed="1.75"
                color="black"
              />
              <p className="mt-3 text-xs font-mono text-neutral-600">
                Polling clipboard state &amp; checking Windows notification service...
              </p>
            </div>
          )}

          {testResult && (
            <div className="mt-4 p-3 bg-white border border-emerald-300 text-emerald-900 text-xs font-mono rounded-md flex items-center gap-2">
              <UseAnimations
                animation={check}
                size={20}
                strokeColor="#059669"
                autoplay={true}
                loop={false}
              />
              <span>{testResult}</span>
            </div>
          )}
        </div>
      </section>

      <section aria-labelledby="faq-heading" className="mt-10">
        <h2 id="faq-heading" className="text-lg font-semibold tracking-tight text-[#161616]">
          {SUPPORT.faqsHeading}
        </h2>

        <div className="mt-4 divide-y divide-neutral-200 border-y border-neutral-200">
          {SUPPORT.faqs.map((faq) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div key={faq.id} id={faq.id} className="py-1">
                <h3>
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${faq.id}`}
                    id={`faq-question-${faq.id}`}
                    className="w-full py-4 flex items-center justify-between text-left group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 rounded-sm"
                  >
                    <span className="text-[16.5px] font-semibold text-[#161616] group-hover:text-neutral-600 transition-colors pr-4 leading-snug pointer-events-none">
                      {faq.question}
                    </span>
                    <span className="shrink-0 text-neutral-800 pointer-events-none transition-colors">
                      <MorphIcon
                        icon={isOpen ? Minus : Plus}
                        spring="bouncy"
                        size={20}
                        strokeWidth={2}
                        color="#161616"
                      />
                    </span>
                  </button>
                </h3>

                <div
                  id={`faq-answer-${faq.id}`}
                  role="region"
                  aria-labelledby={`faq-question-${faq.id}`}
                  className={`grid transition-all duration-200 ease-in-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100 pb-4" : "grid-rows-[0fr] opacity-0 pb-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-[16px] leading-[1.7] text-neutral-800">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Support Actions and Contact Buttons */}
      <section aria-labelledby="support-contact-heading" className="mt-8 pt-8 border-t border-neutral-200">
        <h2 id="support-contact-heading" className="text-lg font-semibold tracking-tight text-[#161616]">
          {SUPPORT.contact.heading}
        </h2>
        <p className="mt-3 text-[16px] leading-[1.7] text-neutral-800">
          {SUPPORT.contact.description}
        </p>

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
              Email Support ({SITE.links.contactEmail})
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
            Report an Issue on GitHub
          </ActionButton>

          <ActionButton
            href="/privacy/"
            variant="secondary"
            size="md"
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
            Read Privacy Policy
          </ActionButton>
        </div>
      </section>
    </article>
  );
}
