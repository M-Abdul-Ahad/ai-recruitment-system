/**
 * Mock Data for AI Resume Shortlisting & Candidate Evaluation
 * Used for high-fidelity UI demonstration with zero backend dependency.
 */

export const MOCK_JOBS = [
  {
    id: 1,
    title: "Senior Full-Stack Engineer",
    department: "Engineering",
    location: "Remote (US/EU)",
    type: "Full-Time",
    experienceRequired: "4+ years",
    minEducation: "Bachelor's in CS / Software Eng",
    status: "ACTIVE",
    candidatesCount: 14,
    shortlistedCount: 4,
    skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "Docker", "RESTful APIs", "AWS"],
    description: "Looking for an experienced Full-Stack Engineer to architect high-throughput web applications, design clean RESTful microservices, and collaborate in an agile, product-driven culture."
  },
  {
    id: 2,
    title: "AI & ML Systems Engineer",
    department: "AI Research",
    location: "San Francisco, CA (Hybrid)",
    type: "Full-Time",
    experienceRequired: "3+ years",
    minEducation: "Master's or Ph.D. in Computer Science/AI",
    status: "ACTIVE",
    candidatesCount: 9,
    shortlistedCount: 2,
    skills: ["Python", "PyTorch", "LLMs", "Vector Databases", "FastAPI", "Transformers", "LangChain"],
    description: "Seeking a specialist to build generative AI pipelines, fine-tune open-weight models, implement vector retrieval (RAG), and optimize inference latency."
  },
  {
    id: 3,
    title: "Lead Product Designer (UI/UX)",
    department: "Product Design",
    location: "New York, NY (Remote)",
    type: "Full-Time",
    experienceRequired: "5+ years",
    minEducation: "Bachelor's in Design or HCI",
    status: "ACTIVE",
    candidatesCount: 18,
    shortlistedCount: 5,
    skills: ["Figma", "Design Systems", "User Research", "Prototyping", "Information Architecture", "Usability Testing"],
    description: "Drive the design vision across mobile and web interfaces. Create scalable design token libraries, conduct usability tests, and translate user feedback into high-fidelity interactions."
  },
  {
    id: 4,
    title: "Cloud Infrastructure & DevOps Architect",
    department: "DevOps & SRE",
    location: "Austin, TX (Remote)",
    type: "Full-Time",
    experienceRequired: "5+ years",
    minEducation: "Bachelor's in CS or equivalent",
    status: "ACTIVE",
    candidatesCount: 8,
    shortlistedCount: 3,
    skills: ["AWS", "Kubernetes", "Terraform", "CI/CD", "Prometheus", "Docker", "Linux"],
    description: "Design multi-region infrastructure on AWS using Terraform. Maintain Kubernetes clusters, ensure 99.99% uptime, and optimize cloud expenditure."
  }
];

