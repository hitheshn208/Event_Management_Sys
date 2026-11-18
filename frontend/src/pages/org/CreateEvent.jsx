import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PageHeader from "../../components/PageHeader.jsx";
import { useDocumentTitle } from "../../hooks.js";
import EventForm from "./EventForm.jsx";

export default function CreateEvent() {
  useDocumentTitle("Create Event");
  return (
    <div className="detail-page narrow">
      <Link className="back-link" to="/organization/dashboard">
        <ArrowLeft size={16} /> Back to dashboard
      </Link>
      <PageHeader title="Create New Event" subtitle="Organize and manage your university event." />
      <EventForm mode="create" />
    </div>
  );
}
