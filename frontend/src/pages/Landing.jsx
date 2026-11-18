import { Link } from "react-router-dom";
import { ArrowRight, CalendarCheck, GraduationCap, LayoutDashboard, Megaphone, Users } from "lucide-react";
import Brand from "../components/Brand.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useDocumentTitle } from "../hooks.js";
import { HOME_FOR_ROLE } from "../utils/routes.js";

export default function Landing() {
  useDocumentTitle("University Event Management");
  const { session } = useAuth();

  return (
    <div className="landing">
      <header className="landing-nav">
        <Brand size="lg" />
        {session && (
          <Link to={HOME_FOR_ROLE[session.role]} className="btn btn-secondary">
            <LayoutDashboard size={16} /> Go to dashboard
          </Link>
        )}
      </header>

      <section className="landing-hero">
        <span className="eyebrow">University Event Management Platform</span>
        <h1>
          Every campus event, <span className="gradient-text">one hub.</span>
        </h1>
        <p>Discover, register, and never forget exciting university events — or publish and manage events for your community.</p>
      </section>

      <section className="landing-options">
        <article className="option-card role-student">
          <span className="option-icon"><GraduationCap size={28} /></span>
          <h2>Student</h2>
          <p>Discover, register, and never forget exciting university events.</p>
          <ul>
            <li><CalendarCheck size={16} /> Browse events by category</li>
            <li><Users size={16} /> Register solo or as a team</li>
          </ul>
          <div className="option-actions">
            <Link to="/auth/student-login" className="btn btn-primary">
              Student login <ArrowRight size={16} />
            </Link>
            <Link to="/auth/student-register" className="btn btn-ghost">Create account</Link>
          </div>
        </article>

        <article className="option-card role-organization">
          <span className="option-icon"><Megaphone size={28} /></span>
          <h2>Organizer</h2>
          <p>Publish and manage events for your community.</p>
          <ul>
            <li><CalendarCheck size={16} /> Host events and pick venues</li>
            <li><Users size={16} /> Track and export registrations</li>
          </ul>
          <div className="option-actions">
            <Link to="/auth/organizer-login" className="btn btn-primary">
              Organizer login <ArrowRight size={16} />
            </Link>
            <Link to="/auth/organizer-register" className="btn btn-ghost">Register organization</Link>
          </div>
        </article>
      </section>

      <footer className="landing-footer">© {new Date().getFullYear()} EVENT HUB</footer>
    </div>
  );
}
