import { Navigate } from "react-router-dom";

/** Legacy route — redirects to the Festive collection. */
export default function Women() {
  return <Navigate to="/collection/festive" replace />;
}
