import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import FormCatatanEdit from "@/components/forms/FormCatatanEdit";
import { useCatatan } from "@/hooks/useCatatan";
import type { Catatan } from "@/types/catatan.types";

const CatatanEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCatatanById } = useCatatan();

  const [catatan, setCatatan] = useState<Catatan | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCatatan = async () => {
      if (!id) {
        setPageError("ID catatan tidak ditemukan");
        setPageLoading(false);
        return;
      }

      try {
        setPageLoading(true);
        setPageError(null);

        const result = await getCatatanById(id);

        if (result.success && result.data) {
          setCatatan(result.data);
        } else {
          setPageError(result.message ?? "Catatan tidak ditemukan");
        }
      } catch (err) {
        console.error("Error fetching catatan:", err);
        setPageError("Gagal mengambil data catatan");
      } finally {
        setPageLoading(false);
      }
    };

    void fetchCatatan();
  }, [id, getCatatanById]);

  const handleSuccess = () => {
    if (!id) {
      console.error("ID tidak ditemukan");
      return;
    }
    // Kembali ke halaman detail setelah berhasil edit
    void navigate(`/catatan/${id}`);
  };

  const handleCancel = () => {
    if (!id) {
      console.error("ID tidak ditemukan");
      return;
    }
    // Kembali ke halaman detail jika dibatalkan
    void navigate(`/catatan/${id}`);
  };

  const handleBackToDetail = () => {
    if (!id) {
      console.error("ID tidak ditemukan");
      return;
    }
    void navigate(`/catatan/${id}`);
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-base-200">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-base-content/70">Memuat data catatan...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (pageError || !catatan) {
    return (
      <div className="min-h-screen bg-base-200">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <div className="mb-6">
            <button
              type="button"
              onClick={() => void navigate("/catatan")}
              className="btn btn-ghost gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Daftar Catatan
            </button>
          </div>

          {/* Error State */}
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-error mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-base-content mb-2">
                Catatan Tidak Ditemukan
              </h2>
              <p className="text-base-content/70 mb-6">
                {pageError ??
                  "Catatan yang Anda cari tidak ditemukan atau telah dihapus."}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => void navigate("/catatan")}
                  className="btn btn-primary"
                >
                  Kembali ke Daftar Catatan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.location.reload();
                  }}
                  className="btn btn-ghost"
                >
                  Coba Lagi
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={handleBackToDetail}
            className="btn btn-ghost gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Detail
          </button>
        </div>

        {/* Form Edit */}
        <FormCatatanEdit
          catatan={catatan}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          className="max-w-4xl"
        />
      </div>
    </div>
  );
};

export default CatatanEditPage;
