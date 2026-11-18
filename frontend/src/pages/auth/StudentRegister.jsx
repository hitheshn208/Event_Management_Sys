import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout.jsx";
import FormField from "../../components/FormField.jsx";
import { Alert } from "../../components/Feedback.jsx";
import { useDocumentTitle } from "../../hooks.js";
import { USN_REGEX } from "../../utils/format.js";
import { useAuthSubmit } from "./useAuthSubmit.js";

function validate({ usn, name, phone, email, password }) {
  if (!USN_REGEX.test(usn)) return "Invalid USN format. Example: 1MS24CS001";
  if (name.trim().length < 2) return "Name must be at least 2 characters long";
  if (!/^\d{10}$/.test(phone.trim())) return "Phone number must be exactly 10 digits";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Please enter a valid email address";
  if (password.length < 6) return "Password must be at least 6 characters long";
  return "";
}

export default function StudentRegister() {
  useDocumentTitle("Student Registration");
  const [form, setForm] = useState({ usn: "", name: "", phone: "", email: "", password: "" });
  const { error, setError, submitting, submit } = useAuthSubmit("/auth/student-register");
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    const data = { ...form, usn: form.usn.trim().toUpperCase(), name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim() };
    const problem = validate(data);
    if (problem) return setError(problem);
    submit(data);
  };

  return (
    <AuthLayout
      theme="student"
      title="Student Registration"
      subtitle="Create your EVENT HUB account"
      footer={<p>Already have an account? <Link to="/auth/student-login">Login with your student account</Link></p>}
    >
      <Alert>{error}</Alert>
      <form className="form" onSubmit={onSubmit} noValidate>
        <div className="form-row">
          <FormField label="USN" htmlFor="usn">
            <input id="usn" className="uppercase" value={form.usn} onChange={set("usn")} placeholder="1MS2XXXXXX" autoFocus required />
          </FormField>
          <FormField label="Name" htmlFor="name">
            <input id="name" value={form.name} onChange={set("name")} placeholder="Your full name" autoComplete="name" required />
          </FormField>
        </div>
        <FormField label="Phone" htmlFor="phone">
          <input id="phone" inputMode="numeric" maxLength={10} value={form.phone} onChange={set("phone")} placeholder="Your 10 digit phone number" autoComplete="tel" required />
        </FormField>
        <FormField label="University Email" htmlFor="email" hint="Use your official university email address">
          <input id="email" type="email" value={form.email} onChange={set("email")} placeholder="mail@university.edu" autoComplete="email" required />
        </FormField>
        <FormField label="Password" htmlFor="password" hint="At least 6 characters">
          <input id="password" type="password" value={form.password} onChange={set("password")} placeholder="Create a password" autoComplete="new-password" required />
        </FormField>
        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
          {submitting ? "Registering..." : "Register"}
        </button>
      </form>
    </AuthLayout>
  );
}
