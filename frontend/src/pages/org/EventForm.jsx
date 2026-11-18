import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ImagePlus, Plus, Trash2, User, Users, X } from "lucide-react";
import FormField from "../../components/FormField.jsx";
import { Alert } from "../../components/Feedback.jsx";
import { api } from "../../api/client.js";
import { useToast } from "../../context/ToastContext.jsx";
import { BLOCKS, CATEGORIES, DEPARTMENTS, HALLS } from "../../utils/format.js";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
let keySeq = 0;
const nextKey = () => `c${++keySeq}`;
const emptyCoordinator = () => ({ key: nextKey(), name: "", email: "", phone: "" });

const EMPTY_FORM = {
  eventName: "",
  category: "",
  description: "",
  date: "",
  time: "",
  block: "",
  hall: "",
  groupChatLink: "",
  type: "",
  capacity: "",
  minSize: "",
  maxSize: "",
  totalTeams: "",
  departmentRestriction: "",
  eventInstructions: "",
};

/** Maps the API's event row (GET /organization/event/:id/edit) to form state. */
export function eventToForm(event) {
  return {
    eventName: event.name || "",
    category: event.category || "",
    description: event.description || "",
    date: String(event.event_date || "").slice(0, 10),
    time: String(event.event_time || "").slice(0, 5),
    block: event.block || "",
    hall: event.hall || "",
    groupChatLink: event.group_chatlink || "",
    type: event.isindividual ? "individual" : "team",
    capacity: event.isindividual ? String(event.total_capacity ?? "") : "",
    minSize: event.isindividual ? "" : String(event.min_members ?? ""),
    maxSize: event.isindividual ? "" : String(event.max_members ?? ""),
    totalTeams: event.isindividual ? "" : String(event.total_capacity ?? ""),
    departmentRestriction: event.department_allowed || "",
    eventInstructions: "",
  };
}

