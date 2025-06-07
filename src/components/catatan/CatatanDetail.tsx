import { useEffect, useState } from "react";

import ReactMarkdown from "react-markdown";
import {
  FileText,
  Folder,
  Tag,
  Bookmark,
  Archive,
  CalendarDays,
  Clock,
} from "lucide-react";
import supabase from "../../lib/supabase";

type Props = {
  id: string;
};

type Catatan = {
  judul_catatan: string;
  isi_catatan: string | null;
  is_archived: boolean;
  pinned: boolean;
  created_at: string;
  updated_at: string;
  kategori_catatan?: { nama: string };
  folder_catatan?: { nama: string };
};

const CatatanDetail = ({ id }: Props) => {
  const [catatan, setCatatan] = useState<Catatan | null>(null);
  const [loading, setLoading] = useState(true);

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

      if (error || !data) {
        console.error(
          "Error fetching catatan:",
          error?.message || "Data not found",
        );
        setCatatan(null);
      } else {
        setCatatan(data);
      }

      setLoading(false);
    };

    fetchCatatan();
  }, [id]);

  if (loading) return <p className="text-center">Loading...</p>;
  if (!catatan)
    return <p className="text-center text-error">Catatan not found.</p>;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto w-full">
      {/* Header */}
      <header className="space-y-4">
        <h1 className="text-3xl font-bold flex items-start gap-3 leading-tight">
          <FileText className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
          <span className="break-words">{catatan.judul_catatan}</span>
        </h1>

        {/* Metadata info */}
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

      {/* Content */}
      <article className="prose prose-lg dark:prose-invert max-w-none">
        <ReactMarkdown
          components={{
            // Custom styling untuk elemen markdown
            p: ({ children }) => {
              // Deteksi apakah ada teks Arab
              const textContent =
                typeof children === "string"
                  ? children
                  : Array.isArray(children)
                    ? children.join("")
                    : String(children);
              const hasArabic =
                /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(
                  textContent,
                );
              const hasLatin = /[A-Za-z]/.test(textContent);

              if (hasArabic && !hasLatin) {
                // Pure Arabic text
                return (
                  <p
                    className="font-arabic mb-4 leading-relaxed text-gray-800 dark:text-gray-200 text-right"
                    dir="rtl"
                  >
                    {children}
                  </p>
                );
              } else if (hasArabic && hasLatin) {
                // Mixed text
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
                // Regular text
                return (
                  <p className="mb-4 leading-relaxed text-gray-800 dark:text-gray-200">
                    {children}
                  </p>
                );
              }
            },
            h1: ({ children }) => {
              const textContent =
                typeof children === "string" ? children : String(children);
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
              const textContent =
                typeof children === "string" ? children : String(children);
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
              const textContent =
                typeof children === "string" ? children : String(children);
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
              const textContent =
                typeof children === "string" ? children : String(children);
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
          {catatan.isi_catatan || "*Konten kosong*"}
        </ReactMarkdown>
      </article>

      {/* Footer metadata */}
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
            <span>Kategori: {catatan.kategori_catatan?.nama || "-"}</span>
            <span>Folder: {catatan.folder_catatan?.nama || "-"}</span>
            <span>Status: {catatan.is_archived ? "Diarsipkan" : "Aktif"}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CatatanDetail;
