import LoginForm from "@/components/LoginForm";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, useNavigate } from "react-router";

interface LocationStateFrom {
  from?: {
    pathname: string;
  };
}

export default function LoginPage() {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as LocationStateFrom | null;

  const from: string = state?.from?.pathname ?? "/dashboard";

  const handleLogin = async (credentials: {
    email: string;
    password: string;
  }) => {
    await login(credentials);
    void navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoginForm onLogin={handleLogin} />
    </div>
  );
}
