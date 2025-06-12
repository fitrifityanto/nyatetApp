import {
  AlignLeft,
  Archive,
  Folder,
  Heading,
  Loader2,
  Pin,
  Plus,
  RotateCcw,
  Save,
  StickyNote,
  Tags,
  X,
  Check,
} from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import type { FolderOption, KategoriOption } from "../../types/catatan.types";
import { useCatatan } from "../../hooks/useCatatan";
import { useFormCatatan } from "../../hooks/useFormCatatan";
import { useDynamicOptions } from "../../hooks/useDynamicOptions";
import FieldError from "../FieldError";
import ToastAlert from "../ToastAlert";

interface FormCatatanAddProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  kategoris?: KategoriOption[];
  folders?: FolderOption[];
  className?: string;
  setParentToastAlert: (toast: {
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }) => void; // Prop baru untuk set toast di parent
}

const FormCatatanAdd: React.FC<FormCatatanAddProps> = ({
  onSuccess,
  onCancel,
  kategoris: initialKategorisFromProps = [],
  folders: initialFoldersFromProps = [],
  className = "",
  setParentToastAlert, // Terima prop baru
}) => {
  const {
    createCatatan,
    isLoading,
    error,
    success,
    clearMessages,
    fetchKategoris,
    fetchFolders,
  } = useCatatan();

  const {
    formData,
    errors,
    isDirty,
    updateField,
    validateForm,
    resetForm,
    saveDraft,
    loadDraft,
    clearDraft,
    getSubmissionData,
    DEFAULT_KATEGORI_NAMA, // Import default values from useFormCatatan
    DEFAULT_FOLDER_NAMA, // Import default values from useFormCatatan
  } = useFormCatatan();

  // Memoize initial arrays to prevent re-renders in useDynamicOptions's useEffect
  const memoizedInitialKategoris = useMemo(
    () => initialKategorisFromProps,
    [initialKategorisFromProps],
  );
  const memoizedInitialFolders = useMemo(
    () => initialFoldersFromProps,
    [initialFoldersFromProps],
  );

  const {
    kategoris,
    folders,
    showAddKategori,
    setShowAddKategori,
    newKategoriName,
    setNewKategoriName,
    showAddFolder,
    setShowAddFolder,
    newFolderName,
    setNewFolderName,
    addKategoriLocally,
    addFolderLocally,
    refreshOptions,
  } = useDynamicOptions({
    initialKategoris: memoizedInitialKategoris,
    initialFolders: memoizedInitialFolders,
    fetchKategoris,
    fetchFolders,
  });

  const [draftToast, setDraftToast] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({
    show: false,
    type: "success",
    message: "",
  });

  // Load draft saat komponen dimuat
  useEffect(() => {
    loadDraft();
  }, [loadDraft]);

  // Handle success message (pindah ke parent)
  useEffect(() => {
    if (success) {
      setParentToastAlert({
        show: true,
        type: "success",
        message: success,
      });

      if (onSuccess) {
        onSuccess(); // Tutup modal
      }
    }
  }, [success, setParentToastAlert, onSuccess]);

  // Handle error message (pindah ke parent)
  useEffect(() => {
    if (error) {
      setParentToastAlert({
        show: true,
        type: "error",
        message: error,
      });
    }
  }, [error, setParentToastAlert]);

  const handleAddKategori = useCallback(() => {
    if (newKategoriName.trim()) {
      const newKategori = addKategoriLocally(newKategoriName);
      if (newKategori) {
        updateField("kategori_nama", newKategori.name);
      }
      setNewKategoriName("");
      setShowAddKategori(false);
    }
  }, [newKategoriName, addKategoriLocally, updateField]);

  const handleAddFolder = useCallback(() => {
    if (newFolderName.trim()) {
      const newFolder = addFolderLocally(newFolderName);
      if (newFolder) {
        updateField("folder_nama", newFolder.name);
      }
      setNewFolderName("");
      setShowAddFolder(false);
    }
  }, [newFolderName, addFolderLocally, updateField]);

  const handleCancelAddKategori = useCallback(() => {
    setShowAddKategori(false);
    setNewKategoriName("");
  }, []);

  const handleCancelAddFolder = useCallback(() => {
    setShowAddFolder(false);
    setNewFolderName("");
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      clearMessages();
      setParentToastAlert({ show: false, type: "success", message: "" });

      if (!validateForm()) {
        return;
      }

      try {
        const submissionData = getSubmissionData();

        const result = await createCatatan(submissionData);

        if (result.success) {
          clearDraft();
          resetForm();
          await refreshOptions();
          // onSuccess akan dipanggil oleh useEffect(success) di atas, yang akan menutup modal
          // dan memicu setParentToastAlert untuk menampilkan pesan sukses.
        }
      } catch (err) {
        console.error("Error in form submission:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan yang tidak terduga";
        setParentToastAlert({
          show: true,
          type: "error",
          message: errorMessage,
        });
      }
    },
    [
      clearMessages,
      validateForm,
      getSubmissionData,
      createCatatan,
      clearDraft,
      resetForm,
      refreshOptions,
      setParentToastAlert,
    ],
  );

  const handleSaveDraft = useCallback(() => {
    try {
      const saved = saveDraft();
      if (saved) {
        setDraftToast({
          show: true,
          type: "success",
          message: "Draft berhasil disimpan!",
        });
      } else {
        setDraftToast({
          show: true,
          type: "error",
          message: "Tidak ada perubahan untuk disimpan",
        });
      }
    } catch (err) {
      console.error("Error saving draft:", err);
      setDraftToast({
        show: true,
        type: "error",
        message: "Gagal menyimpan draft",
      });
    }
  }, [saveDraft]);

  const handleReset = useCallback(() => {
    resetForm();
    clearDraft();
    clearMessages();
    setParentToastAlert({ show: false, type: "success", message: "" }); // Clear toast alert di parent
    setDraftToast({ show: false, type: "success", message: "" });
  }, [resetForm, clearDraft, clearMessages, setParentToastAlert]);

  const closeDraftToast = useCallback(() => {
    setDraftToast({ show: false, type: "success", message: "" });
  }, []);

  return (
    <>
      <div className={`max-w-3xl mx-auto ${className}`}>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-base-content mb-2 flex items-center justify-center gap-2">
            <StickyNote className="h-8 w-8 text-primary" />
            Tambah Catatan Baru
          </h1>
          <p className="text-base-content/70">
            Buat catatan baru untuk menyimpan ide dan pemikiran Anda
          </p>
        </div>

        {/* Form Card */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
              {/* Judul Catatan */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-2">
                    <Heading className="h-4 w-4 text-primary" />
                    Judul Catatan *
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.judul_catatan}
                  onChange={(e) => {
                    updateField("judul_catatan", e.target.value);
                  }}
                  placeholder="Masukkan judul catatan..."
                  className={`input input-bordered w-full focus:input-primary ${
                    errors.judul_catatan ? "input-error" : ""
                  }`}
                  disabled={isLoading}
                  aria-invalid={errors.judul_catatan ? "true" : "false"}
                />
                <FieldError error={errors.judul_catatan} />
              </div>

              {/* Isi Catatan */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-2">
                    <AlignLeft className="h-4 w-4 text-primary" />
                    Isi Catatan
                  </span>
                </label>
                <textarea
                  value={formData.isi_catatan}
                  onChange={(e) => {
                    updateField("isi_catatan", e.target.value);
                  }}
                  className={`textarea textarea-bordered h-96 w-full focus:textarea-primary resize-y ${
                    errors.isi_catatan ? "textarea-error" : ""
                  }`}
                  placeholder="Tulis isi catatan Anda di sini..."
                  disabled={isLoading}
                  aria-invalid={errors.isi_catatan ? "true" : "false"}
                />
                <FieldError error={errors.isi_catatan} />
              </div>

              {/* Kategori dan Folder */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Kategori */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold flex items-center gap-2">
                      <Tags className="h-4 w-4 text-primary" />
                      Kategori
                    </span>
                  </label>

                  {!showAddKategori ? (
                    <div className="flex gap-2">
                      <select
                        value={formData.kategori_nama}
                        onChange={(e) => {
                          updateField("kategori_nama", e.target.value);
                        }}
                        className={`select select-bordered w-full focus:select-primary ${
                          errors.kategori_nama ? "select-error" : ""
                        }`}
                        disabled={isLoading}
                      >
                        {/* Always show default option first */}
                        <option value={DEFAULT_KATEGORI_NAMA}>
                          {DEFAULT_KATEGORI_NAMA}
                        </option>
                        {/* Filter out default if it's already explicitly in categories list */}
                        {kategoris
                          .filter((k) => k.name !== DEFAULT_KATEGORI_NAMA)
                          .map((kategori) => (
                            <option key={kategori.id} value={kategori.name}>
                              {kategori.name}
                            </option>
                          ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddKategori(true);
                        }}
                        className="btn btn-outline btn-primary btn-square"
                        disabled={isLoading}
                        title="Tambah kategori baru"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newKategoriName}
                        onChange={(e) => {
                          setNewKategoriName(e.target.value);
                        }}
                        placeholder="Nama kategori baru..."
                        className="input input-bordered w-full focus:input-primary"
                        disabled={isLoading}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddKategori();
                          } else if (e.key === "Escape") {
                            handleCancelAddKategori();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddKategori}
                        className="btn btn-primary btn-square"
                        disabled={isLoading || !newKategoriName.trim()}
                        title="Simpan kategori"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelAddKategori}
                        className="btn btn-ghost btn-square"
                        disabled={isLoading}
                        title="Batal"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <FieldError error={errors.kategori_nama} />
                </div>

                {/* Folder */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold flex items-center gap-2">
                      <Folder className="h-4 w-4 text-primary" />
                      Folder
                    </span>
                  </label>

                  {!showAddFolder ? (
                    <div className="flex gap-2">
                      <select
                        value={formData.folder_nama}
                        onChange={(e) => {
                          updateField("folder_nama", e.target.value);
                        }}
                        className={`select select-bordered w-full focus:select-primary ${
                          errors.folder_nama ? "select-error" : ""
                        }`}
                        disabled={isLoading}
                      >
                        {/* Always show default option first */}
                        <option value={DEFAULT_FOLDER_NAMA}>
                          {DEFAULT_FOLDER_NAMA}
                        </option>
                        {/* Filter out default if it's already explicitly in folders list */}
                        {folders
                          .filter((f) => f.name !== DEFAULT_FOLDER_NAMA)
                          .map((folder) => (
                            <option key={folder.id} value={folder.name}>
                              {folder.name}
                            </option>
                          ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddFolder(true);
                        }}
                        className="btn btn-outline btn-primary btn-square"
                        disabled={isLoading}
                        title="Tambah folder baru"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newFolderName}
                        onChange={(e) => {
                          setNewFolderName(e.target.value);
                        }}
                        placeholder="Nama folder baru..."
                        className="input input-bordered w-full focus:input-primary"
                        disabled={isLoading}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddFolder();
                          } else if (e.key === "Escape") {
                            handleCancelAddFolder();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddFolder}
                        className="btn btn-primary btn-square"
                        disabled={isLoading || !newFolderName.trim()}
                        title="Simpan folder"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelAddFolder}
                        className="btn btn-ghost btn-square"
                        disabled={isLoading}
                        title="Batal"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <FieldError error={errors.folder_nama} />
                </div>
              </div>

              {/* Checkbox Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="label cursor-pointer justify-start">
                    <input
                      type="checkbox"
                      checked={formData.pinned}
                      onChange={(e) => {
                        updateField("pinned", e.target.checked);
                      }}
                      className="checkbox checkbox-primary mr-3 flex-shrink-0"
                      disabled={isLoading}
                    />
                    <span className="label-text flex items-center gap-2">
                      <Pin className="h-4 w-4 text-warning flex-shrink-0" />
                      Pin Catatan
                    </span>
                  </label>
                  <div className="ml-7">
                    <span className="label-text-alt text-xs leading-relaxed block">
                      Catatan yang di-pin akan muncul di atas
                    </span>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer justify-start">
                    <input
                      type="checkbox"
                      checked={formData.is_archived}
                      onChange={(e) => {
                        updateField("is_archived", e.target.checked);
                      }}
                      className="checkbox checkbox-secondary mr-3 flex-shrink-0"
                      disabled={isLoading}
                    />
                    <span className="label-text flex items-center gap-2">
                      <Archive className="h-4 w-4 text-info flex-shrink-0" />
                      Arsipkan
                    </span>
                  </label>
                  <div className="ml-7">
                    <span className="label-text-alt text-xs leading-relaxed block">
                      Catatan arsip tidak akan muncul di halaman beranda
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="form-control mt-8">
                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                  {onCancel && (
                    <button
                      type="button"
                      onClick={onCancel}
                      className="btn btn-ghost"
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Batal
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleReset}
                    className="btn btn-ghost btn-outline"
                    disabled={isLoading}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="btn btn-outline"
                    disabled={isLoading || !isDirty}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Simpan Draft
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    {isLoading ? "Menyimpan..." : "Tambah Catatan"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Toast Alerts (Hanya untuk draftToast) */}
      {draftToast.show && (
        <ToastAlert
          type={draftToast.type}
          message={draftToast.message}
          onClose={closeDraftToast}
          duration={3000}
        />
      )}
    </>
  );
};

export default FormCatatanAdd;
