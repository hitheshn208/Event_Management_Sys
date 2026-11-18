import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import { PageLoader } from "./components/Feedback.jsx";
import AppLayout from "./layouts/AppLayout.jsx";
import { HOME_FOR_ROLE, LOGIN_FOR_ROLE } from "./utils/routes.js";

import Landing from "./pages/Landing.jsx";
import NotFound from "./pages/NotFound.jsx";
import StudentLogin from "./pages/auth/StudentLogin.jsx";
import StudentRegister from "./pages/auth/StudentRegister.jsx";
import OrgLogin from "./pages/auth/OrgLogin.jsx";
import OrgRegister from "./pages/auth/OrgRegister.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";

import StudentDashboard from "./pages/student/Dashboard.jsx";
import StudentRegistrations from "./pages/student/MyRegistrations.jsx";
import StudentEventDetails from "./pages/student/EventDetails.jsx";
import StudentEventRegister from "./pages/student/EventRegister.jsx";

import OrgDashboard from "./pages/org/Dashboard.jsx";
import OrgCreateEvent from "./pages/org/CreateEvent.jsx";
import OrgEditEvent from "./pages/org/EditEvent.jsx";
import OrgRegistrations from "./pages/org/Registrations.jsx";
import OrgEventRegistrations from "./pages/org/EventRegistrations.jsx";

function RequireRole({ role, children }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;
  if (!session) return <Navigate to={LOGIN_FOR_ROLE[role]} replace state={{ from: location.pathname }} />;
  if (session.role !== role) return <Navigate to={HOME_FOR_ROLE[session.role]} replace />;
  return children;
}

function GuestOnly({ children }) {
  const { session, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (session) return <Navigate to={HOME_FOR_ROLE[session.role]} replace />;
  return children;
}

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route path="/auth/student-login" element={<GuestOnly><StudentLogin /></GuestOnly>} />
        <Route path="/auth/student-register" element={<GuestOnly><StudentRegister /></GuestOnly>} />
        <Route path="/auth/organizer-login" element={<GuestOnly><OrgLogin /></GuestOnly>} />
        <Route path="/auth/organizer-register" element={<GuestOnly><OrgRegister /></GuestOnly>} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />

        <Route path="/student" element={<RequireRole role="student"><AppLayout role="student" /></RequireRole>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="registrations" element={<StudentRegistrations />} />
          <Route path="event/:eventId" element={<StudentEventDetails />} />
          <Route path="event/:eventId/register" element={<StudentEventRegister />} />
        </Route>

        <Route path="/organization" element={<RequireRole role="organization"><AppLayout role="organization" /></RequireRole>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<OrgDashboard />} />
          <Route path="organise-event" element={<OrgCreateEvent />} />
          <Route path="registrations" element={<OrgRegistrations />} />
          <Route path="event/:eventId/registrations" element={<OrgEventRegistrations />} />
          <Route path="event/:eventId/edit" element={<OrgEditEvent />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </ToastProvider>
  );
}
