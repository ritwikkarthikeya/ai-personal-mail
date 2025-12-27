import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("token");

    if (!token) {
      navigate("/login?error=missing_token", { replace: true });
      return;
    }

    localStorage.setItem("token", token);
    navigate("/dashboard", { replace: true });
  }, [params, navigate]);

  return <p>Logging you in...</p>;
}
