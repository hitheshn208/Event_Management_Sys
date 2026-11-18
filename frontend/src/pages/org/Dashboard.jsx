import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarCheck, CalendarClock, ListChecks, Pencil, Plus, Trash2, Users } from "lucide-react";
import PageHeader from "../../components/PageHeader.jsx";
import EventImage from "../../components/EventImage.jsx";
import EventMeta, { MetaItem } from "../../components/EventMeta.jsx";
import ProgressBar from "../../components/ProgressBar.jsx";
import { ConfirmDialog } from "../../components/Modal.jsx";
import { EmptyState, ErrorState, PageLoader } from "../../components/Feedback.jsx";
import { useApi, useDocumentTitle } from "../../hooks.js";
import { api } from "../../api/client.js";
import { useToast } from "../../context/ToastContext.jsx";
import { capacityStats, eventStart } from "../../utils/format.js";

function isCompleted(event) {
  const start = eventStart(event);
  return start ? start < new Date() : false;
}

function OrgEventCard({ event, onDelete }) {
  const { registered, capacity, percent } = capacityStats(event.registered, event.total_capacity);
  const completed = isCompleted(event);

  return (
    <article className="card event-card">
      <div className="event-card-media">
        <EventImage src={event.imgurl} alt={`${event.name} banner`} />
        <span className={`status status-${completed ? "completed" : "upcoming"} badge-overlay`}>{completed ? "Completed" : "Upcoming"}</span>
      </div>

      <div className="event-card-body">
        <div>
          <span className="tag">{event.category}</span>
          <h3 className="event-card-title">{event.name}</h3>
        </div>

        <EventMeta event={event} extra={<MetaItem icon={Users}>{event.isindividual ? "Individual" : "Team event"}</MetaItem>} />

        <div className="capacity">
          <div className="capacity-head">
            <span>Registrations</span>
            <span>{registered}/{capacity}</span>
          </div>
          <ProgressBar percent={percent} label="Registrations filled" />
          <small className="muted">{percent}% filled</small>
        </div>

        <div className="card-actions">
          <Link to={`/organization/event/${event.id}/edit`} className="btn btn-secondary">
            <Pencil size={16} /> Edit
          </Link>
          <Link to={`/organization/event/${event.id}/registrations`} className="btn btn-primary">
            <ListChecks size={16} /> Registrations
          </Link>
          {/* TODO: Check-in (QR) feature — not implemented yet */}
          <button type="button" className="btn btn-icon btn-danger-ghost" onClick={() => onDelete(event)} aria-label={`Delete ${event.name}`} title="Delete event">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}

export default function OrgDashboard() {
  useDocumentTitle("Your Hosted Events");
  const { data, error, loading, reload, setData } = useApi("/organization/dashboard");
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const stats = useMemo(() => {
    const events = data?.events || [];
    const upcoming = events.filter((e) => !isCompleted(e)).length;
    const registrations = events.reduce((sum, e) => sum + Number(e.registered || 0), 0);
    return { total: events.length, upcoming, registrations };
  }, [data]);

  const sorted = useMemo(
    () => [...(data?.events || [])].sort((a, b) => (eventStart(b)?.getTime() || 0) - (eventStart(a)?.getTime() || 0)),
    [data]
  );

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await api(`/organization/event/${pending.id}/delete`, { method: "DELETE" });
      setData((d) => ({ ...d, events: d.events.filter((e) => e.id !== pending.id) }));
      toast(`"${pending.name}" deleted`);
      setPending(null);
    } catch (err) {
      toast(err.message || "Failed to delete event", "error");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <PageLoader />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  return (
    <>
      <PageHeader
        eyebrow={data.org?.name}
        title="Your Hosted Events"
        subtitle="Manage details and registrations for all your events from one place."
        actions={
          <Link className="btn btn-primary" to="/organization/organise-event">
            <Plus size={18} /> Host event
          </Link>
        }
      />

      <section className="stats-row">
        <div className="stat-tile"><CalendarCheck size={20} /><div><strong>{stats.total}</strong><span>Total events</span></div></div>
        <div className="stat-tile"><CalendarClock size={20} /><div><strong>{stats.upcoming}</strong><span>Upcoming</span></div></div>
        <div className="stat-tile"><Users size={20} /><div><strong>{stats.registrations}</strong><span>Registrations</span></div></div>
      </section>

      {sorted.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No events yet"
          action={<Link className="btn btn-primary" to="/organization/organise-event"><Plus size={16} /> Host event</Link>}
        >
          Start by hosting your first event.
        </EmptyState>
      ) : (
        <section className="card-grid">
          {sorted.map((event) => (
            <OrgEventCard key={event.id} event={event} onDelete={setPending} />
          ))}
        </section>
      )}

      <Link className="fab" to="/organization/organise-event" aria-label="Add event">
        <Plus size={22} />
        <span>Add event</span>
      </Link>

      <ConfirmDialog
        open={!!pending}
        title="Delete event?"
        message={`"${pending?.name}" will be removed permanently, along with all related records.`}
        confirmLabel="Delete"
        danger
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setPending(null)}
      />
    </>
  );
}
