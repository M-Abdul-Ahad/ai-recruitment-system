import { Link } from "react-router-dom";

const CARDS = [
  {
    to: "/admin/users",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: "User Management",
    desc:  "View, add, edit, and delete users. Assign roles.",
  },
  {
    to: "/admin/roles",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: "Role Management",
    desc:  "Create, rename, and delete system roles.",
  },
  {
    to: "/admin/companies",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="18" rx="2"/><path d="M8 21V9"/><path d="M16 21V9"/>
        <path d="M2 9h20"/>
      </svg>
    ),
    title: "Companies",
    desc:  "View and manage all registered companies.",
  },
  {
    to: "/admin/jobs",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      </svg>
    ),
    title: "Jobs",
    desc:  "Monitor all job postings across the platform.",
  },
];

const AdminDashboard = () => {
  return (
    <div className="apl-animate-fade">
      {/* Page header */}
      <div className="apl-page-header">
        <h1 className="apl-page-title">Admin Dashboard</h1>
        <p className="apl-page-sub">System control panel — manage users, roles, companies, and jobs.</p>
      </div>

      {/* Navigation cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: "20px",
      }}>
        {CARDS.map((card) => (
          <Link
            key={card.to}
            to={card.to}
            style={{ textDecoration: "none" }}
          >
            <div
              className="apl-card apl-card-hover"
              style={{ display: "flex", flexDirection: "column", gap: "12px", cursor: "pointer" }}
            >
              <div style={{
                width: "44px",
                height: "44px",
                borderRadius: "10px",
                background: "var(--apl-accent)",
                color: "var(--apl-dark)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                {card.icon}
              </div>
              <div>
                <h3 style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "var(--apl-neutral-900)",
                  marginBottom: "4px",
                }}>
                  {card.title}
                </h3>
                <p style={{ fontSize: "13px", color: "var(--apl-neutral-700)", lineHeight: 1.5 }}>
                  {card.desc}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;