export const MOCK_CANDIDATES = [
  {
    id: 1,
    jobId: 1,
    name: "Sarah Jenkins",
    roleTitle: "Senior Full-Stack Developer",
    email: "sarah.jenkins@devmail.io",
    phone: "+1 (555) 234-5678",
    location: "Seattle, WA",
    avatarBg: "bg-emerald-600 text-white",
    initials: "SJ",
    source: "EXTERNAL_UPLOAD", // Uploaded Resume
    fileName: "Sarah_Jenkins_FullStack_2026.pdf",
    appliedDate: "Oct 6, 2026",
    status: "SHORTLISTED",
    overallScore: 94,
    tier: "Top Match (Strong Hire)",
    subScores: {
      semantic: 96,
      skills: 92,
      experience: 95,
      education: 90
    },
    experienceYears: 5.5,
    education: "B.S. in Software Engineering, Univ. of Washington",
    currentCompany: "TechCorp Labs (3 yrs)",
    matchedSkills: ["React", "TypeScript", "Node.js", "PostgreSQL", "Docker", "RESTful APIs"],
    missingSkills: ["AWS"],
    bonusSkills: ["Next.js", "GraphQL", "Redis", "Jest & Playwright", "Tailwind CSS"],
    aiSummary: "Outstanding full-stack candidate with deep React & TypeScript expertise. Demonstrates strong microfrontend architecture, robust PostgreSQL schema design, and clean unit testing practices. Slight gap in native AWS cloud deployments.",
    strengths: [
      "Over 5 years of production experience architecting scalable React & TypeScript frontends with 99.9% uptime",
      "Robust backend foundation in Node.js, async processing, and optimized PostgreSQL database indexing",
      "Proven leadership mentoring junior engineers and standardizing testing conventions across agile sprints"
    ],
    concerns: [
      "Limited direct exposure to AWS Terraform scripting (has relied primarily on Docker container workflows)",
      "Target compensation is towards the higher end of the requisition range"
    ],
    interviewQuestions: [
      {
        question: "How do you handle client-side caching and state synchronization across multiple independent microfrontends?",
        lookFor: "Mentions TanStack/React Query, optimistic updates, cache invalidation strategies, and cross-tab storage."
      },
      {
        question: "Walk us through an instance where you identified and resolved an N+1 query bottleneck in PostgreSQL using Node.js.",
        lookFor: "Discusses EXPLAIN ANALYZE, query profiling, DataLoader or join batching, and index optimization."
      },
      {
        question: "What is your approach to containerizing microservices with Docker and setting up reproducible local environments?",
        lookFor: "Mentions multi-stage Dockerfiles, docker-compose orchestration, volume mounts, and secret handling."
      }
    ],
    experienceTimeline: [
      {
        role: "Senior Full-Stack Engineer",
        company: "TechCorp Labs",
        period: "2023 - Present (3 yrs)",
        description: "Architected enterprise React/TypeScript dashboards processing 500k+ daily events. Built Node.js microservices with PostgreSQL and Redis caching. Reduced average page load by 48%."
      },
      {
        role: "Full-Stack Software Developer",
        company: "Nexus Software Inc.",
        period: "2021 - 2023 (2 yrs)",
        description: "Implemented RESTful API endpoints, payment gateway integrations with Stripe, and role-based access control (RBAC). Migrated legacy jQuery portal to modern React SPA."
      },
      {
        role: "Software Engineering Intern",
        company: "Pacific CodeWorks",
        period: "2020 - 2021 (1 yr)",
        description: "Developed internal reporting tools using React and Node.js. Collaborated on CI/CD pipeline automation with GitHub Actions."
      }
    ],
    recruiterNotes: "Initial screen completed. Exceptional clarity when explaining distributed state management. Enthusiastic about the team's roadmap. High priority for technical interview."
  },
  {
    id: 2,
    jobId: 1,
    name: "Alex Rivera",
    roleTitle: "Full-Stack Engineer",
    email: "alex.rivera@codenet.dev",
    phone: "+1 (555) 345-6789",
    location: "Austin, TX",
    avatarBg: "bg-blue-600 text-white",
    initials: "AR",
    source: "DIRECT_APPLICANT",
    fileName: "Alex_Rivera_Resume.pdf",
    appliedDate: "Oct 5, 2026",
    status: "SHORTLISTED",
    overallScore: 88,
    tier: "Strong Match",
    subScores: {
      semantic: 89,
      skills: 90,
      experience: 85,
      education: 88
    },
    experienceYears: 4.2,
    education: "M.S. in Computer Science, UT Austin",
    currentCompany: "Skyline Data Systems (2 yrs)",
    matchedSkills: ["React", "TypeScript", "Node.js", "Docker", "RESTful APIs", "AWS"],
    missingSkills: ["PostgreSQL"],
    bonusSkills: ["MongoDB", "Express", "Kubernetes", "GraphQL"],
    aiSummary: "Strong full-stack engineer with excellent AWS and Docker container experience. Very solid React front-end skills. Uses NoSQL (MongoDB) heavily, but has foundational relational database knowledge.",
    strengths: [
      "Extensive experience deploying containerized Node.js services directly to AWS ECS and Lambda",
      "Strong TypeScript proficiency with strict typings and modular component libraries",
      "Holds an AWS Certified Developer Associate certification"
    ],
    concerns: [
      "Primary database experience is MongoDB/DynamoDB rather than relational PostgreSQL",
      "Slightly fewer years in pure senior leadership roles"
    ],
    interviewQuestions: [
      {
        question: "How do you evaluate whether a relational model (PostgreSQL) or document model (MongoDB) is optimal for a new feature?",
        lookFor: "Touches on ACID transactions, schema volatility, query patterns, indexing complexity, and consistency guarantees."
      },
      {
        question: "Describe your experience deploying Node.js apps on AWS using containers or serverless.",
        lookFor: "Mentions AWS ECS, Fargate, Docker container lifecycle, CloudWatch telemetry, and IAM roles."
      }
    ],
    experienceTimeline: [
      {
        role: "Full-Stack Cloud Engineer",
        company: "Skyline Data Systems",
        period: "2024 - Present (2 yrs)",
        description: "Built real-time telemetry dashboards in React & TypeScript. Maintained backend REST APIs on AWS Fargate with automated deployment triggers."
      },
      {
        role: "Software Engineer",
        company: "Vanguard Apps",
        period: "2022 - 2024 (2 yrs)",
        description: "Developed frontend user flows in React. Wrote REST APIs in Node.js and integrated third-party identity providers."
      }
    ],
    recruiterNotes: "Solid profile, AWS skills are a huge plus for our team. Need to verify PostgreSQL comfort level in technical round."
  },
  {
    id: 3,
    jobId: 1,
    name: "David Chen",
    roleTitle: "Backend-Leaning Full Stack Engineer",
    email: "david.chen@cloudsystems.org",
    phone: "+1 (555) 456-7890",
    location: "Chicago, IL",
    avatarBg: "bg-teal-600 text-white",
    initials: "DC",
    source: "DIRECT_APPLICANT",
    fileName: "DavidChen_CV_Final.pdf",
    appliedDate: "Oct 4, 2026",
    status: "SHORTLISTED",
    overallScore: 82,
    tier: "Good Match",
    subScores: {
      semantic: 84,
      skills: 81,
      experience: 88,
      education: 75
    },
    experienceYears: 6.0,
    education: "B.S. in Computer Engineering, UIUC",
    currentCompany: "FinTech Grid (3 yrs)",
    matchedSkills: ["Node.js", "PostgreSQL", "Docker", "RESTful APIs", "AWS"],
    missingSkills: ["TypeScript"],
    bonusSkills: ["Python", "Golang", "Microservices", "Kafka", "Redis"],
    aiSummary: "Senior backend developer with strong PostgreSQL, Docker, and distributed systems experience. Familiar with React in JavaScript, but has less recent production TypeScript experience.",
    strengths: [
      "Over 6 years designing robust high-volume financial backend systems and RESTful APIs",
      "Deep database tuning expertise in PostgreSQL query planning, partitioning, and replication",
      "Production experience with distributed message brokers (Kafka/RabbitMQ)"
    ],
    concerns: [
      "TypeScript experience is self-reported as basic/intermediate; primary stack has been Vanilla JS & Go",
      "Frontend styling and modern UI framework familiarity is less developed"
    ],
    interviewQuestions: [
      {
        question: "How would you quickly ramp up on TypeScript's advanced type system, generics, and compiler configurations?",
        lookFor: "Confidence in typed paradigms from Golang/Java, understanding of interfaces, utility types, and strict mode."
      }
    ],
    experienceTimeline: [
      {
        role: "Senior Backend Engineer",
        company: "FinTech Grid",
        period: "2023 - Present (3 yrs)",
        description: "Scaled backend transaction processing engine using Node.js and PostgreSQL. Managed database failover clusters."
      },
      {
        role: "Software Developer",
        company: "Apex Ledger",
        period: "2020 - 2023 (3 yrs)",
        description: "Maintained RESTful APIs and built internal back-office portals with React."
      }
    ],
    recruiterNotes: "Candidate has stellar backend & database credentials. Would be fantastic if paired with strong frontend peer."
  },
  {
    id: 4,
    jobId: 1,
    name: "Priya Sharma",
    roleTitle: "Frontend / React Specialist",
    email: "priya.sharma@webcraft.co",
    phone: "+1 (555) 567-8901",
    location: "Toronto, ON (Remote)",
    avatarBg: "bg-amber-600 text-white",
    initials: "PS",
    source: "EXTERNAL_UPLOAD",
    fileName: "Priya_Sharma_Resume.pdf",
    appliedDate: "Oct 3, 2026",
    status: "APPLIED",
    overallScore: 74,
    tier: "Moderate Fit",
    subScores: {
      semantic: 78,
      skills: 75,
      experience: 70,
      education: 73
    },
    experienceYears: 3.5,
    education: "B.S. in Information Technology, York Univ",
    currentCompany: "PixelCraft Agency (2 yrs)",
    matchedSkills: ["React", "TypeScript", "RESTful APIs"],
    missingSkills: ["Node.js", "PostgreSQL", "Docker", "AWS"],
    bonusSkills: ["Next.js", "Redux", "Tailwind CSS", "Figma", "Web Performance"],
    aiSummary: "Talented frontend engineer with stellar React, TypeScript, and web accessibility fundamentals. Lacks required depth in backend services, database operations, and container orchestration.",
    strengths: [
      "World-class UI engineering with pixel-perfect responsive layouts and high Lighthouse scores",
      "Strong TypeScript component architecture and unit testing with Vitest/Testing Library"
    ],
    concerns: [
      "Minimal experience building Node.js microservices or interacting with SQL databases",
      "Total experience is 3.5 years, slightly under the 4+ year requirement"
    ],
    interviewQuestions: [
      {
        question: "Have you ever built or maintained backend API routes or database models in Node.js?",
        lookFor: "Awareness of Express/NestJS, basic ORM knowledge (Prisma/TypeORM), and willingness to learn."
      }
    ],
    experienceTimeline: [
      {
        role: "Frontend Engineer",
        company: "PixelCraft Agency",
        period: "2024 - Present (2 yrs)",
        description: "Created client web applications with React, Next.js, and TypeScript."
      },
      {
        role: "Junior Web Developer",
        company: "Launchpad Creative",
        period: "2022 - 2024 (1.5 yrs)",
        description: "Converted Figma wireframes into responsive React web pages."
      }
    ],
    recruiterNotes: "Very strong frontend resume. Could be considered for a pure frontend opening if one becomes available."
  },
  {
    id: 5,
    jobId: 1,
    name: "Marcus Vance",
    roleTitle: "Junior Software Developer",
    email: "marcus.vance@mailhub.net",
    phone: "+1 (555) 678-9012",
    location: "Denver, CO",
    avatarBg: "bg-purple-600 text-white",
    initials: "MV",
    source: "DIRECT_APPLICANT",
    fileName: "Marcus_Vance_Dev.pdf",
    appliedDate: "Oct 2, 2026",
    status: "APPLIED",
    overallScore: 61,
    tier: "Borderline Fit",
    subScores: {
      semantic: 64,
      skills: 60,
      experience: 55,
      education: 65
    },
    experienceYears: 2.0,
    education: "B.A. in Computer Science, Univ of Colorado",
    currentCompany: "Junior at StarterApp (1.5 yrs)",
    matchedSkills: ["React", "Node.js", "RESTful APIs"],
    missingSkills: ["TypeScript", "PostgreSQL", "Docker", "AWS"],
    bonusSkills: ["JavaScript", "HTML/CSS", "Git", "Bootstrap"],
    aiSummary: "Early career developer with basic full-stack experience in React and Node.js. Lacks the seniority, TypeScript proficiency, and database complexity required for this senior position.",
    strengths: [
      "Demonstrates high enthusiasm and fast learning curve",
      "Clean code habits and solid Git workflow understanding"
    ],
    concerns: [
      "Only 2 years total experience (role requires senior 4+ years)",
      "Has not worked with TypeScript, Docker, or relational database optimization in production"
    ],
    interviewQuestions: [
      {
        question: "How do you approach debugging unexpected production issues in a distributed system?",
        lookFor: "Structured problem-solving, logging, reproducing bugs locally."
      }
    ],
    experienceTimeline: [
      {
        role: "Junior Software Developer",
        company: "StarterApp Co",
        period: "2024 - Present (1.5 yrs)",
        description: "Assisted senior engineers in bug fixes and simple React frontend features."
      }
    ],
    recruiterNotes: "Promising developer, but significantly below required seniority level for Senior Full-Stack requisition."
  },
  {
    id: 6,
    jobId: 1,
    name: "Elena Rostova",
    roleTitle: "Web Designer & Content Editor",
    email: "elena.rostova@designworks.org",
    phone: "+1 (555) 789-0123",
    location: "Boston, MA",
    avatarBg: "bg-rose-600 text-white",
    initials: "ER",
    source: "EXTERNAL_UPLOAD",
    fileName: "Elena_Rostova_Resume_2026.docx",
    appliedDate: "Oct 1, 2026",
    status: "REJECTED",
    overallScore: 48,
    tier: "Low Match",
    subScores: {
      semantic: 50,
      skills: 42,
      experience: 50,
      education: 50
    },
    experienceYears: 1.5,
    education: "Coding Bootcamp Graduate + B.A. Communications",
    currentCompany: "Freelance (1 yr)",
    matchedSkills: ["RESTful APIs"],
    missingSkills: ["React", "TypeScript", "Node.js", "PostgreSQL", "Docker", "AWS"],
    bonusSkills: ["WordPress", "HTML5", "CSS3", "Photoshop"],
    aiSummary: "Resume emphasizes web content management and CMS site building with WordPress and HTML/CSS. Significant gap in modern full-stack engineering, TypeScript, and microservice architecture.",
    strengths: [
      "Good eye for visual aesthetics and content presentation"
    ],
    concerns: [
      "Missing almost all core technical requirements (React, TypeScript, Node.js, PostgreSQL, Docker)",
      "Does not meet minimum engineering experience bar"
    ],
    interviewQuestions: [],
    experienceTimeline: [
      {
        role: "Freelance Web Designer",
        company: "Self-Employed",
        period: "2024 - Present (1 yr)",
        description: "Configured WordPress templates, created landing pages, styled CSS."
      }
    ],
    recruiterNotes: "Skill set is misaligned with senior software engineering needs. Rejection letter sent."
  },
  {
    id: 7,
    jobId: 1,
    name: "Jordan Miller",
    roleTitle: "Full-Stack Software Engineer",
    email: "jordan.miller@devhub.io",
    phone: "+1 (555) 890-1234",
    location: "Atlanta, GA",
    avatarBg: "bg-indigo-600 text-white",
    initials: "JM",
    source: "EXTERNAL_UPLOAD",
    fileName: "Jordan_Miller_Resume.pdf",
    appliedDate: "Oct 5, 2026",
    status: "APPLIED",
    overallScore: 85,
    tier: "Strong Match",
    subScores: {
      semantic: 87,
      skills: 86,
      experience: 84,
      education: 82
    },
    experienceYears: 4.5,
    education: "B.S. in Computer Science, Georgia Tech",
    currentCompany: "Nexus Platform (2.5 yrs)",
    matchedSkills: ["React", "TypeScript", "Node.js", "PostgreSQL", "RESTful APIs"],
    missingSkills: ["Docker", "AWS"],
    bonusSkills: ["Tailwind CSS", "Prisma", "Vitest"],
    aiSummary: "Well-rounded full-stack developer with solid React and TypeScript skills, paired with clean Node.js backend development. Limited containerization experience in production.",
    strengths: [
      "Consistent 4+ years of TypeScript experience across client and server tiers",
      "Hands-on experience with modern relational ORMs (Prisma, TypeORM) and PostgreSQL"
    ],
    concerns: [
      "Has not managed cloud deployments or Docker configurations independently"
    ],
    interviewQuestions: [
      {
        question: "How do you handle relational database migrations when releasing code to staging vs production?",
        lookFor: "Mentions zero-downtime migrations, rollback strategies, and schema locks."
      }
    ],
    experienceTimeline: [
      {
        role: "Full-Stack Engineer",
        company: "Nexus Platform",
        period: "2023 - Present (2.5 yrs)",
        description: "Built customer-facing dashboards with React & TypeScript. Maintained Node.js microservices."
      }
    ],
    recruiterNotes: "Very promising applicant. Strong coding scores."
  },
  {
    id: 8,
    jobId: 1,
    name: "Maya Lin",
    roleTitle: "Software Developer",
    email: "maya.lin@codecraft.org",
    phone: "+1 (555) 901-2345",
    location: "San Jose, CA",
    avatarBg: "bg-cyan-600 text-white",
    initials: "ML",
    source: "DIRECT_APPLICANT",
    fileName: "MayaLin_FullStack.pdf",
    appliedDate: "Oct 4, 2026",
    status: "APPLIED",
    overallScore: 79,
    tier: "Good Match",
    subScores: {
      semantic: 81,
      skills: 78,
      experience: 76,
      education: 80
    },
    experienceYears: 3.8,
    education: "B.S. in Software Engineering, San Jose State",
    currentCompany: "Silicon App Works (2 yrs)",
    matchedSkills: ["React", "TypeScript", "Node.js", "Docker"],
    missingSkills: ["PostgreSQL", "AWS"],
    bonusSkills: ["GraphQL", "Tailwind CSS", "CI/CD"],
    aiSummary: "Competent software developer with good TypeScript and Docker container skills. Primary database experience is MySQL rather than PostgreSQL.",
    strengths: [
      "Fast feature execution in React and TypeScript",
      "Comfortable with Docker containerization and local dev setups"
    ],
    concerns: [
      "Relational background is mostly MySQL; needs to adapt to PostgreSQL specific patterns"
    ],
    interviewQuestions: [],
    experienceTimeline: [
      {
        role: "Software Developer",
        company: "Silicon App Works",
        period: "2024 - Present (2 yrs)",
        description: "Developed web features with React and Node.js."
      }
    ],
    recruiterNotes: "Solid background, would easily bridge MySQL to Postgres."
  },
  {
    id: 9,
    jobId: 1,
    name: "Brandon Taylor",
    roleTitle: "Frontend Developer",
    email: "brandon.t@webfront.io",
    phone: "+1 (555) 012-3456",
    location: "Miami, FL",
    avatarBg: "bg-amber-700 text-white",
    initials: "BT",
    source: "EXTERNAL_UPLOAD",
    fileName: "Brandon_Taylor_CV.pdf",
    appliedDate: "Oct 3, 2026",
    status: "APPLIED",
    overallScore: 68,
    tier: "Moderate Fit",
    subScores: {
      semantic: 70,
      skills: 67,
      experience: 64,
      education: 72
    },
    experienceYears: 2.5,
    education: "B.S. in Computer Science, FIU",
    currentCompany: "Coastal Digital (2 yrs)",
    matchedSkills: ["React", "RESTful APIs"],
    missingSkills: ["TypeScript", "Node.js", "PostgreSQL", "Docker", "AWS"],
    bonusSkills: ["Next.js", "CSS3", "JavaScript"],
    aiSummary: "React frontend developer with 2.5 years experience. Missing TypeScript, database, and backend requirements.",
    strengths: ["Strong CSS and responsive design skills"],
    concerns: ["Lacks backend and TypeScript seniority"],
    interviewQuestions: [],
    experienceTimeline: [],
    recruiterNotes: "Mid-level frontend profile. Better for frontend opening."
  },
  {
    id: 10,
    jobId: 1,
    name: "Liam O'Connor",
    roleTitle: "Junior Full-Stack Dev",
    email: "liam.oc@devlab.com",
    phone: "+1 (555) 123-9876",
    location: "Philadelphia, PA",
    avatarBg: "bg-stone-600 text-white",
    initials: "LO",
    source: "DIRECT_APPLICANT",
    fileName: "Liam_OConnor_Resume.pdf",
    appliedDate: "Oct 2, 2026",
    status: "APPLIED",
    overallScore: 55,
    tier: "Low Match",
    subScores: {
      semantic: 58,
      skills: 52,
      experience: 50,
      education: 60
    },
    experienceYears: 1.8,
    education: "Bootcamp Certificate + B.A. History",
    currentCompany: "Self-Employed (1.5 yrs)",
    matchedSkills: ["React", "Node.js"],
    missingSkills: ["TypeScript", "PostgreSQL", "Docker", "AWS"],
    bonusSkills: ["MongoDB", "Express"],
    aiSummary: "Early stage junior developer with basic MERN stack knowledge. Does not meet requirements for senior full-stack requisition.",
    strengths: ["Fast learner, active on GitHub"],
    concerns: ["Junior profile, lacks senior systems design experience"],
    interviewQuestions: [],
    experienceTimeline: [],
    recruiterNotes: "Keep on file for future junior openings."
  }
];

export const MOCK_UPLOADED_FILES = [
  { id: "f1", name: "Sarah_Jenkins_FullStack_2026.pdf", size: "1.4 MB", status: "Parsed", progress: 100 },
  { id: "f2", name: "Priya_Sharma_Resume.pdf", size: "820 KB", status: "Parsed", progress: 100 },
  { id: "f3", name: "Elena_Rostova_Resume_2026.docx", size: "450 KB", status: "Parsed", progress: 100 },
  { id: "f4", name: "Candidate_Resumes_Batch_10.zip", size: "8.2 MB", status: "Extracted (3 resumes)", progress: 100 }
];
