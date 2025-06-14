import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import ReactMarkdown from "react-markdown";
import {
  FileText,
  Folder,
  Tag,
  Bookmark,
  Archive,
  CalendarDays,
  Clock,
  ArrowLeft,
  Edit,
  Trash2,
  ChevronRight,
} from "lucide-react";
import supabase from "../../lib/supabase";
import ToastAlert from "../ToastAlert";

interface Props {
  id: string;
}

interface Catatan {
  judul_catatan: string;
  isi_catatan: string | null;
  is_archived: boolean;
  pinned: boolean;
  created_at: string;
  updated_at: string;
  kategori_catatan?: { nama: string };
  folder_catatan?: { nama: string };
}

interface ToastType {
  type: "success" | "error" | "info";
  message: string;
  show: boolean;
}

const getPlainText = (node: React.ReactNode): string => {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(getPlainText).join("");
  }
  // Periksa elemen React (misalnya <em>, <strong>)
  if (React.isValidElement(node)) {
    // Type assertion: Memberi tahu TypeScript bahwa props elemen ini mungkin memiliki properti children.
    const elementProps = node.props as { children?: React.ReactNode };

    if (elementProps.children !== undefined) {
      return getPlainText(elementProps.children);
    }
  }
  return ""; // Abaikan tipe lain (boolean, null, undefined) atau elemen tanpa children
};

