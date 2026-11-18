import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout.jsx";
import FormField from "../../components/FormField.jsx";
import { Alert } from "../../components/Feedback.jsx";
import { useDocumentTitle } from "../../hooks.js";

// UI only — password reset is not implemented on the backend yet.
export default function ForgotPassword() {
  useDocumentTitle("Reset Password");
  const [account, setAccount] = useState("student");
  const [identifier, setIdentifier] = useState("");
  const [notice, setNotice] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    // TODO: call the password reset API once it exists.
    setNotice("Password reset is coming soon. Please contact your administrator for now.");
  };

  return (
    <AuthLayout
      theme={account}
      title="Reset your password"
      subtitle="We'll help you get back into your account"
      footer={
        <p>
          Remembered it? <Link to={account === "student" ? "/auth/student-login" : "/auth/organizer-login"}>Back to login</Link>
        </p>
      }
    >
      <Alert type="info">{notice}</Alert>
      <form className="form" onSubmit={onSubmit}>
        <div className="segmented" role="radiogroup" aria-label="Account type">
          {[["student", "Student"], ["organization", "Organizer"]].map(([value, label]) => (
            <button key={value} type="button" role="radio" aria-checked={account === value} className={account === value ? "active" : ""} onClick={() => setAccount(value)}>
              {label}
            </button>
          ))}
        </div>
        <FormField label={account === "student" ? "USN or email" : "Username or email"} htmlFor="identifier">
          <input id="identifier" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder={account === "student" ? "1MS24CS001" : "your-org"} required />
        </FormField>
        <button type="submit" className="btn btn-primary btn-block btn-lg">Send reset link</button>
      </form>
    </AuthLayout>
  );
}
