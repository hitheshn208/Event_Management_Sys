import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Brand from "../components/Brand.jsx";

export default function AuthLayout({ theme = "student", title, subtitle, children, footer }) {
  return (
    <div className={`auth-page role-${theme === "student" ? "student" : "organization"}`}>
      <div className="auth-aside">
        <Brand size="lg" />
        <h2>{theme === "student" ? "Never miss a campus event." : "Host events your campus will remember."}</h2>
        <p>
          {theme === "student"
            ? "Discover workshops, hackathons and seminars, register solo or with your team, and keep track of everything in one place."
            : "Publish events, manage venues and coordinators, and track every registration in real time."}
        </p>
      </div>

      <div className="auth-panel">
        <div className="auth-card">
          <Link to="/" className="back-link">
            <ArrowLeft size={16} /> Back
          </Link>
          <div className="auth-header">
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {children}
          {footer && <div className="auth-footer">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
