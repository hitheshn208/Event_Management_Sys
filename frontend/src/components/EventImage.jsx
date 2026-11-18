import { useState } from "react";
import { CalendarDays } from "lucide-react";

export default function EventImage({ src, alt, className = "" }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={`event-image event-image-fallback ${className}`} aria-label={alt} role="img">
        <CalendarDays size={36} />
      </div>
    );
  }

  return <img className={`event-image ${className}`} src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
}
