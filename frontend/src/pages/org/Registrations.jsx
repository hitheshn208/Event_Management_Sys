import { Link } from "react-router-dom";
import { CalendarDays, ChevronRight, Clock, Plus, UserCheck } from "lucide-react";
import PageHeader from "../../components/PageHeader.jsx";
import { MetaItem } from "../../components/EventMeta.jsx";
import { EmptyState, ErrorState, PageLoader } from "../../components/Feedback.jsx";
import { useApi, useDocumentTitle } from "../../hooks.js";
import { formatDate, formatTime } from "../../utils/format.js";

export default function OrgRegistrations() {
  useDocumentTitle("All Registrations");
  const { data, error, loading, reload } = useApi("/organization/registrations");

  if (loading) return <PageLoader />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  const { events } = data;

  return (
    <>
      <PageHeader
        eyebrow={`${events.length} event${events.length === 1 ? "" : "s"}`}
        title="Registrations overview"
        subtitle="Select an event to open its full registrations page."
      />

      {events.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No events yet"
          action={<Link className="btn btn-primary" to="/organization/organise-event"><Plus size={16} /> Host event</Link>}
        >
          Once you host events, their registration cards will appear here.
        </EmptyState>
      ) : (
        <section className="list">
          {events.map((event) => (
            <Link key={event.id} className="card list-row list-row-link" to={`/organization/event/${event.id}/registrations`}>
              <div className="list-row-main">
                <span className="eyebrow">Event</span>
                <h3>{event.name}</h3>
                <div className="meta-grid">
                  <MetaItem icon={CalendarDays}>{formatDate(event.event_date)}</MetaItem>
                  <MetaItem icon={Clock}>{formatTime(event.event_time)}</MetaItem>
                </div>
              </div>
              <div className="count-box">
                <span>Total registrations</span>
                <strong>{event.total_registrations}</strong>
              </div>
              <ChevronRight className="list-row-arrow" size={20} />
            </Link>
          ))}
        </section>
      )}
    </>
  );
}
