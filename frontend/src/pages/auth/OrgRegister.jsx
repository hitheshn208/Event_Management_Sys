import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout.jsx";
import FormField from "../../components/FormField.jsx";
import { Alert } from "../../components/Feedback.jsx";
import { useDocumentTitle } from "../../hooks.js";
import { useAuthSubmit } from "./useAuthSubmit.js";

export default function OrgRegister() {
  useDocumentTitle("Register Organization");
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const { error, setError, submitting, submit } = useAuthSubmit("/auth/organizer-register");
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    const data = { name: form.name.trim(), username: form.username.trim(), email: form.email.trim(), password: form.password };
    if (data.name.length < 2) return setError("Organization name must be at least 2 characters long");
    if (!/^[a-zA-Z0-9_.-]{3,}$/.test(data.username)) return setError("Username must be at least 3 characters (letters, numbers, _ . -)");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return setError("Please enter a valid email address");
    if (data.password.length < 6) return setError("Password must be at least 6 characters long");
    submit(data);
  };

  return (
    <AuthLayout
      theme="organization"
      title="Register your organization"
      subtitle="Start hosting events on EVENT HUB"
      footer={<p>Login instead? <Link to="/auth/organizer-login">Login as an organizer</Link></p>}
    >
      <Alert>{error}</Alert>
      <form className="form" onSubmit={onSubmit} noValidate>
        <FormField label="Organization Name" htmlFor="name">
          <input id="name" value={form.name} onChange={set("name")} placeholder="Name of your organization" autoFocus required />
        </FormField>
        <FormField label="Organization Username" htmlFor="username">
          <input id="username" value={form.username} onChange={set("username")} placeholder="Username for your organization" autoComplete="username" required />
        </FormField>
        <FormField label="Organization Email" htmlFor="email" hint="Use your organization's/chair's official email">
          <input id="email" type="email" value={form.email} onChange={set("email")} placeholder="contact@club.university.edu" autoComplete="email" required />
        </FormField>
        <FormField label="Password" htmlFor="password">
          <input id="password" type="password" value={form.password} onChange={set("password")} placeholder="Enter a strong password" autoComplete="new-password" required />
        </FormField>
        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
          {submitting ? "Registering..." : "Register"}
        </button>
      </form>
    </AuthLayout>
  );
}
