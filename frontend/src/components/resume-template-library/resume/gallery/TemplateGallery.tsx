import React, { useState } from "react";
import { sampleResume } from "../data/sampleResume";
import {
  resumeTemplates,
  TEMPLATE_CATEGORIES,
  TemplateMeta,
} from "../templateRegistry";
import "../styles/base.css";
import "./gallery.css";

interface TemplateGalleryProps {
  /** Called with the chosen template id when the user clicks "Use this template". */
  onSelectTemplate?: (templateId: string) => void;
}

/**
 * Renders all 16 templates, grouped by category, using the shared
 * sample resume data so visual differences are easy to compare.
 * Each card has a "Use this template" action that reports the chosen
 * template id back to the host app (e.g. to persist on a job
 * application / resume record).
 */
export default function TemplateGallery({
  onSelectTemplate,
}: TemplateGalleryProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (template: TemplateMeta) => {
    setSelectedId(template.id);
    onSelectTemplate?.(template.id);
  };

  return (
    <div className="template-gallery template-gallery-chrome">
      <h1 className="gallery-title">Resume Templates</h1>
      <p className="gallery-subtitle">
        16 ATS-friendly templates across 4 categories. All templates share
        the same resume data and differ only in typography, spacing, and
        section-heading treatment.
      </p>

      {TEMPLATE_CATEGORIES.map((category) => {
        const templates = resumeTemplates.filter(
          (t) => t.category === category.id
        );

        return (
          <section key={category.id} className="gallery-category">
            <h2 className="gallery-category-title">{category.label}</h2>
            <div className="gallery-grid">
              {templates.map((template) => {
                const TemplateComponent = template.component;
                const isSelected = selectedId === template.id;

                return (
                  <div
                    key={template.id}
                    className={`gallery-card${isSelected ? " gallery-card-selected" : ""}`}
                  >
                    <div className="gallery-card-preview">
                      <div className="gallery-card-preview-scale">
                        <TemplateComponent resume={sampleResume} />
                      </div>
                    </div>
                    <div className="gallery-card-footer">
                      <div className="gallery-card-name">{template.name}</div>
                      <div className="gallery-card-description">
                        {template.description}
                      </div>
                      <button
                        type="button"
                        className="gallery-card-button"
                        onClick={() => handleSelect(template)}
                      >
                        Use this template
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
