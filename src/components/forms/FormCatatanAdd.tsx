// Refactored FormCatatanAdd.tsx with Toast and Field-level validation

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
  CheckCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import { useState, useEffect } from "react";
import type { FolderOption, KategoriOption } from "../../types/catatan.types";
import { useCatatan } from "../../hooks/useCatatan";
import { useFormCatatan } from "../../hooks/useFormCatatan";

// Toast Alert Component
interface ToastAlertProps {
  type: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
  duration?: number;
}

const ToastAlert: React.FC<ToastAlertProps> = ({ 
  type, 
  message, 
  onClose, 
  duration = 4000 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    
    const timer = setTimeout(() => {
      setIsAnimating(false);
      setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, 300); // Animation duration
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const icons = {
    success: <CheckCircle className="h-5 w-5" />,
    error: <AlertTriangle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />
  };

  const colors = {
    success: 'bg-success text-success-content',
    error: 'bg-error text-error-content',
    info: 'bg-info text-info-content'
  };

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`alert shadow-lg ${colors[type]} min-w-80 max-w-96`}>
        {icons[type]}
        <span className="flex-1">{message}</span>
        <button 
          onClick={() => {
            setIsAnimating(false);
            setTimeout(() => {
              setIsVisible(false);
              onClose();
            }, 300);
          }}
          className="btn btn-ghost btn-sm btn-circle"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Field Error Component
interface FieldErrorProps {
  error?: string;
}

const FieldError: React.FC<FieldErrorProps> = ({ error }) => {
  if (!error) return null;
  
  return (
    <label className="label">
      <span className="label-text-alt text-error flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        {error}
      </span>
    </label>
  );
};

interface FormCatatanAddProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  kategoris?: KategoriOption[];
  folders?: FolderOption[];
  className?: string;
}

const FormCatatanAdd: React.FC<FormCatatanAddProps> = ({
  onSuccess,
  onCancel,
  kategoris: initialKategoris = [],
  folders: initialFolders = [],
  className = "",
}) => {
  const { 
    createCatatan, 
    isLoading, 
    error, 
    success, 
    clearMessages,
    fetchKategoris,
    fetchFolders 
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
  } = useFormCatatan();

  // State untuk kategori dan folder dinamis
  const [kategoris, setKategoris] = useState<KategoriOption[]>(initialKategoris);
  const [folders, setFolders] = useState<FolderOption[]>(initialFolders);

  // State untuk melacak apakah data sudah dimuat
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [showAddKategori, setShowAddKategori] = useState(false);
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [newKategoriName, setNewKategoriName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");

  // Toast state
  const [toastAlert, setToastAlert] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info';
    message: string;
  }>({
    show: false,
    type: 'success',
    message: ''
  });

  // Draft message state (untuk pesan draft tetap menggunakan toast)
  const [draftToast, setDraftToast] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({
    show: false,
    type: 'success',
    message: ''
  });

  // Load initial data from Supabase hanya sekali saat komponen pertama kali dimuat
  useEffect(() => {
    const loadInitialData = async () => {
      if (isDataLoaded) return; // Skip jika data sudah dimuat

      try {
        const [dbKategoris, dbFolders] = await Promise.all([
          fetchKategoris(),
          fetchFolders()
        ]);

        // Combine initial data with database data
        const allKategoris = [
          ...initialKategoris,
          ...dbKategoris.filter(dbItem => 
            !initialKategoris.some(initItem => initItem.name === dbItem.name)
          )
        ];

        const allFolders = [
          ...initialFolders,
          ...dbFolders.filter(dbItem => 
            !initialFolders.some(initItem => initItem.name === dbItem.name)
          )
        ];

        setKategoris(allKategoris);
        setFolders(allFolders);
        setIsDataLoaded(true);
      } catch (err) {
        console.error('Error loading initial data:', err);
        // Fallback to initial data if database fetch fails
        setKategoris(initialKategoris);
        setFolders(initialFolders);
        setIsDataLoaded(true);
      }
    };

    loadInitialData();
  }, []); // Hapus dependencies yang menyebabkan re-render

  // Load draft terpisah
  useEffect(() => {
    loadDraft();
  }, [loadDraft]);

  // Handle success message dengan toast
  useEffect(() => {
    if (success) {
      setToastAlert({
        show: true,
        type: 'success',
        message: success
      });
      
      // Clear success setelah toast ditampilkan
      const timer = setTimeout(() => {
        clearMessages();
        if (onSuccess) {
          onSuccess();
        }
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [success, clearMessages, onSuccess]);

  // Handle error message dengan toast
  useEffect(() => {
    if (error) {
      setToastAlert({
        show: true,
        type: 'error',
        message: error
      });
      
      // Clear error setelah toast ditampilkan
      const timer = setTimeout(() => {
        clearMessages();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error, clearMessages]);

  // Handler untuk menambah kategori baru
  const handleAddKategori = () => {
    if (newKategoriName.trim()) {
      const newId = `new_${Date.now()}`; // Temporary ID for new categories
      const newKategori = { id: newId, name: newKategoriName.trim() };
      setKategoris([...kategoris, newKategori]);
      setNewKategoriName("");
      setShowAddKategori(false);
      // Automatically select the new category
      updateField("kategori_id", newId);
    }
  };

  // Handler untuk menambah folder baru
  const handleAddFolder = () => {
    if (newFolderName.trim()) {
      const newId = `new_${Date.now()}`; // Temporary ID for new folders
      const newFolder = { id: newId, name: newFolderName.trim() };
      setFolders([...folders, newFolder]);
      setNewFolderName("");
      setShowAddFolder(false);
      // Automatically select the new folder
      updateField("folder_id", newId);
    }
  };

  // Handler untuk cancel add kategori/folder
  const handleCancelAddKategori = () => {
    setShowAddKategori(false);
    setNewKategoriName("");
  };

  const handleCancelAddFolder = () => {
    setShowAddFolder(false);
    setNewFolderName("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear any previous messages
    clearMessages();
    setToastAlert({ show: false, type: 'success', message: '' });

    if (!validateForm()) {
      // Validasi akan menampilkan error di masing-masing field
      // Tidak perlu menampilkan pesan umum
      return;
    }

    try {
      // Find selected kategori and folder objects
      const selectedKategori = kategoris.find(k => k.id === formData.kategori_id) || null;
      const selectedFolder = folders.find(f => f.id === formData.folder_id) || null;

      const result = await createCatatan(
        formData,
        selectedKategori,
        selectedFolder,
        kategoris,
        folders
      );

      if (result.success) {
        clearDraft();
        resetForm();
        
        // Refresh kategoris and folders list if new ones were created
        if (result.newKategoriId || result.newFolderId) {
          try {
            const [updatedKategoris, updatedFolders] = await Promise.all([
              fetchKategoris(),
              fetchFolders()
            ]);
            
            setKategoris([...initialKategoris, ...updatedKategoris]);
            setFolders([...initialFolders, ...updatedFolders]);
          } catch (err) {
            console.error('Error refreshing categories/folders:', err);
          }
        }
      }
    } catch (err) {
      console.error('Unexpected error in form submission:', err);
      setToastAlert({
        show: true,
        type: 'error',
        message: 'Terjadi kesalahan yang tidak terduga'
      });
    }
  };

  const handleSaveDraft = () => {
    try {
      const saved = saveDraft();
      if (saved) {
        setDraftToast({
          show: true,
          type: 'success',
          message: "Draft berhasil disimpan!"
        });
      } else {
        setDraftToast({
          show: true,
          type: 'error',
          message: "Tidak ada perubahan untuk disimpan"
        });
      }
    } catch (err) {
      console.error('Error saving draft:', err);
      setDraftToast({
        show: true,
        type: 'error',
        message: 'Gagal menyimpan draft'
      });
    }
  };

  const handleReset = () => {
    resetForm();
    clearDraft();
    clearMessages();
  };

  const closeToast = () => {
    setToastAlert({ show: false, type: 'success', message: '' });
  };

  const closeDraftToast = () => {
    setDraftToast({ show: false, type: 'success', message: '' });
  };

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
            <form onSubmit={handleSubmit} className="space-y-6">
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
                  onChange={(e) => updateField("judul_catatan", e.target.value)}
                  placeholder="Masukkan judul catatan..."
                  className={`input input-bordered w-full focus:input-primary ${
                    errors.judul_catatan ? "input-error" : ""
                  }`}
                  disabled={isLoading}
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
                  onChange={(e) => updateField("isi_catatan", e.target.value)}
                  className={`textarea textarea-bordered h-96 w-full focus:textarea-primary resize-y scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-transparent hover:scrollbar-thumb-base-content/20 scrollbar-thumb-rounded-full ${
                    errors.isi_catatan ? "textarea-error" : ""
                  }`}
                  placeholder="Tulis isi catatan Anda di sini..."
                  disabled={isLoading}
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "hsl(var(--bc) / 0.2) transparent",
                  }}
                />
                <FieldError error={errors.isi_catatan} />
              </div>

              {/* Row untuk Kategori dan Folder */}
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
                        value={formData.kategori_id}
                        onChange={(e) =>
                          updateField("kategori_id", e.target.value)
                        }
                        className={`select select-bordered w-full focus:select-primary ${
                          errors.kategori_id ? "select-error" : ""
                        }`}
                        disabled={isLoading}
                      >
                        <option value="">Pilih Kategori</option>
                        {kategoris.map((kategori) => (
                          <option key={kategori.id} value={kategori.id}>
                            {kategori.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowAddKategori(true)}
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
                        onChange={(e) => setNewKategoriName(e.target.value)}
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
                  <FieldError error={errors.kategori_id} />
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
                        value={formData.folder_id}
                        onChange={(e) =>
                          updateField("folder_id", e.target.value)
                        }
                        className={`select select-bordered w-full focus:select-primary ${
                          errors.folder_id ? "select-error" : ""
                        }`}
                        disabled={isLoading}
                      >
                        <option value="">Pilih Folder</option>
                        {folders.map((folder) => (
                          <option key={folder.id} value={folder.id}>
                            {folder.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowAddFolder(true)}
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
                        onChange={(e) => setNewFolderName(e.target.value)}
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
                  <FieldError error={errors.folder_id} />
                </div>
              </div>

              {/* Checkbox Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pin Catatan */}
                <div className="form-control">
                  <label className="label cursor-pointer justify-start">
                    <input
                      type="checkbox"
                      checked={formData.pinned}
                      onChange={(e) => updateField("pinned", e.target.checked)}
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

                {/* Arsipkan */}
                <div className="form-control">
                  <label className="label cursor-pointer justify-start">
                    <input
                      type="checkbox"
                      checked={formData.is_archived}
                      onChange={(e) =>
                        updateField("is_archived", e.target.checked)
                      }
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

      {/* Toast Alerts */}
      {toastAlert.show && (
        <ToastAlert
          type={toastAlert.type}
          message={toastAlert.message}
          onClose={closeToast}
        />
      )}

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
