import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../api";

function PublicRoute({ children }) {
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

  if (status === "authenticated") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default PublicRoute;