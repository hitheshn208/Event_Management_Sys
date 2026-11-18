import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Info, Search, UserPlus, Users } from "lucide-react";
import PageHeader from "../../components/PageHeader.jsx";
import EventImage from "../../components/EventImage.jsx";
import EventMeta, { MetaItem } from "../../components/EventMeta.jsx";
import ProgressBar from "../../components/ProgressBar.jsx";
import { EmptyState, ErrorState, PageLoader } from "../../components/Feedback.jsx";
import { useApi, useDocumentTitle } from "../../hooks.js";
import { CATEGORIES, capacityStats } from "../../utils/format.js";

function StudentEventCard({ event }) {
  const { registered, capacity, percent, isFull } = capacityStats(event.registered, event.total_capacity);

  return (
    <article className="card event-card">
      <div className="event-card-media">
        <EventImage src={event.imgurl} alt={`${event.name} banner`} />
        <span className="badge badge-overlay">{event.isindividual ? "Individual" : "Team"}</span>
        {event.is_registered && (
          <span className="badge badge-success badge-overlay-left">
            <CheckCircle2 size={13} /> Registered
          </span>
        )}
      </div>

      <div className="event-card-body">
        <div>
          <span className="tag">{event.category}</span>
          <h3 className="event-card-title">{event.name}</h3>
        </div>

        <EventMeta event={event} extra={<MetaItem icon={Users}>{event.organizer_name}</MetaItem>} />

        <div className="capacity">
          <div className="capacity-head">
            <span>Registrations</span>
            <span>{registered}/{capacity}</span>
          </div>
          <ProgressBar percent={percent} label="Registrations filled" />
        </div>

        <div className="card-actions">
          <Link className="btn btn-secondary" to={`/student/event/${event.id}`}>
            <Info size={16} /> Details
          </Link>
          {event.is_registered || isFull ? (
            <button type="button" className="btn btn-primary" disabled>
              <UserPlus size={16} /> {event.is_registered ? "Registered" : "Full"}
            </button>
          ) : (
            <Link className="btn btn-primary" to={`/student/event/${event.id}/register`}>
              <UserPlus size={16} /> Register
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export default function StudentDashboard() {
  useDocumentTitle("Explore Events");
  const { data, error, loading, reload } = useApi("/student/dashboard");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");

  const events = data?.events;
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (events || []).filter((e) => {
      const matchesCategory = category === "all" || String(e.category || "").trim().toLowerCase() === category;
      const matchesQuery = !q || [e.name, e.organizer_name, e.description].some((v) => String(v || "").toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [events, category, query]);

  if (loading) return <PageLoader />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  return (
    <>
      <PageHeader
        eyebrow={`Hi, ${data.student?.name?.split(" ")[0] || "there"} 👋`}
        title="Explore Events"
        subtitle="Browse upcoming events, view details, and register instantly."
      />

      <section className="toolbar" aria-label="Event filters">
        <div className="search-input">
          <Search size={17} />
          <input type="search" placeholder="Search events or organizers" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search events" />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category">
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </section>

      {events.length === 0 ? (
        <EmptyState title="No events available">New events will appear here as organizers publish them.</EmptyState>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Search} title="No matching events">
          Try a different search or category.
        </EmptyState>
      ) : (
        <section className="card-grid">
          {filtered.map((event) => (
            <StudentEventCard key={event.id} event={event} />
          ))}
        </section>
      )}
    </>
  );
}
