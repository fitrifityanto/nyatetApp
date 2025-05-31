import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react";

interface AlertMessageProps {
  type: "success" | "error" | "warning" | "info";
  message: string;
  onClose?: () => void;
  className?: string;
}

const AlertMessage: React.FC<AlertMessageProps> = ({
  type,
  message,
  onClose,
  className = "",
}) => {
  const alertClasses = {
    success: "alert-success",
    error: "alert-error",
    warning: "alert-warning",
    info: "alert-info",
  };

  const IconComponent = {
    success: CheckCircle,
    error: AlertTriangle,
    warning: AlertCircle,
    info: Info,
  }[type];

  return (
    <div className={`alert ${alertClasses[type]} ${className}`}>
      <IconComponent className="h-5 w-5" />
      <span>{message}</span>
      {onClose && (
        <button className="btn btn-sm btn-ghost btn-square" onClick={onClose}>
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default AlertMessage;
