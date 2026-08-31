export * from "./data/resumeTypes";
export { sampleResume, sampleResumeMinimal } from "./data/sampleResume";
export {
  resumeTemplates,
  getTemplateById,
  getTemplatesByCategory,
  TEMPLATE_CATEGORIES,
} from "./templateRegistry";
export type { TemplateMeta, TemplateCategory } from "./templateRegistry";
export { default as TemplateGallery } from "./gallery/TemplateGallery";
export { default as ResumeLayout } from "./components/ResumeLayout";

// Individual template components, re-exported for direct use, e.g.
//   import { Classic01 } from "resume";
export { default as Classic01 } from "./templates/classic/Classic01";
export { default as Classic02 } from "./templates/classic/Classic02";
export { default as Classic03 } from "./templates/classic/Classic03";
export { default as Classic04 } from "./templates/classic/Classic04";

export { default as Modern01 } from "./templates/modern/Modern01";
export { default as Modern02 } from "./templates/modern/Modern02";
export { default as Modern03 } from "./templates/modern/Modern03";
export { default as Modern04 } from "./templates/modern/Modern04";

export { default as Executive01 } from "./templates/executive/Executive01";
export { default as Executive02 } from "./templates/executive/Executive02";
export { default as Executive03 } from "./templates/executive/Executive03";
export { default as Executive04 } from "./templates/executive/Executive04";

export { default as Technical01 } from "./templates/technical/Technical01";
export { default as Technical02 } from "./templates/technical/Technical02";
export { default as Technical03 } from "./templates/technical/Technical03";
export { default as Technical04 } from "./templates/technical/Technical04";

export { default as Vibrant01 } from "./templates/vibrant/Vibrant01";
export { default as Vibrant02 } from "./templates/vibrant/Vibrant02";
export { default as Vibrant03 } from "./templates/vibrant/Vibrant03";
export { default as Vibrant04 } from "./templates/vibrant/Vibrant04";

