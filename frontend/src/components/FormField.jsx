export default function FormField({ label, htmlFor, required, hint, children, className = "" }) {
  return (
    <div className={`field ${className}`}>
      {label && (
        <label htmlFor={htmlFor}>
          {label} {required && <span className="req">*</span>}
        </label>
      )}
      {children}
      {hint && <small className="hint">{hint}</small>}
    </div>
  );
}
