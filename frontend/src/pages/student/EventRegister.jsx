import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Info, UserPlus } from "lucide-react";
import FormField from "../../components/FormField.jsx";
import { Alert, ErrorState, PageLoader } from "../../components/Feedback.jsx";
import { useApi, useDocumentTitle } from "../../hooks.js";
import { api } from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { capacityStats, formatDate, formatHall, formatTime, USN_REGEX } from "../../utils/format.js";

export default function EventRegister() {
  const { eventId } = useParams();
  const { session } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { data, error, loading, reload } = useApi(`/student/event/${eventId}`);
  useDocumentTitle(data?.event ? `Register · ${data.event.name}` : "Event Registration");

  const event = data?.event;
  const minMembers = event ? (event.isindividual ? 1 : Number(event.min_members || 1)) : 1;
  const maxMembers = event ? (event.isindividual ? 1 : Number(event.max_members || minMembers)) : 1;

  const [teamName, setTeamName] = useState("");
  const [usns, setUsns] = useState([]);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (event) {
      setUsns(Array.from({ length: maxMembers }, (_, i) => (i === 0 ? session?.user?.usn || "" : "")));
    }
  }, [event, maxMembers, session]);

  if (loading) return <PageLoader />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  const { isFull } = capacityStats(event.registered, event.total_capacity);
  if (event.is_registered || isFull) return <Navigate to={`/student/event/${event.id}`} replace />;

  const setUsn = (index, value) => setUsns((list) => list.map((u, i) => (i === index ? value.toUpperCase() : u)));

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const filled = [...new Set(usns.map((u) => u.trim().toUpperCase()).filter(Boolean))];
    if (!event.isindividual && !teamName.trim()) return setFormError("Team name is required for team events.");
    if (filled.length < minMembers || filled.length > maxMembers) return setFormError(`Enter between ${minMembers} and ${maxMembers} unique USN values.`);
    const invalid = filled.filter((u) => !USN_REGEX.test(u));
    if (invalid.length) return setFormError(`Invalid USN format: ${invalid.join(", ")}`);

    setSubmitting(true);
    try {
      await api(`/student/event/${event.id}/register`, {
        method: "POST",
        body: { teamName: teamName.trim(), teamUsns: filled },
      });
      toast(`You're registered for "${event.name}"!`);
      navigate("/student/registrations");
    } catch (err) {
      setFormError(err.message);
      setSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="detail-page">
      <Link className="back-link" to={`/student/event/${event.id}`}>
        <ArrowLeft size={16} /> Back to event
      </Link>

      <section className="page-header">
        <div>
          <span className="eyebrow">Registration</span>
          <h1>Register for {event.name}</h1>
          <p>Review event details and submit participant USN details.</p>
        </div>
      </section>

      <Alert>{formError}</Alert>

      <div className="split">
        <aside className="card panel">
          <h2>Event Details</h2>
          <dl className="kv">
            <div><dt>Category</dt><dd>{event.category}</dd></div>
            <div><dt>Organizer</dt><dd>{event.organizer_name}</dd></div>
            <div><dt>Date</dt><dd>{formatDate(event.event_date)}</dd></div>
            <div><dt>Time</dt><dd>{formatTime(event.event_time)}</dd></div>
            <div><dt>Venue</dt><dd>{formatHall(event.hall)}</dd></div>
            <div><dt>Mode</dt><dd>{event.isindividual ? "Individual" : "Team"}</dd></div>
            {!event.isindividual && <div><dt>Team Size</dt><dd>{minMembers} to {maxMembers} members</dd></div>}
          </dl>
          <p className="description muted">{event.description || "No description provided."}</p>
        </aside>

        <form className="card panel form" onSubmit={onSubmit} noValidate>
          <h2>Participant USN Details</h2>
          <p className="note">
            <Info size={16} /> All teammates must have an EVENT HUB account.
          </p>

          {!event.isindividual && (
            <FormField label="Team Name" htmlFor="teamName" required>
              <input id="teamName" maxLength={100} value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Enter team name" required />
            </FormField>
          )}

          <div className="form-row">
            {usns.map((usn, i) => (
              <FormField key={i} label={event.isindividual ? "USN" : `Member ${i + 1} USN`} htmlFor={`usn-${i}`} required={i < minMembers} hint={i === 0 ? "That's you" : undefined}>
                <input
                  id={`usn-${i}`}
                  className="uppercase"
                  maxLength={10}
                  value={usn}
                  onChange={(e) => setUsn(i, e.target.value)}
                  placeholder="1MS22XX000"
                  readOnly={i === 0}
                  required={i < minMembers}
                />
              </FormField>
            ))}
          </div>

          <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={submitting}>
            <UserPlus size={18} /> {submitting ? "Registering..." : "Confirm Registration"}
          </button>
        </form>
      </div>
    </div>
  );
}
