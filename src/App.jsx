import { useEffect, useState } from 'react';

const stats = [
  { value: '3+', label: 'Applied AI projects' },
  { value: '8.06', label: 'B.Tech CGPA' },
  { value: '2', label: 'Major end-to-end builds' },
];

const skills = [
  'Python', 'FastAPI', 'React', 'Vite', 'Tailwind CSS', 'Gemini', 'Agentic AI', 'Astra DB', 'DuckDB', 'BigQuery', 'ML', 'Deep Learning'
];

const projects = [
  {
    title: 'MedSwap',
    tag: 'RAG + AI Assistant',
    description:
      'Built a medicine substitution assistant for Indian patients with grounded responses, embeddings, and a FastAPI + React experience.',
  },
  {
    title: 'GNIEM',
    tag: 'Geopolitical Intelligence',
    description:
      'Developed a cost-optimized forecasting and anomaly detection dashboard using DuckDB, BigQuery, Prophet, and clustering methods.',
  },
  {
    title: 'Education & Certifications',
    tag: 'Academic Background',
    description:
      'Completed B.Tech in Computer Science and Engineering at Navrachana University and earned AWS Academy certifications.',
  },
];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <div className="page-shell">
      <div className="background-orb orb-one" />
      <div className="background-orb orb-two" />

      <header className="topbar">
        <a className="brand" href="#home">
          Abhyuday<span>.</span>
        </a>

        <button
          className="menu-toggle"
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <a href="#about" onClick={() => setMenuOpen(false)}>
            About
          </a>
          <a href="#projects" onClick={() => setMenuOpen(false)}>
            Projects
          </a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>
            Contact
          </a>
        </nav>
      </header>

      <main id="home">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Portfolio · AI, Data Engineering & Software Development</p>
            <h1>Building thoughtful AI systems that create real impact.</h1>
            <p className="hero-text">
              I’m a final-year Computer Science student focused on machine learning, data engineering, and AI application development. I enjoy turning ideas into dependable products that are practical, scalable, and user-centered.
            </p>
            <div className="hero-actions">
              <a className="btn btn-primary" href="#projects">
                View Projects
              </a>
              <a className="btn btn-secondary" href="#contact">
                Let’s Connect
              </a>
            </div>

            <div className="hero-stats">
              {stats.map((item) => (
                <div key={item.label} className="stat-card">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <aside className="hero-card" aria-label="Profile preview">
            <div className="avatar">AR</div>
            <h2>Abhyuday Rakam</h2>
            <p>
              Focused on AI systems, data pipelines, and scalable development with hands-on experience building end-to-end solutions.
            </p>
            <div className="chip-row">
              <span>Python</span>
              <span>Machine Learning</span>
              <span>Agentic AI</span>
            </div>
          </aside>
        </section>

        <section id="about" className="section">
          <div className="section-heading">
            <p className="eyebrow">About me</p>
            <h2>Bridging technical depth with practical problem-solving.</h2>
          </div>

          <div className="about-grid">
            <article className="about-card">
              <p>
                I am a final-year Computer Science and Engineering student with hands-on experience in machine learning, deep learning, and data engineering. My work centers on building AI-powered systems that solve practical problems with clarity and reliability.
              </p>
              <p>
                I’m especially interested in creating intelligent applications and data workflows that make advanced technology more accessible and valuable in real-world contexts.
              </p>
            </article>

            <article className="about-card highlight-card">
              <h3>What I bring</h3>
              <ul>
                <li>Machine learning and deep learning</li>
                <li>Data engineering and analytics</li>
                <li>Scalable AI application development</li>
              </ul>
            </article>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <p className="eyebrow">Skills</p>
            <h2>Core skills and technical strengths.</h2>
          </div>
          <div className="skills-list">
            {skills.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        </section>

        <section id="projects" className="section">
          <div className="section-heading">
            <p className="eyebrow">Selected work</p>
            <h2>Projects that reflect my focus on AI, data, and intelligent systems.</h2>
          </div>

          <div className="project-grid">
            {projects.map((project) => (
              <article key={project.title} className="project-card">
                <div className="project-top">
                  <h3>{project.title}</h3>
                  <span>{project.tag}</span>
                </div>
                <p>{project.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="contact" className="section contact-section">
          <div className="contact-card">
            <p className="eyebrow">Contact</p>
            <h2>Let’s connect and build something meaningful.</h2>
            <p>
              I’m open to opportunities in AI, data engineering, machine learning, and software development where I can contribute with curiosity, discipline, and hands-on implementation.
            </p>
            <a className="btn btn-primary" href="mailto:abhyuday.rakam@nuv.ac.in">
              abhyuday.rakam@nuv.ac.in
            </a>
          </div>
        </section>
      </main>

      <footer>
        <p>© {year} Abhyuday Rakam. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
