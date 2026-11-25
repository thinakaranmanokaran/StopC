import UseAnimations from "react-useanimations";
import help from "react-useanimations/lib/help";
import shield from "react-useanimations/lib/shield";
import { NOT_FOUND } from "../data/siteContent.js";
import { ActionButton } from "../components/ActionButton.jsx";

export function NotFoundPage() {
  return (
    <article>
      <p className="font-mono text-xs uppercase tracking-wider text-neutral-600">
        {NOT_FOUND.eyebrow}
      </p>

      <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-[#161616] leading-tight">
        {NOT_FOUND.heading}
      </h1>

      <p className="mt-5 text-[16.5px] leading-[1.7] text-neutral-800">{NOT_FOUND.message}</p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <ActionButton
          href="/"
          variant="primary"
          size="md"
          arrow="left"
        >
          Back to StopC Home
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
          Support and FAQ
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
          Privacy Policy
        </ActionButton>
      </div>
    </article>
  );
}
