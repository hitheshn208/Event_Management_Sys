import { Link } from "react-router-dom";

export default function Brand({ to = "/", size = "md" }) {
  return (
    <Link to={to} className={`brand brand-${size}`} aria-label="EVENT HUB home">
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 32 32">
          <path d="M9 10h14M9 16h10M9 22h14" />
        </svg>
      </span>
      <span className="brand-name">
        EVENT<span>HUB</span>
      </span>
    </Link>
  );
}
