import { AlertTriangle } from "lucide-react";

interface FieldErrorProps {
  error?: string;
}

/**
 * @component FieldError
 * @description Menampilkan pesan error di bawah input form.
 * @param {FieldErrorProps} props - Props untuk komponen.
 */
const FieldError: React.FC<FieldErrorProps> = ({ error }) => {
  // Tidak merender komponen jika tidak ada pesan error
  if (!error) return null;

  return (
    <label className="label">
      <span className="label-text-alt text-error flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" /> {/* Ikon peringatan */}
        {error} {/* Pesan error */}
      </span>
    </label>
  );
};

export default FieldError;
