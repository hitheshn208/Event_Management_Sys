import { Link } from "react-router-dom";
import Brand from "../components/Brand.jsx";
import { useDocumentTitle } from "../hooks.js";

export default function NotFound() {
  useDocumentTitle("Page not found");
  return (
    <div className="center-page">
      <Brand size="lg" />
      <h1 className="big-code">404</h1>
      <p>We couldn't find that page.</p>
      <Link to="/" className="btn btn-primary">Go home</Link>
    </div>
  );
}
