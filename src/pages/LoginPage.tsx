import LoginForm from "../components/LoginForm";
import { useAuth } from "../hooks/useAuth";
import { useLocation, useNavigate } from "react-router"; // Tetap import dari "react-router"

// Anda mungkin perlu mendefinisikan tipe untuk state lokasi Anda jika tidak ada secara default
interface LocationStateFrom {
  from?: {
    pathname: string;
  };
}

export default function LoginPage() {
  const { login } = useAuth();
  const location = useLocation(); // Tidak ada argumen tipe di sini
  const navigate = useNavigate();

  // Melakukan type assertion pada location.state
  const state = location.state as LocationStateFrom | null;

  // Menggunakan nullish coalescing operator (??) dan memastikan 'from' adalah string
  // Mengakses state?.from?.pathname
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
