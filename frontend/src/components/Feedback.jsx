import { Link } from "react-router-dom";
import { AlertTriangle, Inbox, LogIn } from "lucide-react";

export function Spinner({ label = "Loading" }) {
  return (
    <div className="spinner-wrap" role="status">
      <span className="spinner" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="page-loader">
      <Spinner />
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  const unauthorized = error?.status === 401;
  return (
    <div className="state-card state-error">
      <AlertTriangle size={28} />
      <h3>{unauthorized ? "Your session has expired" : error?.status === 404 ? "Not found" : "Something went wrong"}</h3>
      <p>{error?.message || "Please try again."}</p>
      {unauthorized ? (
        <Link className="btn btn-primary" to="/">
          <LogIn size={16} /> Log in again
        </Link>
      ) : (
        onRetry && (
          <button type="button" className="btn btn-secondary" onClick={onRetry}>
            Try again
          </button>
        )
      )}
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, children, action }) {
  return (
    <div className="state-card">
      <Icon size={28} />
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

export function Alert({ type = "error", children }) {
  if (!children) return null;
  return (
    <div className={`alert alert-${type}`} role={type === "error" ? "alert" : "status"}>
      {children}
    </div>
  );
}
