import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Clock, Info, Layers, ListChecks, Users, X } from "lucide-react";
import PageHeader from "../../components/PageHeader.jsx";
import { MetaItem } from "../../components/EventMeta.jsx";
import { ConfirmDialog } from "../../components/Modal.jsx";
import { EmptyState, ErrorState, PageLoader } from "../../components/Feedback.jsx";
import { useApi, useDocumentTitle } from "../../hooks.js";
import { api } from "../../api/client.js";
import { useToast } from "../../context/ToastContext.jsx";
import { formatDate, formatTime } from "../../utils/format.js";

const STATUS_LABEL = { upcoming: "Upcoming", ongoing: "Ongoing", completed: "Completed" };

export default function MyRegistrations() {
  useDocumentTitle("My Registrations");
  const { data, error, loading, reload, setData } = useApi("/student/registrations");
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const cancel = async () => {
    setBusy(true);
    try {
      await api(`/student/event/${pending.id}/cancel`, { method: "POST" });
      setData((d) => ({ ...d, registrations: d.registrations.filter((r) => r.id !== pending.id) }));
      toast(`Registration for "${pending.name}" cancelled`);
      setPending(null);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <PageLoader />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  const { registrations } = data;

  return (
    <>
      <PageHeader title="My registrations" subtitle="View your registered events and cancel your registration when needed." />

      {registrations.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="No registrations yet"
          action={<Link className="btn btn-primary" to="/student/dashboard">Explore events</Link>}
        >
          You have not registered for any event yet.
        </EmptyState>
      ) : (
        <section className="list">
          {registrations.map((event) => (
            <article key={event.id} className="card list-row">
              <div className="list-row-main">
                <div className="list-row-title">
                  <h3>{event.name}</h3>
                  <span className={`status status-${event.status}`}>{STATUS_LABEL[event.status] || event.status}</span>
                </div>
                <div className="meta-grid">
                  <MetaItem icon={CalendarDays}>{formatDate(event.event_date)}</MetaItem>
                  <MetaItem icon={Clock}>{formatTime(event.event_time)}</MetaItem>
                  <MetaItem icon={Layers}>{event.category}</MetaItem>
                  <MetaItem icon={Users}>{event.isindividual ? "Individual" : "Team"} · {event.organizer_name}</MetaItem>
                </div>
              </div>
              <div className="list-row-actions">
                <Link className="btn btn-secondary" to={`/student/event/${event.id}`}>
                  <Info size={16} /> Details
                </Link>
                <button type="button" className="btn btn-danger-ghost" onClick={() => setPending(event)}>
                  <X size={16} /> Cancel registration
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      <ConfirmDialog
        open={!!pending}
        title="Cancel registration?"
        message={
          pending && !pending.isindividual
            ? `This is a team event — cancelling will remove your whole team from "${pending?.name}".`
            : `You will be removed from "${pending?.name}".`
        }
        confirmLabel="Cancel registration"
        danger
        busy={busy}
        onConfirm={cancel}
        onCancel={() => setPending(null)}
      />
    </>
  );
}
