import React, { useEffect } from "react";
import PasswordModal, { usePasswordModal } from "@/components/Modals/Password";
import { FullScreenLoader } from "@/components/Preloader";
import { Navigate } from "react-router-dom";
import paths from "@/utils/paths";
import useQuery from "@/hooks/useQuery";
import showToast from "@/utils/toast";

const CONNECTION_ERROR_KEY = "anythingllm_connection_error";

export default function Login() {
  const query = useQuery();
  const { loading, requiresAuth, mode } = usePasswordModal(!!query.get("nt"));

  useEffect(() => {
    if (window.sessionStorage.getItem(CONNECTION_ERROR_KEY)) {
      window.sessionStorage.removeItem(CONNECTION_ERROR_KEY);
      showToast(
        "Could not reach the server. Make sure the backend is running (e.g. yarn dev:server on port 3001).",
        "error",
        { autoClose: 8000 }
      );
    }
  }, []);

  if (loading) return <FullScreenLoader />;
  if (requiresAuth === false) return <Navigate to={paths.home()} />;

  return <PasswordModal mode={mode} />;
}
