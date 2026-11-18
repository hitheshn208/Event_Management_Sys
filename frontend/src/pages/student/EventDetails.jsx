import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Link2, Mail, Phone, UserRound } from "lucide-react";
import EventImage from "../../components/EventImage.jsx";
import ProgressBar from "../../components/ProgressBar.jsx";
import { EmptyState, ErrorState, PageLoader } from "../../components/Feedback.jsx";
import { useApi, useDocumentTitle } from "../../hooks.js";
import { capacityStats, formatDate, formatDepartment, formatHall, formatTime, teamSizeLabel } from "../../utils/format.js";

export default function EventDetails() {
  const { eventId } = useParams();
  const { data, error, loading, reload } = useApi(`/student/event/${eventId}`);
  useDocumentTitle(data?.event?.name || "Event Details");

  if (loading) return <PageLoader />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  const { event } = data;
  const { registered, capacity, percent, isFull } = capacityStats(event.registered, event.total_capacity);
  const coordinators = Array.isArray(event.coordinators) ? event.coordinators : [];
  const statusLabel = event.is_registered ? "Already registered" : isFull ? "Full" : "Open";

  return (
    <div className="detail-page has-sticky-footer">
      <Link className="back-link" to="/student/dashboard">
        <ArrowLeft size={16} /> Back to dashboard
      </Link>

      <section className="card hero">
        <div className="hero-media">
          <EventImage src={event.imgurl} alt={`${event.name} banner`} />
        </div>
        <div className="hero-copy">
          <div className="pill-row">
            <span className="tag">{event.category}</span>
            <span className="badge">{event.isindividual ? "Individual" : "Team"}</span>
          </div>
          <h1>{event.name}</h1>
          <div className="summary-grid">
            <div className="summary-card"><span>Organizer</span><strong>{event.organizer_name}</strong></div>
            <div className="summary-card"><span>Date</span><strong>{formatDate(event.event_date)}</strong></div>
            <div className="summary-card"><span>Time</span><strong>{formatTime(event.event_time)}</strong></div>
            <div className="summary-card"><span>Venue</span><strong>{formatHall(event.hall)}</strong></div>
          </div>
        </div>
      </section>

      <section className="card panel">
        <h2>Event Overview</h2>
        <div className="stat-grid">
          <div className="stat">
            <span>Registrations</span>
            <strong>{registered}/{capacity}</strong>
            <ProgressBar percent={percent} label="Registrations filled" />
          </div>
          <div className="stat"><span>Team Size</span><strong>{teamSizeLabel(event)}</strong></div>
          <div className="stat"><span>Department</span><strong>{formatDepartment(event.department_allowed)}</strong></div>
          <div className="stat"><span>Registration Status</span><strong>{statusLabel}</strong></div>
        </div>

        <div className="info-grid">
          <div className="info-card">
            <h4>Schedule</h4>
            <p><strong>Date:</strong> {formatDate(event.event_date)}</p>
            <p><strong>Time:</strong> {formatTime(event.event_time)}</p>
          </div>
          <div className="info-card">
            <h4>Venue</h4>
            <p><strong>Block:</strong> {String(event.block || "").toUpperCase()}</p>
            <p><strong>Hall:</strong> {formatHall(event.hall)}</p>
          </div>
          <div className="info-card">
            <h4>Rules</h4>
            <p><strong>Mode:</strong> {event.isindividual ? "Individual" : "Team"}</p>
            <p><strong>Team limits:</strong> {teamSizeLabel(event)}</p>
          </div>
          <div className="info-card">
            <h4>Links</h4>
            {event.group_chatlink ? (
              <a className="text-link" href={event.group_chatlink} target="_blank" rel="noreferrer">
                <Link2 size={16} /> Open group link
              </a>
            ) : (
              <p>No group link provided.</p>
            )}
          </div>
        </div>
      </section>

      <section className="card panel">
        <h2>Event Description</h2>
        <p className="description">{event.description || "No description provided."}</p>
      </section>

      <section className="card panel">
        <h2>Coordinators</h2>
        {coordinators.length === 0 ? (
          <EmptyState icon={UserRound} title="No coordinators listed">
            This event does not currently list coordinator contact details.
          </EmptyState>
        ) : (
          <div className="coordinator-grid">
            {coordinators.map((c, i) => (
              <div key={i} className="coordinator">
                <span className="avatar"><UserRound size={18} /></span>
                <div>
                  <h4>{c.name}</h4>
                  <p><Phone size={14} /> {c.phone ? <a href={`tel:${c.phone}`}>{c.phone}</a> : "Not provided"}</p>
                  <p><Mail size={14} /> {c.email ? <a href={`mailto:${c.email}`}>{c.email}</a> : "Not provided"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="sticky-footer">
        <div>
          <strong>{event.is_registered ? "You are already registered" : isFull ? "Registration is full" : "Ready to register"}</strong>
          <small>
            {event.is_registered
              ? "You can still review the event details and group link."
              : isFull
                ? "This event has reached capacity."
                : "Proceed to the registration form when you are ready."}
          </small>
        </div>
        {event.is_registered || isFull ? (
          <button type="button" className="btn btn-primary btn-lg" disabled>
            {event.is_registered ? "Registered" : "Full"}
          </button>
        ) : (
          <Link className="btn btn-primary btn-lg" to={`/student/event/${event.id}/register`}>
            Register
          </Link>
        )}
      </footer>
    </div>
  );
}
