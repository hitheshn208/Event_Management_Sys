import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.jsx";

/** Shared submit flow for login/register forms: POST, refresh session, redirect. */
export function useAuthSubmit(endpoint) {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { refresh } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const submit = async (body) => {
    setError("");
    setSubmitting(true);
    try {
      const data = await api(endpoint, { method: "POST", body });
      await refresh();
      navigate(location.state?.from || data.redirecturl || "/", { replace: true });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return { error, setError, submitting, submit };
}
