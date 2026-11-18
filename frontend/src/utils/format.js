// Dates come from the API as "YYYY-MM-DD" and times as "HH:MM:SS".
// Parse them as *local* values so the day never shifts across timezones.

export function parseLocalDate(value) {
  if (!value) return null;
  const [y, m, d] = String(value).slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function eventStart(event) {
  const date = parseLocalDate(event?.event_date);
  if (!date) return null;
  const [h = 0, min = 0] = String(event.event_time || "00:00").split(":").map(Number);
  date.setHours(h, min, 0, 0);
  return date;
}

export function formatDate(value) {
  const date = parseLocalDate(value);
  if (!date) return "TBA";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatTime(value) {
  if (!value) return "TBA";
  const [h, m] = String(value).split(":").map(Number);
  const date = new Date(1970, 0, 1, h || 0, m || 0);
  return date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
}

export function formatHall(hall) {
  return String(hall || "").replace(/_/g, " ").toUpperCase() || "TBA";
}

export function formatDepartment(value) {
  if (Array.isArray(value)) return value.length ? value.join(", ").toUpperCase() : "All departments";
  return value ? String(value).replace(/,/g, ", ").toUpperCase() : "All departments";
}

export function capacityStats(registered, capacity) {
  const reg = Number(registered || 0);
  const cap = Number(capacity || 0);
  const percent = cap > 0 ? Math.min(100, Math.round((reg / cap) * 100)) : 0;
  return { registered: reg, capacity: cap, percent, isFull: cap > 0 && reg >= cap };
}

export function teamSizeLabel(event) {
  if (event.isindividual) return "1 participant";
  return `${Number(event.min_members || 1)} to ${Number(event.max_members || 1)} members`;
}

export const CATEGORIES = [
  { value: "conference", label: "Conference" },
  { value: "workshop", label: "Workshop" },
  { value: "seminar", label: "Seminar" },
  { value: "networking", label: "Networking" },
  { value: "training", label: "Training" },
  { value: "competition", label: "Competition" },
  { value: "hackathon", label: "Hackathon" },
  { value: "other", label: "Other" },
];

export const BLOCKS = [
  { value: "esb", label: "Block 1 - ESB" },
  { value: "des", label: "Block 2 - DES" },
];

export const HALLS = {
  esb: [
    { value: "esb_seminar_1", label: "SEMINAR HALL 1" },
    { value: "esb_seminar_2", label: "SEMINAR HALL 2" },
  ],
  des: [
    { value: "des_hitech_1", label: "HITECH SEMINAR HALL 1" },
    { value: "des_hitech_2", label: "HITECH SEMINAR HALL 2" },
  ],
};

export const DEPARTMENTS = [
  { value: "", label: "No Restriction - All Departments" },
  { value: "cse", label: "CSE" },
  { value: "ise", label: "ISE" },
  { value: "aiml", label: "AIML" },
  { value: "aids", label: "AIDS" },
];

export const USN_REGEX = /^1MS\d{2}[A-Z]{2}\d{3}$/;
