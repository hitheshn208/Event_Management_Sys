import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Download, Search, Users } from "lucide-react";
import EventImage from "../../components/EventImage.jsx";
import ProgressBar from "../../components/ProgressBar.jsx";
import { EmptyState, ErrorState, PageLoader } from "../../components/Feedback.jsx";
import { useApi, useDocumentTitle } from "../../hooks.js";
import { formatDate, formatHall, formatTime } from "../../utils/format.js";

const ORDINALS = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];
const ordinal = (i) => ORDINALS[i] || `${i + 1}th`;

function escapeCsv(value) {
  const normalized = String(value ?? "").replace(/"/g, '""');
  return /[",\n\r]/.test(normalized) ? `"${normalized}"` : normalized;
}

function downloadCsv(filename, header, rows) {
  const csv = [header, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\r\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function EventRegistrations() {
  const { eventId } = useParams();
  const { data, error, loading, reload } = useApi(`/organization/event/${eventId}/registrations`);
  const [query, setQuery] = useState("");
  useDocumentTitle(data?.event ? `${data.event.name} · Registrations` : "Registrations");

  const table = useMemo(() => {
    if (!data) return null;
    const { event, registrations } = data;

    if (event.isindividual) {
      return {
        header: ["USN", "Name"],
        rows: registrations.map((r) => [r.usn, r.name]),
      };
    }

    const slots = Math.max(Number(event.max_members || 0), ...registrations.map((r) => (Array.isArray(r.members) ? r.members.length : 0)), 0);
    const header = ["Team name"];
    for (let i = 0; i < slots; i += 1) header.push(`${ordinal(i)} teammate USN`, `${ordinal(i)} teammate name`);

    return {
      header,
      rows: registrations.map((r) => {
        const row = [r.team_name || "Untitled team"];
        for (let i = 0; i < slots; i += 1) row.push(r.members?.[i]?.usn || "", r.members?.[i]?.name || "");
        return row;
      }),
    };
  }, [data]);

  const visibleRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!table || !q) return table?.rows || [];
    return table.rows.filter((row) => row.some((cell) => String(cell).toLowerCase().includes(q)));
  }, [table, query]);

  if (loading) return <PageLoader />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  const { event, registrations, totalRegistrations, capacity, registrationPercent } = data;
  const unit = event.isindividual ? "students" : "teams";
  const csvName = `${String(event.name || "event").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "event"}-registrations.csv`;

  return (
    <div className="detail-page">
      <Link className="back-link" to="/organization/registrations">
        <ArrowLeft size={16} /> Back to registrations
      </Link>

      <section className="card hero">
        <div className="hero-media">
          <EventImage src={event.imgurl} alt={`${event.name} banner`} />
        </div>
        <div className="hero-copy">
          <div className="pill-row">
            <span className="tag">{event.category}</span>
            <span className="badge">{event.isindividual ? "Individual" : "Team event"}</span>
          </div>
          <h1>{event.name}</h1>
          <p className="muted">Review who registered, track the team distribution, and export the table when you need a spreadsheet copy.</p>
          <div className="summary-grid">
            <div className="summary-card"><span>Date</span><strong>{formatDate(event.event_date)}</strong></div>
            <div className="summary-card"><span>Time</span><strong>{formatTime(event.event_time)}</strong></div>
            <div className="summary-card"><span>Venue</span><strong>{formatHall(event.hall)}</strong></div>
            <div className="summary-card"><span>Registrations</span><strong>{totalRegistrations}</strong></div>
          </div>
        </div>
      </section>

      <section className="card panel">
        <div className="panel-head">
          <div>
            <h2>Registration progress</h2>
            <p className="muted">{totalRegistrations} {unit} registered out of {capacity} capacity.</p>
          </div>
        </div>
        <ProgressBar percent={registrationPercent} label="Registrations filled" />
        <div className="progress-meta">
          <span>{registrationPercent}% filled</span>
          <span>{totalRegistrations} / {capacity}</span>
        </div>
      </section>

      <section className="card panel">
        <div className="panel-head">
          <div>
            <h2>Registered {unit}</h2>
            <p className="muted">{event.isindividual ? "Each row is one student registration." : "Each row is one team with its teammate details."}</p>
          </div>
          <div className="panel-head-actions">
            {registrations.length > 0 && (
              <div className="search-input search-input-sm">
                <Search size={16} />
                <input type="search" placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search registrations" />
              </div>
            )}
            <button type="button" className="btn btn-secondary" disabled={registrations.length === 0} onClick={() => downloadCsv(csvName, table.header, table.rows)}>
              <Download size={16} /> Download CSV
            </button>
          </div>
        </div>

        {registrations.length === 0 ? (
          <EmptyState icon={Users} title="No registrations yet">Once students register, their details will appear here.</EmptyState>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th className="col-index">#</th>
                  {table.header.map((h) => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row, i) => (
                  <tr key={i}>
                    <td className="col-index">{i + 1}</td>
                    {row.map((cell, j) => <td key={j}>{cell}</td>)}
                  </tr>
                ))}
                {visibleRows.length === 0 && (
                  <tr><td colSpan={table.header.length + 1} className="table-empty">No rows match "{query}"</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
