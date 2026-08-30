import React from "react";
import { PersonalInfo } from "../data/resumeTypes";
import { ThemeConfig } from "./themeTypes";

interface ResumeHeaderProps {
  personal: PersonalInfo;
  theme: ThemeConfig;
}

const SEPARATORS: Record<ThemeConfig["contactSeparator"], string> = {
  dot: " \u2022 ",
  pipe: " | ",
  space: "   ",
};

/**
 * Renders candidate name, title, and contact details as real text.
 * No icons are used as the sole representation of any contact method,
 * and every link is rendered with its visible URL as the link text
 * (never an icon-only anchor), per ATS requirements.
 */
export default function ResumeHeader({ personal, theme }: ResumeHeaderProps) {
  const sep = SEPARATORS[theme.contactSeparator];

  const contactParts: React.ReactNode[] = [];
  if (personal.email) {
    contactParts.push(
      <a key="email" href={`mailto:${personal.email}`}>
        {personal.email}
      </a>
    );
  }
  if (personal.phone) {
    contactParts.push(<span key="phone">{personal.phone}</span>);
  }
  if (personal.location) {
    contactParts.push(<span key="location">{personal.location}</span>);
  }
  if (personal.linkedin) {
    contactParts.push(
      <a
        key="linkedin"
        href={
          personal.linkedin.startsWith("http")
            ? personal.linkedin
            : `https://${personal.linkedin}`
        }
      >
        {personal.linkedin}
      </a>
    );
  }
  if (personal.github) {
    contactParts.push(
      <a
        key="github"
        href={
          personal.github.startsWith("http")
            ? personal.github
            : `https://${personal.github}`
        }
      >
        {personal.github}
      </a>
    );
  }
  if (personal.portfolio) {
    contactParts.push(
      <a
        key="portfolio"
        href={
          personal.portfolio.startsWith("http")
            ? personal.portfolio
            : `https://${personal.portfolio}`
        }
      >
        {personal.portfolio}
      </a>
    );
  }
  if (personal.otherLinks) {
    personal.otherLinks.forEach((link, i) => {
      contactParts.push(
        <a key={`other-${i}`} href={link.url}>
          {link.label}
        </a>
      );
    });
  }

  return (
    <header className="resume-header">
      <h1 className={theme.nameCase === "uppercase" ? "name-uppercase" : ""}>
        {personal.fullName}
      </h1>
      {personal.professionalTitle && (
        <p className="professional-title">{personal.professionalTitle}</p>
      )}
      {contactParts.length > 0 && (
        <p className="contact-line">
          {contactParts.map((part, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="contact-sep">{sep}</span>}
              {part}
            </React.Fragment>
          ))}
        </p>
      )}
      {theme.showHeaderRule && <hr className="header-rule" />}
    </header>
  );
}
