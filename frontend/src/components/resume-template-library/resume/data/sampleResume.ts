import { ResumeData } from "./resumeTypes";

/**
 * sampleResume.ts
 *
 * Realistic fictional resume used to preview all 16 templates with the
 * same content so visual differences are easy to compare.
 */
export const sampleResume: ResumeData = {
  personal: {
    fullName: "Sarah Chen",
    professionalTitle: "Senior Product Manager",
    email: "sarah.chen@example.com",
    phone: "+1 (415) 555-0142",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/sarahchen",
    github: "github.com/sarahchen",
    portfolio: "sarahchen.dev",
  },

  summary:
    "Product leader with 8+ years driving growth and platform strategy for B2B SaaS products. Led cross-functional teams of up to 20 engineers and designers to ship products generating $40M+ in annual recurring revenue. Skilled at translating ambiguous business problems into shipped, measurable outcomes.",

  experience: [
    {
      company: "Northwind Analytics",
      position: "Senior Product Manager",
      location: "San Francisco, CA",
      startDate: "Mar 2022",
      current: true,
      bullets: [
        "Led the redesign of the core analytics dashboard, increasing weekly active users by 34% within two quarters.",
        "Defined and shipped a self-serve onboarding flow that reduced time-to-first-value from 9 days to 36 hours.",
        "Partnered with engineering leadership to launch a usage-based pricing model, growing net revenue retention from 104% to 121%.",
        "Managed a roadmap across 4 squads and 22 engineers, reprioritizing quarterly based on customer research and revenue impact.",
      ],
    },
    {
      company: "Beacon Software",
      position: "Product Manager",
      location: "San Francisco, CA",
      startDate: "Jun 2019",
      endDate: "Feb 2022",
      bullets: [
        "Owned the notifications and collaboration platform used by 500,000+ monthly active users.",
        "Ran 40+ customer interviews to validate a new commenting feature, resulting in a 19% lift in daily engagement.",
        "Introduced a lightweight experimentation framework adopted by 6 product teams company-wide.",
      ],
    },
    {
      company: "Fieldstone Digital",
      position: "Associate Product Manager",
      location: "Oakland, CA",
      startDate: "Jul 2017",
      endDate: "May 2019",
      bullets: [
        "Shipped the first version of an internal reporting tool that saved the operations team 15 hours per week.",
        "Coordinated with design and QA to reduce release-blocking bugs by 45% over one year.",
      ],
    },
  ],

  education: [
    {
      institution: "University of California, Berkeley",
      degree: "B.S.",
      field: "Business Administration",
      location: "Berkeley, CA",
      startDate: "2013",
      endDate: "2017",
      details: ["Minor in Data Science", "Dean's List, 4 semesters"],
    },
  ],

  skills: [
    {
      category: "Product",
      skills: [
        "Roadmapping",
        "A/B Testing",
        "User Research",
        "Pricing Strategy",
        "OKRs",
      ],
    },
    {
      category: "Technical",
      skills: ["SQL", "Amplitude", "Figma", "Jira", "Looker"],
    },
    {
      category: "Leadership",
      skills: [
        "Cross-functional Leadership",
        "Stakeholder Management",
        "Mentorship",
      ],
    },
  ],

  projects: [
    {
      name: "Internal Pricing Simulator",
      description:
        "Self-directed tool used by finance and product teams to model pricing changes before rollout.",
      technologies: ["Python", "SQL", "Streamlit"],
      bullets: [
        "Built a simulation model adopted by finance to evaluate 3 major pricing changes.",
      ],
    },
  ],

  certifications: [
    {
      name: "Certified Scrum Product Owner (CSPO)",
      issuer: "Scrum Alliance",
      date: "2020",
    },
    {
      name: "Pragmatic Institute Product Management Certification",
      issuer: "Pragmatic Institute",
      date: "2019",
    },
  ],

  awards: [
    {
      name: "Product Team of the Year",
      issuer: "Northwind Analytics",
      date: "2023",
      description:
        "Awarded to the top-performing product team based on revenue impact and customer satisfaction scores.",
    },
  ],

  publications: [],

  volunteerExperience: [
    {
      organization: "Product for Good",
      role: "Volunteer Mentor",
      startDate: "2021",
      endDate: "Present",
      bullets: [
        "Mentor early-career product managers from underrepresented backgrounds.",
      ],
    },
  ],

  languages: [
    { language: "English", proficiency: "Native" },
    { language: "Mandarin", proficiency: "Professional working proficiency" },
  ],

  memberships: [
    {
      organization: "Product Management Association",
      role: "Member",
      startDate: "2019",
    },
  ],
};

/**
 * A minimal variant of the sample resume with many optional sections
 * omitted. Useful for testing that templates correctly hide empty
 * sections instead of rendering blank headings.
 */
export const sampleResumeMinimal: ResumeData = {
  personal: {
    fullName: "Marcus Rivera",
    professionalTitle: "Software Engineer",
    email: "marcus.rivera@example.com",
    phone: "+1 (312) 555-0198",
    location: "Chicago, IL",
    github: "github.com/mrivera",
  },
  experience: [
    {
      company: "Lakeside Systems",
      position: "Software Engineer",
      startDate: "2021",
      current: true,
      bullets: [
        "Built and maintained backend services in Django and PostgreSQL.",
        "Reduced API latency by 28% through query optimization and caching.",
      ],
    },
  ],
  education: [
    {
      institution: "University of Illinois at Chicago",
      degree: "B.S.",
      field: "Computer Science",
      endDate: "2021",
    },
  ],
  skills: [
    { category: "Languages", skills: ["Python", "TypeScript", "SQL"] },
  ],
};
