import { Navigate } from "react-router-dom";

/** Legacy route — redirects to the Bridal collection. */
export default function Men() {
  return <Navigate to="/collection/bridal" replace />;
}