function validate(form, coordinators) {
  if (!form.eventName.trim()) return "Event name is required";
  if (!form.category) return "Category is required";
  if (!form.description.trim()) return "Description is required";
  if (!form.date) return "Event date is required";
  if (!form.time) return "Event time is required";
  if (!form.block) return "Block is required";
  if (!form.hall) return "Hall is required";
  if (form.groupChatLink.trim() && !/^https?:\/\//i.test(form.groupChatLink.trim())) return "Group link must start with http:// or https://";
  if (!form.type) return "Event type is required";

  if (form.type === "individual") {
    if (!(Number(form.capacity) >= 1)) return "Total capacity must be at least 1";
  } else {
    if (!(Number(form.minSize) >= 1)) return "Minimum team size must be at least 1";
    if (!(Number(form.maxSize) >= 1)) return "Maximum team size must be at least 1";
    if (Number(form.minSize) > Number(form.maxSize)) return "Minimum team size cannot be greater than maximum team size";
    if (!(Number(form.totalTeams) >= 1)) return "Total teams must be at least 1";
  }

  if (coordinators.length === 0) return "At least one coordinator is required";
  for (const [i, c] of coordinators.entries()) {
    const label = `Coordinator ${i + 1}`;
    if (!c.name.trim()) return `${label}: name is required`;
    if (!c.email.trim()) return `${label}: email is required`;
    if (!EMAIL_REGEX.test(c.email.trim())) return `${label}: invalid email format`;
    if (!c.phone.trim()) return `${label}: phone is required`;
  }
  return "";
}

export default function EventForm({ mode = "create", initialEvent }) {
  const isEdit = mode === "edit";
  const navigate = useNavigate();
  const toast = useToast();
  const topRef = useRef(null);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(() => (initialEvent ? eventToForm(initialEvent) : EMPTY_FORM));
  const [coordinators, setCoordinators] = useState(() => {
    const list = Array.isArray(initialEvent?.coordinators) ? initialEvent.coordinators : [];
    return list.length ? list.map((c) => ({ key: nextKey(), name: c.name || "", email: c.email || "", phone: c.phone || "" })) : [emptyCoordinator()];
  });
  const [image, setImage] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const previewUrl = useMemo(() => (image ? URL.createObjectURL(image) : null), [image]);
  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  const setCoordinator = (key, field, value) => setCoordinators((list) => list.map((c) => (c.key === key ? { ...c, [field]: value } : c)));

  const pickFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Please upload an image file (PNG or JPG).");
    if (file.size > MAX_IMAGE_BYTES) return setError("Image must be 10MB or smaller.");
    setError("");
    setImage(file);
  };

  const showError = (message) => {
    setError(message);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const problem = validate(form, coordinators);
    if (problem) return showError(problem);

    const eventType =
      form.type === "individual"
        ? { type: "individual", capacity: parseInt(form.capacity, 10) }
        : { type: "team", minSize: parseInt(form.minSize, 10), maxSize: parseInt(form.maxSize, 10), totalTeams: parseInt(form.totalTeams, 10) };

    const payload = new FormData();
    payload.append(
      "data",
      JSON.stringify({
        eventName: form.eventName.trim(),
        category: form.category,
        description: form.description.trim(),
        date: form.date,
        time: form.time,
        block: form.block,
        hall: form.hall,
        groupChatLink: form.groupChatLink.trim() || null,
        departmentRestriction: form.departmentRestriction || null,
        eventInstructions: form.eventInstructions.trim() || null, // TODO: not stored by the backend yet
        eventType,
        coordinators: coordinators.map(({ name, email, phone }) => ({ name: name.trim(), email: email.trim(), phone: phone.trim() })),
      })
    );
    if (image) payload.append("image", image);

    setError("");
    setSubmitting(true);
    try {
      const url = isEdit ? `/organization/event/${initialEvent.id}/edit` : "/organization/organise-event";
      const data = await api(url, { method: isEdit ? "PUT" : "POST", body: payload });
      toast(data.message || (isEdit ? "Event updated successfully" : "Event created successfully"));
      navigate(data.redirectUrl || "/organization/dashboard");
    } catch (err) {
      setSubmitting(false);
      showError(err.message);
    }
  };

  const currentImage = previewUrl || (isEdit ? initialEvent?.imgurl : null);

  return (
    <form className="event-form" onSubmit={onSubmit} noValidate>
      <div ref={topRef} className="scroll-anchor" />
      <Alert>{error}</Alert>

      <section className="card panel form">
        <h2>Basic Information</h2>
        <FormField label="Event Name" htmlFor="eventName" required>
          <input id="eventName" value={form.eventName} onChange={set("eventName")} placeholder="Enter event name" required />
        </FormField>
        <FormField label="Category" htmlFor="category" required>
          <select id="category" value={form.category} onChange={set("category")} required>
            <option value="">Select a category</option>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </FormField>
        <FormField label="Description" htmlFor="description" required>
          <textarea id="description" rows={5} value={form.description} onChange={set("description")} placeholder="What's this event about?" required />
        </FormField>
      </section>

      <section className="card panel form">
        <h2>Date, Time & Venue</h2>
        <div className="form-row">
          <FormField label="Event Date" htmlFor="date" required>
            <input id="date" type="date" min={isEdit ? undefined : today} value={form.date} onChange={set("date")} required />
          </FormField>
          <FormField label="Event Time (IST)" htmlFor="time" required>
            <input id="time" type="time" value={form.time} onChange={set("time")} required />
          </FormField>
        </div>
        <div className="form-row">
          <FormField label="Block" htmlFor="block" required>
            <select id="block" value={form.block} onChange={(e) => setForm((f) => ({ ...f, block: e.target.value, hall: "" }))} required>
              <option value="">Select a block</option>
              {BLOCKS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </FormField>
          <FormField label="Hall" htmlFor="hall" required>
            <select id="hall" value={form.hall} onChange={set("hall")} disabled={!form.block} required>
              <option value="">{form.block ? "Select a hall" : "Select a block first"}</option>
              {(HALLS[form.block] || []).map((h) => <option key={h.value} value={h.value}>{h.label}</option>)}
            </select>
          </FormField>
        </div>
        <FormField label="WhatsApp Group Link" htmlFor="groupChatLink" hint="Optional — shared with registered students">
          <input id="groupChatLink" type="url" value={form.groupChatLink} onChange={set("groupChatLink")} placeholder="https://chat.whatsapp.com/..." />
        </FormField>
      </section>

      <section className="card panel form">
        <h2>Event Type</h2>
        <div className="choice-group" role="radiogroup" aria-label="Event format">
          {[
            { value: "individual", title: "Individual Participants", desc: "Students register separately", icon: User },
            { value: "team", title: "Team Based", desc: "Students register as a group", icon: Users },
          ].map(({ value, title, desc, icon: Icon }) => (
            <label key={value} className={`choice ${form.type === value ? "selected" : ""}`}>
              <input type="radio" name="eventType" value={value} checked={form.type === value} onChange={set("type")} />
              <span className="choice-icon"><Icon size={22} /></span>
              <span>
                <strong>{title}</strong>
                <small>{desc}</small>
              </span>
            </label>
          ))}
        </div>

        {form.type === "individual" && (
          <FormField label="Total Capacity (Students)" htmlFor="capacity" required>
            <input id="capacity" type="number" min={1} value={form.capacity} onChange={set("capacity")} placeholder="Number of students" />
          </FormField>
        )}

        {form.type === "team" && (
          <>
            <div className="form-row form-row-3">
              <FormField label="Min Team Size" htmlFor="minSize" required>
                <input id="minSize" type="number" min={1} value={form.minSize} onChange={set("minSize")} placeholder="Min members" />
              </FormField>
              <FormField label="Max Team Size" htmlFor="maxSize" required>
                <input id="maxSize" type="number" min={1} value={form.maxSize} onChange={set("maxSize")} placeholder="Max members" />
              </FormField>
              <FormField label="Total Capacity (Teams)" htmlFor="totalTeams" required>
                <input id="totalTeams" type="number" min={1} value={form.totalTeams} onChange={set("totalTeams")} placeholder="Number of teams" />
              </FormField>
            </div>
          </>
        )}
      </section>

      <section className="card panel form">
        <h2>Custom Instructions</h2>
        <FormField label="Department Restriction" htmlFor="departmentRestriction">
          <select id="departmentRestriction" value={form.departmentRestriction} onChange={set("departmentRestriction")}>
            {DEPARTMENTS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </FormField>
        <FormField label="Instructions" htmlFor="eventInstructions">
          <textarea id="eventInstructions" rows={4} value={form.eventInstructions} onChange={set("eventInstructions")} placeholder="Add any special instructions for participants" />
        </FormField>
      </section>

      <section className="card panel form">
        <div className="panel-head">
          <h2>Event Coordinators</h2>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setCoordinators((l) => [...l, emptyCoordinator()])}>
            <Plus size={16} /> Add coordinator
          </button>
        </div>

        {coordinators.map((c, i) => (
          <div key={c.key} className="sub-card">
            <div className="sub-card-head">
              <h3>Coordinator {i + 1}</h3>
              {coordinators.length > 1 && (
                <button type="button" className="btn btn-icon btn-danger-ghost btn-sm" onClick={() => setCoordinators((l) => l.filter((x) => x.key !== c.key))} aria-label={`Remove coordinator ${i + 1}`}>
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <div className="form-row form-row-3">
              <FormField label="Name" htmlFor={`cname-${c.key}`} required>
                <input id={`cname-${c.key}`} value={c.name} onChange={(e) => setCoordinator(c.key, "name", e.target.value)} placeholder="Full name" />
              </FormField>
              <FormField label="Email" htmlFor={`cemail-${c.key}`} required>
                <input id={`cemail-${c.key}`} type="email" value={c.email} onChange={(e) => setCoordinator(c.key, "email", e.target.value)} placeholder="email@example.com" />
              </FormField>
              <FormField label="Phone" htmlFor={`cphone-${c.key}`} required>
                <input id={`cphone-${c.key}`} type="tel" maxLength={15} value={c.phone} onChange={(e) => setCoordinator(c.key, "phone", e.target.value)} placeholder="+91 XXXXX XXXXX" />
              </FormField>
            </div>
          </div>
        ))}
      </section>

      <section className="card panel form">
        <h2>Event Banner</h2>
        <div
          className={`dropzone ${dragging ? "dragging" : ""} ${currentImage ? "has-image" : ""}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            pickFile(e.dataTransfer.files?.[0]);
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && fileInputRef.current?.click()}
        >
          <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={(e) => pickFile(e.target.files?.[0])} />
          {currentImage ? (
            <img src={currentImage} alt="Event banner preview" />
          ) : (
            <div className="dropzone-empty">
              <ImagePlus size={32} />
              <p>Click to upload or drag and drop</p>
              <span>PNG, JPG up to 10MB</span>
            </div>
          )}
        </div>
        {image && (
          <div className="file-chip">
            <span>{image.name}</span>
            <small>{(image.size / 1024 / 1024).toFixed(2)} MB</small>
            <button type="button" aria-label="Remove image" onClick={() => setImage(null)}>
              <X size={16} />
            </button>
          </div>
        )}
        {isEdit && !image && <small className="hint">Leave empty to keep the current banner.</small>}
      </section>

      <div className="form-actions">
        <Link to="/organization/dashboard" className="btn btn-secondary btn-lg">Cancel</Link>
        <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
          {submitting ? (isEdit ? "Updating Event..." : "Creating Event...") : isEdit ? "Save Changes" : "Create Event"}
        </button>
      </div>
    </form>
  );
}
