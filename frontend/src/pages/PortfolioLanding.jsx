const projects = [
  {
    title: 'Recruitment Tracker',
    description:
      'Full-stack app for candidate pipelines, tagging, and automated reminders.',
    stack: ['React', 'Node', 'MongoDB'],
  },
  {
    title: 'DevHire Portal',
    description:
      'Job board with role matching, saved searches, and analytics dashboard.',
    stack: ['Express', 'Redux', 'Charting'],
  },
  {
    title: 'Storefront Builder',
    description:
      'Drag-and-drop product pages with payments, SEO, and inventory sync.',
    stack: ['MERN', 'Stripe', 'Cloud Storage'],
  },
  {
    title: 'Study Sprint',
    description:
      'Pomodoro + DSA tracker with streaks, insights, and smart reminders.',
    stack: ['React', 'Node', 'Postgres'],
  },
  {
    title: 'Ops Monitor',
    description:
      'Real-time uptime dashboard with alert rules and incident timelines.',
    stack: ['WebSockets', 'MongoDB', 'Node'],
  },
  {
    title: 'Portfolio Studio',
    description:
      'Fast landing pages for creators with CMS editing and analytics.',
    stack: ['Next.js', 'API', 'Vercel'],
  },
]

const skills = [
  {
    title: 'Core',
    items: ['MERN Stack', 'REST APIs', 'Auth & Security', 'State Management'],
  },
  {
    title: 'Computer Science',
    items: ['DSA', 'OOP', 'Operating Systems', 'Database Design'],
  },
  {
    title: 'Workflow',
    items: ['Agile Delivery', 'Testing', 'CI/CD', 'GitHub Actions'],
  },
]

function PortfolioLanding() {
  return (
    <div className="page">
      <header className="nav">
        <div className="logo">Ayush.dev</div>
        <nav className="nav-links">
          <a href="#projects">Projects</a>
          <a href="#skills">Skills</a>
          <a href="#process">Process</a>
          <a href="#contact">Contact</a>
        </nav>
        <a className="nav-cta" href="#contact">
          Book a call
        </a>
      </header>

      <main>
        <section className="hero">
          <div className="hero-content">
            <p className="eyebrow">MERN Stack Developer</p>
            <h1 className="headline">
              I build crisp, responsive web products that feel effortless.
            </h1>
            <p className="subhead">
              Full-stack builder focused on performance, clean UX, and shipping
              fast. I turn ideas into reliable web experiences for startups and
              growing teams.
            </p>
            <div className="hero-actions">
              <a className="primary-btn" href="#projects">
                View projects
              </a>
              <a className="ghost-btn" href="#contact">
                Get a quote
              </a>
            </div>
            <div className="hero-meta">
              <div className="meta-block">
                <span className="meta-number">6+</span>
                <span className="meta-label">Projects shipped</span>
              </div>
              <div className="meta-block">
                <span className="meta-number">MERN</span>
                <span className="meta-label">Specialist</span>
              </div>
              <div className="meta-block">
                <span className="meta-number">3 days</span>
                <span className="meta-label">Avg. prototype</span>
              </div>
            </div>
          </div>
          <div className="hero-card">
            <div className="hero-card-header">
              <span>Currently available</span>
              <span className="status-dot" />
            </div>
            <div className="hero-card-body">
              <h3>Let us build your next product</h3>
              <p>
                Landing pages, dashboards, and full platforms built with modern
                tooling and a sharp eye for detail.
              </p>
              <div className="tech-stack">
                <span>React</span>
                <span>Node</span>
                <span>MongoDB</span>
                <span>Express</span>
              </div>
              <a className="secondary-btn" href="#contact">
                Start a project
              </a>
            </div>
          </div>
        </section>

        <section className="strip">
          <div className="strip-item reveal" style={{ '--delay': '0.1s' }}>
            Product-minded engineering
          </div>
          <div className="strip-item reveal" style={{ '--delay': '0.2s' }}>
            Clean architecture & maintainable code
          </div>
          <div className="strip-item reveal" style={{ '--delay': '0.3s' }}>
            Fast delivery with weekly checkpoints
          </div>
        </section>

        <section className="section" id="projects">
          <div className="section-header">
            <h2>Selected projects</h2>
            <p>Case studies across products, dashboards, and SaaS.</p>
          </div>
          <div className="grid projects-grid">
            {projects.map((project) => (
              <article className="card project-card" key={project.title}>
                <div className="card-top">
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                </div>
                <div className="tag-row">
                  {project.stack.map((tech) => (
                    <span className="tag" key={tech}>
                      {tech}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section" id="skills">
          <div className="section-header">
            <h2>Skills & strengths</h2>
            <p>Technical depth with strong product instincts.</p>
          </div>
          <div className="grid skills-grid">
            {skills.map((group) => (
              <article className="card" key={group.title}>
                <h3>{group.title}</h3>
                <ul>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="section process" id="process">
          <div className="section-header">
            <h2>My process</h2>
            <p>Clear stages so you always know what happens next.</p>
          </div>
          <div className="grid process-grid">
            <div className="card">
              <h3>1. Discover</h3>
              <p>
                We define the goals, audience, and core feature set with a quick
                strategy session.
              </p>
            </div>
            <div className="card">
              <h3>2. Design</h3>
              <p>
                Wireframes to polished UI, focused on conversion, usability,
                and clarity.
              </p>
            </div>
            <div className="card">
              <h3>3. Build</h3>
              <p>
                Fast, modular delivery with clean components and scalable data
                models.
              </p>
            </div>
            <div className="card">
              <h3>4. Launch</h3>
              <p>
                QA, deployment, and ongoing support so your product stays sharp.
              </p>
            </div>
          </div>
        </section>

        <section className="section contact" id="contact">
          <div className="contact-card">
            <div>
              <p className="eyebrow">Let us work together</p>
              <h2>Ready to build something beautiful?</h2>
              <p className="contact-text">
                Tell me about your project, timeline, and goals. I will respond
                within 24 hours.
              </p>
            </div>
            <div className="contact-actions">
              <a className="primary-btn" href="mailto:hello@ayush.dev">
                hello@ayush.dev
              </a>
              <a className="ghost-btn" href="tel:+910000000000">
                +91 00000 00000
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>2026 Ayush. Built with React + MERN.</p>
        <div className="footer-links">
          <a href="https://github.com/">GitHub</a>
          <a href="https://www.linkedin.com/">LinkedIn</a>
          <a href="https://www.behance.net/">Behance</a>
        </div>
      </footer>
    </div>
  )
}

export default PortfolioLanding
