import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout.jsx";
import FormField from "../../components/FormField.jsx";
import { Alert } from "../../components/Feedback.jsx";
import { useDocumentTitle } from "../../hooks.js";
import { USN_REGEX } from "../../utils/format.js";
import { useAuthSubmit } from "./useAuthSubmit.js";

export default function StudentLogin() {
  useDocumentTitle("Student Login");
  const [form, setForm] = useState({ usn: "", password: "", remember: false });
  const { error, setError, submitting, submit } = useAuthSubmit("/auth/student-login");

  const onSubmit = (e) => {
    e.preventDefault();
    const usn = form.usn.trim().toUpperCase();
    if (!USN_REGEX.test(usn)) return setError("Invalid USN format. Example: 1MS24CS001");
    // TODO: "remember" is not handled by the backend yet.
    submit({ usn, password: form.password, remember: form.remember });
  };

  return (
    <AuthLayout
      theme="student"
      title="Student Login"
      subtitle="Access your event dashboard"
      footer={
        <>
          <p>Don't have an account? <Link to="/auth/student-register">Sign up as Student</Link></p>
          <p>Forgot your password? <Link to="/auth/forgot-password">Reset here</Link></p>
        </>
      }
    >
      <Alert>{error}</Alert>
      <form className="form" onSubmit={onSubmit} noValidate>
        <FormField label="USN" htmlFor="usn" hint="Format: 1MS2XXXXXX (e.g., 1MS24CS001)">
          <input id="usn" className="uppercase" value={form.usn} onChange={(e) => setForm({ ...form, usn: e.target.value })} placeholder="1MS2XXXXXX" autoComplete="username" autoFocus required />
        </FormField>
        <FormField label="Password" htmlFor="password">
          <input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Enter your password" autoComplete="current-password" required />
        </FormField>
        <label className="checkbox">
          <input type="checkbox" checked={form.remember} onChange={(e) => setForm({ ...form, remember: e.target.checked })} />
          Remember me
        </label>
        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting || !form.usn || !form.password}>
          {submitting ? "Logging in..." : "Login"}
        </button>
      </form>
    </AuthLayout>
  );
}
