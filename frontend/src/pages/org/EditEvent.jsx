import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PageHeader from "../../components/PageHeader.jsx";
import { ErrorState, PageLoader } from "../../components/Feedback.jsx";
import { useApi, useDocumentTitle } from "../../hooks.js";
import EventForm from "./EventForm.jsx";

export default function EditEvent() {
  const { eventId } = useParams();
  const { data, error, loading, reload } = useApi(`/organization/event/${eventId}/edit`);
  useDocumentTitle(data?.event ? `Edit · ${data.event.name}` : "Edit Event");

  return (
    <div className="detail-page narrow">
      <Link className="back-link" to="/organization/dashboard">
        <ArrowLeft size={16} /> Back to dashboard
      </Link>
      <PageHeader title="Edit Event" subtitle="Update your university event details." />
      {loading ? <PageLoader /> : error ? <ErrorState error={error} onRetry={reload} /> : <EventForm key={data.event.id} mode="edit" initialEvent={data.event} />}
    </div>
  );
}