const CatatanDetail = ({ id }: Props) => {
  const [catatan, setCatatan] = useState<Catatan | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toast, setToast] = useState<ToastType>({
    type: "info",
    message: "",
    show: false,
  });
  const navigate = useNavigate();

  const showToast = (type: "success" | "error" | "info", message: string) => {
    setToast({ type, message, show: true });
  };

  const closeToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  useEffect(() => {
    const fetchCatatan = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("catatan")
        .select(
          `
    judul_catatan,
    isi_catatan,
    is_archived,
    pinned,
    created_at,
    updated_at,
    kategori_catatan (
      nama
    ),
    folder_catatan (
      nama
    )
  `,
        )
        .eq("id", id)
        .single<Catatan>();

      if (error) {
        console.error(
          "Error fetching catatan:",
          error.message || "Data not found",
        );
        setCatatan(null);
      } else {
        setCatatan(data);
      }

      setLoading(false);
    };

    void fetchCatatan();
  }, [id]);

  const handleBack = () => {
    void navigate("/catatan");
  };

  const handleEdit = () => {
    void navigate(`/catatan/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!catatan) return;

    try {
      const { error } = await supabase.from("catatan").delete().eq("id", id);

      if (error) {
        console.error("Error deleting catatan:", error.message);
        showToast("error", "Gagal menghapus catatan. Silakan coba lagi.");
      } else {
        showToast("success", "Catatan berhasil dihapus.");

        setTimeout(() => {
          void navigate("/catatan");
        }, 1500);
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("error", "Terjadi kesalahan. Silakan coba lagi.");
    }
    setShowDeleteModal(false);
  };

  const confirmDelete = () => {
    setShowDeleteModal(true);
  };

  if (loading) return <p className="text-center">Loading...</p>;
  if (!catatan)
    return <p className="text-center text-error">Catatan not found.</p>;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto w-full">
      {toast.show && (
        <ToastAlert
          type={toast.type}
          message={toast.message}
          onClose={closeToast}
          duration={4000}
        />
      )}

      <nav className="space-y-2">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Catatan
        </button>

        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span
            className="hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
            onClick={() => void navigate("/catatan")}
          >
            Catatan
          </span>
          {catatan.kategori_catatan?.nama && (
            <>
              <ChevronRight className="w-3 h-3" />
              <span>{catatan.kategori_catatan.nama}</span>
            </>
          )}
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-700 dark:text-gray-300 font-medium">
            {catatan.judul_catatan}
          </span>
        </div>
      </nav>

      <header className="space-y-4">
        <h1 className="text-3xl font-bold flex items-start gap-3 leading-tight">
          <FileText className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
          <span className="break-words">{catatan.judul_catatan}</span>
        </h1>

        <div className="hidden lg:flex items-center gap-2">
          <button
            type="button"
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            title="Edit Catatan"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            type="button"
            onClick={confirmDelete}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            title="Hapus Catatan"
          >
            <Trash2 className="w-4 h-4" />
            Hapus
          </button>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <CalendarDays className="w-4 h-4" />
            <span>{new Date(catatan.created_at).toLocaleDateString()}</span>
          </div>
          {catatan.kategori_catatan?.nama && (
            <div className="flex items-center gap-1">
              <Tag className="w-4 h-4" />
              <span>{catatan.kategori_catatan.nama}</span>
            </div>
          )}
          {catatan.folder_catatan?.nama && (
            <div className="flex items-center gap-1">
              <Folder className="w-4 h-4" />
              <span>{catatan.folder_catatan.nama}</span>
            </div>
          )}
          {catatan.pinned && (
            <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
              <Bookmark className="w-4 h-4" />
              <span>Pinned</span>
            </div>
          )}
          {catatan.is_archived && (
            <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
              <Archive className="w-4 h-4" />
              <span>Archived</span>
            </div>
          )}
        </div>
      </header>

      <article className="prose prose-lg dark:prose-invert max-w-none">
        <ReactMarkdown
          components={{
            p: ({ children }) => {
              const textContent = getPlainText(children);

              const hasArabic =
                /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(
                  textContent,
                );
              const hasLatin = /[A-Za-z]/.test(textContent);

              if (hasArabic && !hasLatin) {
                return (
                  <p
                    className="font-arabic mb-4 leading-relaxed text-gray-800 dark:text-gray-200 text-right"
                    dir="rtl"
                  >
                    {children}
                  </p>
                );
              } else if (hasArabic && hasLatin) {
                return (
                  <p
                    className="mb-4 leading-relaxed text-gray-800 dark:text-gray-200 text-left"
                    dir="ltr"
                  >
                    <span
                      className="font-arabic inline-block w-full text-right"
                      dir="rtl"
                    >
                      {children}
                    </span>
                  </p>
                );
              } else {
                return (
                  <p className="mb-4 leading-relaxed text-gray-800 dark:text-gray-200">
                    {children}
                  </p>
                );
              }
            },
            h1: ({ children }) => {
              const textContent = getPlainText(children);
              const hasArabic =
                /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(
                  textContent,
                );

              return (
                <h1
                  className={`text-2xl font-bold mb-4 mt-8 first:mt-0 text-gray-900 dark:text-gray-100 ${hasArabic ? "font-arabic text-right" : ""}`}
                  dir={hasArabic ? "rtl" : "ltr"}
                >
                  {children}
                </h1>
              );
            },
            h2: ({ children }) => {
              const textContent = getPlainText(children);
              const hasArabic =
                /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(
                  textContent,
                );

              return (
                <h2
                  className={`text-xl font-semibold mb-3 mt-6 first:mt-0 text-gray-900 dark:text-gray-100 ${hasArabic ? "font-arabic text-right" : ""}`}
                  dir={hasArabic ? "rtl" : "ltr"}
                >
                  {children}
                </h2>
              );
            },
            h3: ({ children }) => {
              const textContent = getPlainText(children);
              const hasArabic =
                /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(
                  textContent,
                );

              return (
                <h3
                  className={`text-lg font-medium mb-2 mt-5 first:mt-0 text-gray-900 dark:text-gray-100 ${hasArabic ? "font-arabic text-right" : ""}`}
                  dir={hasArabic ? "rtl" : "ltr"}
                >
                  {children}
                </h3>
              );
            },
            ul: ({ children }) => (
              <ul className="list-disc list-inside mb-4 space-y-2 text-gray-800 dark:text-gray-200 ml-4">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-800 dark:text-gray-200 ml-4">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="leading-relaxed">{children}</li>
            ),
            blockquote: ({ children }) => {
              const textContent = getPlainText(children);
              const hasArabic =
                /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(
                  textContent,
                );

              return (
                <blockquote
                  className={`border-l-4 border-gray-300 dark:border-gray-600 pl-6 my-6 text-gray-700 dark:text-gray-300 italic ${hasArabic ? "font-arabic text-right border-r-4 border-l-0 pr-6 pl-0" : ""}`}
                  dir={hasArabic ? "rtl" : "ltr"}
                >
                  {children}
                </blockquote>
              );
            },
            code: ({ children, className }) => {
              const isInline = !className;
              if (isInline) {
                return (
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono text-gray-800 dark:text-gray-200">
                    {children}
                  </code>
                );
              }
              return (
                <code className="block bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-4 rounded my-4 text-sm font-mono whitespace-pre-wrap break-words">
                  {children}
                </code>
              );
            },
            pre: ({ children }) => (
              <pre className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-4 rounded my-4 overflow-x-auto">
                {children}
              </pre>
            ),
            a: ({ children, href }) => (
              <a
                href={href}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline break-words"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-gray-900 dark:text-gray-100">
                {children}
              </strong>
            ),
            em: ({ children }) => (
              <em className="italic text-gray-700 dark:text-gray-300">
                {children}
              </em>
            ),
            hr: () => (
              <hr className="my-8 border-gray-200 dark:border-gray-700" />
            ),
          }}
        >
          {catatan.isi_catatan ?? "*Konten kosong*"}
        </ReactMarkdown>
      </article>

      <footer className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8">
        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>
              Terakhir diperbarui:{" "}
              {new Date(catatan.updated_at).toLocaleString()}
            </span>
          </div>
          <div className="flex flex-wrap gap-4 text-xs">
            <span>Kategori: {catatan.kategori_catatan?.nama ?? "-"}</span>
            <span>Folder: {catatan.folder_catatan?.nama ?? "-"}</span>
            <span>Status: {catatan.is_archived ? "Diarsipkan" : "Aktif"}</span>
          </div>
        </div>
      </footer>

      {/* Floating Action Buttons - Mobile/Tablet only */}
      <div className="lg:hidden fixed bottom-6 right-6 flex flex-col gap-3 z-40">
        <button
          type="button"
          onClick={handleEdit}
          className="w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
          title="Edit Catatan"
        >
          <Edit className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={confirmDelete}
          className="w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
          title="Hapus Catatan"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-gradient-to-br from-white/10 to-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Konfirmasi Penghapusan
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Apakah Anda yakin ingin menghapus catatan "{catatan.judul_catatan}
              "? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                }}
                className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => void handleDelete()}
                className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatatanDetail;
