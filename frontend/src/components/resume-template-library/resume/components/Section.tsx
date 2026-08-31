import React from "react";
import { SectionHeadingStyle } from "./themeTypes";

interface SectionProps {
  title: string;
  headingStyle: SectionHeadingStyle;
  /** When false, the section (heading + content) does not render at all. */
  show: boolean;
  children: React.ReactNode;
}

/**
 * A single resume section: an <h2> heading followed by its content,
 * wrapped in a <section> landmark. Renders nothing (not even the
 * heading) when `show` is false, which is how every template
 * implements "hide empty sections" without duplicating that check
 * in every template file.
 */
export default function Section({
  title,
  headingStyle,
  show,
  children,
}: SectionProps) {
  if (!show) return null;

  return (
    <section className="resume-section">
      <h2 className={`section-heading heading-${headingStyle}`}>
        {headingStyle === "tech-code-block" ? `// ${title}` : title}
      </h2>
      <div className="section-body">{children}</div>
    </section>
  );
}
