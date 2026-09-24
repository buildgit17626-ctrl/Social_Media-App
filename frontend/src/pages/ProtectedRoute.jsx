import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../api";

function ProtectedRoute({ children }) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    api
      .get("/users/me")
      .then(() => {
        setStatus("authenticated");
      })
      .catch(() => {
        setStatus("unauthenticated");
      });
  }, []);

  if (status === "checking") {
    return <p>Checking authentication...</p>;
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;