import React, { useState } from "react";
import { ResumeData } from "./data/resumeTypes";
import { sampleResume } from "./data/sampleResume";
import { getTemplateById, resumeTemplates } from "./templateRegistry";
import TemplateGallery from "./gallery/TemplateGallery";

/**
 * ExampleUsage.tsx
 *
 * Shows the two integration patterns this library supports:
 *
 * 1. Dynamic selection by templateId (e.g. stored on a Django
 *    ResumeApplication model as a string field).
 * 2. Browsing all templates via the gallery and letting the user
 *    pick one, then rendering it with the applicant's real AI-generated
 *    resume JSON.
 */

/** Pattern 1: render a specific template by id, e.g. from an API response. */
export function ResumePreviewById({
  resume,
  templateId,
}: {
  resume: ResumeData;
  templateId: string;
}) {
  const template = getTemplateById(templateId);

  if (!template) {
    // Fall back to a sensible default rather than rendering nothing.
    const fallback = resumeTemplates[0];
    const FallbackComponent = fallback.component;
    return <FallbackComponent resume={resume} />;
  }

  const TemplateComponent = template.component;
  return <TemplateComponent resume={resume} />;
}

/** Pattern 2: full gallery flow - browse, pick, then preview with real data. */
export function ResumeBuilderFlow({ resume }: { resume: ResumeData }) {
  const [templateId, setTemplateId] = useState<string | null>(null);

  if (!templateId) {
    return <TemplateGallery onSelectTemplate={setTemplateId} />;
  }

  return (
    <div>
      <button type="button" onClick={() => setTemplateId(null)}>
        &larr; Back to templates
      </button>
      <ResumePreviewById resume={resume} templateId={templateId} />
    </div>
  );
}

/** Minimal app entry point wiring the sample data in for local testing. */
export default function ExampleApp() {
  return <ResumeBuilderFlow resume={sampleResume} />;
}
