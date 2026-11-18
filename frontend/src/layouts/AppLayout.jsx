import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { ChevronDown, GraduationCap, House, ListChecks, LogOut, Megaphone, UserCheck, Users } from "lucide-react";
import Brand from "../components/Brand.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const NAV = {
  student: [
    { to: "/student/dashboard", label: "Explore", icon: House },
    { to: "/student/registrations", label: "My registrations", icon: ListChecks },
  ],
  organization: [
    { to: "/organization/dashboard", label: "Home", icon: House },
    { to: "/organization/organise-event", label: "Host event", icon: Megaphone },
    { to: "/organization/registrations", label: "Registrations", icon: UserCheck },
  ],
};

function ProfileMenu({ role, user }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isStudent = role === "student";
  const subtitle = isStudent ? user?.usn : user?.username;
  const details = isStudent
    ? [
        ["Name", user?.name],
        ["USN", user?.usn],
        ["Email", user?.email],
      ]
    : [
        ["Name", user?.name],
        ["Username", user?.username],
        ["Email", user?.email],
      ];

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="profile" ref={ref}>
      <button type="button" className="profile-trigger" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="menu">
        <span className="avatar">{isStudent ? <GraduationCap size={18} /> : <Users size={18} />}</span>
        <span className="profile-text">
          <strong>{user?.name || (isStudent ? "Student" : "Organization")}</strong>
          <small>{subtitle}</small>
        </span>
        <ChevronDown size={16} className={open ? "rotate" : ""} />
      </button>
      {open && (
        <div className="profile-menu" role="menu">
          <dl>
            {details.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v || "Not available"}</dd>
              </div>
            ))}
          </dl>
          <button type="button" className="btn btn-danger-ghost btn-block" onClick={handleLogout} role="menuitem">
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default function AppLayout({ role }) {
  const { session } = useAuth();
  const items = NAV[role];
  const home = items[0].to;

  return (
    <div className={`app-shell role-${role}`}>
      <header className="topbar">
        <div className="topbar-left">
          <Brand to={home} />
          <span className="role-chip">{role === "student" ? "Student" : "Organizer"}</span>
        </div>
        <ProfileMenu role={role} user={session?.user} />
      </header>

      <div className="app-body">
        <nav className="sidebar" aria-label="Main navigation">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}>
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
