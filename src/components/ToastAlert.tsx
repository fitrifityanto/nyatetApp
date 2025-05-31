import { AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import { useEffect, useState } from "react";

interface ToastAlertProps {
  type: "success" | "error" | "info";
  message: string;
  onClose: () => void;
  duration?: number;
}

const ToastAlert: React.FC<ToastAlertProps> = ({
  type,
  message,
  onClose,
  duration = 4000,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Memulai animasi masuk saat komponen dimuat
    setIsAnimating(true);

    // Mengatur timer untuk menyembunyikan alert setelah durasi tertentu
    const timer = setTimeout(() => {
      setIsAnimating(false); // Memulai animasi keluar
      setTimeout(() => {
        setIsVisible(false); // Menyembunyikan komponen setelah animasi keluar selesai
        onClose(); // Memanggil callback onClose
      }, 300); // Durasi animasi keluar
    }, duration);

    // Cleanup timer saat komponen di-unmount atau dependensi berubah
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // Tidak merender komponen jika tidak terlihat
  if (!isVisible) return null;

  // Objek untuk memilih ikon berdasarkan tipe alert
  const icons = {
    success: <CheckCircle className="h-5 w-5" />,
    error: <AlertTriangle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
  };

  // Objek untuk memilih kelas warna Tailwind CSS berdasarkan tipe alert
  const colors = {
    success: "bg-success text-success-content",
    error: "bg-error text-error-content",
    info: "bg-info text-info-content",
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        // Kelas animasi untuk masuk/keluar
        isAnimating ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div className={`alert shadow-lg ${colors[type]} min-w-80 max-w-96`}>
        {icons[type]} {/* Menampilkan ikon sesuai tipe */}
        <span className="flex-1">{message}</span> {/* Menampilkan pesan */}
        <button
          onClick={() => {
            setIsAnimating(false); // Memulai animasi keluar saat tombol close diklik
            setTimeout(() => {
              setIsVisible(false);
              onClose();
            }, 300);
          }}
          className="btn btn-ghost btn-sm btn-circle"
          aria-label="Tutup notifikasi" // Aksesibilitas
        >
          <X className="h-4 w-4" /> {/* Ikon tombol tutup */}
        </button>
      </div>
    </div>
  );
};

export default ToastAlert;
