import { CalendarDays, Clock, MapPin } from "lucide-react";
import { formatDate, formatHall, formatTime } from "../utils/format.js";

export function MetaItem({ icon: Icon, children }) {
  return (
    <span className="meta-item">
      <Icon size={15} />
      <span>{children}</span>
    </span>
  );
}

export default function EventMeta({ event, extra }) {
  return (
    <div className="meta-grid">
      <MetaItem icon={CalendarDays}>{formatDate(event.event_date)}</MetaItem>
      <MetaItem icon={Clock}>{formatTime(event.event_time)}</MetaItem>
      <MetaItem icon={MapPin}>{formatHall(event.hall)}</MetaItem>
      {extra}
    </div>
  );
}
