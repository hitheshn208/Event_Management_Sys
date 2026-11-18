import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout.jsx";
import FormField from "../../components/FormField.jsx";
import { Alert } from "../../components/Feedback.jsx";
import { useDocumentTitle } from "../../hooks.js";
import { useAuthSubmit } from "./useAuthSubmit.js";

export default function OrgLogin() {
  useDocumentTitle("Organizer Login");
  const [form, setForm] = useState({ username: "", password: "", remember: false });
  const { error, submitting, submit } = useAuthSubmit("/auth/organizer-login");

  const onSubmit = (e) => {
    e.preventDefault();
    // TODO: "remember" is not handled by the backend yet.
    submit({ username: form.username.trim(), password: form.password, remember: form.remember });
  };

  return (
    <AuthLayout
      theme="organization"
      title="Organizer Login"
      subtitle="Manage your events and registrations"
      footer={
        <>
          <p>New organization? <Link to="/auth/organizer-register">Register your organization</Link></p>
          <p>Forgot your password? <Link to="/auth/forgot-password">Reset here</Link></p>
        </>
      }
    >
      <Alert>{error}</Alert>
      <form className="form" onSubmit={onSubmit}>
        <FormField label="Organization Username" htmlFor="username" hint="Organization's username here">
          <input id="username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Username" autoComplete="username" autoFocus required />
        </FormField>
        <FormField label="Password" htmlFor="password">
          <input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Enter your password" autoComplete="current-password" required />
        </FormField>
        <label className="checkbox">
          <input type="checkbox" checked={form.remember} onChange={(e) => setForm({ ...form, remember: e.target.checked })} />
          Remember me
        </label>
        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
          {submitting ? "Logging in..." : "Login"}
        </button>
      </form>
    </AuthLayout>
  );
}
