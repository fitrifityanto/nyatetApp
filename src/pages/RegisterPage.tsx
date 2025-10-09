import RegisterForm from "@/components/RegisterForm";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage() {
  const { register } = useAuth();

  const handleRegister = async (credentials: {
    email: string;
    password: string;
    fullName: string;
  }) => {
    // Panggil fungsi register dari hook useAuth
    await register(credentials);
    // Kamu bisa tambah logic setelah register berhasil,
    // misal redirect ke halaman login atau tampilkan notifikasi
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <RegisterForm onRegister={handleRegister} />
    </div>
  );
}
