import { useCallback, useState } from "react";
import type { CreateCatatanData } from "@/types/catatan.types";
import { DEFAULT_KATEGORI_NAMA, DEFAULT_FOLDER_NAMA } from "./useCatatan";

interface FormErrors {
  judul_catatan?: string;
  isi_catatan?: string;
  kategori_nama?: string;
  folder_nama?: string;
}

interface FormDataWithNames {
  judul_catatan: string;
  isi_catatan: string;
  kategori_nama: string;
  folder_nama: string;
  is_archived: boolean;
  pinned: boolean;
}

const DRAFT_STORAGE_KEY = "catatan_draft";

export const useFormCatatan = (initialData?: Partial<CreateCatatanData>) => {
  const [formData, setFormData] = useState<FormDataWithNames>(() => {
    // Load draft if available, otherwise use initialData or defaults
    const storedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (storedDraft) {
      try {
        const draft = JSON.parse(storedDraft) as Partial<FormDataWithNames>;
        return {
          judul_catatan: draft.judul_catatan ?? "",
          isi_catatan: draft.isi_catatan ?? "",
          kategori_nama: draft.kategori_nama ?? DEFAULT_KATEGORI_NAMA,
          folder_nama: draft.folder_nama ?? DEFAULT_FOLDER_NAMA,
          is_archived: draft.is_archived ?? false,
          pinned: draft.pinned ?? false,
        };
      } catch (e) {
        console.error("Failed to parse draft from localStorage:", e);
        localStorage.removeItem(DRAFT_STORAGE_KEY); // Clear corrupted draft
      }
    }
    return {
      judul_catatan: initialData?.judul_catatan ?? "",
      isi_catatan: initialData?.isi_catatan ?? "",
      kategori_nama: initialData?.kategori_nama ?? DEFAULT_KATEGORI_NAMA,
      folder_nama: initialData?.folder_nama ?? DEFAULT_FOLDER_NAMA,
      is_archived: initialData?.is_archived ?? false,
      pinned: initialData?.pinned ?? false,
    };
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isDirty, setIsDirty] = useState(false);

  const updateField = useCallback(
    <T extends keyof FormDataWithNames>(
      field: T,
      value: FormDataWithNames[T],
    ) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined })); // Clear error when field changes
      setIsDirty(true);
    },
    [],
  );

  const validateForm = useCallback(() => {
    let isValid = true;
    const newErrors: FormErrors = {};

    if (!formData.judul_catatan.trim()) {
      newErrors.judul_catatan = "Judul catatan tidak boleh kosong.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData({
      judul_catatan: "",
      isi_catatan: "",
      kategori_nama: DEFAULT_KATEGORI_NAMA,
      folder_nama: DEFAULT_FOLDER_NAMA,
      is_archived: false,
      pinned: false,
    });
    setErrors({});
    setIsDirty(false);
  }, []);

  // Check if form has any content
  const hasContent = useCallback((): boolean => {
    return !!(
      formData.judul_catatan.trim() ||
      formData.isi_catatan.trim() ||
      // Memeriksa apakah kategori/folder telah diubah dari default
      formData.kategori_nama !== DEFAULT_KATEGORI_NAMA ||
      formData.folder_nama !== DEFAULT_FOLDER_NAMA ||
      formData.is_archived ||
      formData.pinned
    );
  }, [formData]);

  const saveDraft = useCallback(() => {
    if (hasContent()) {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
      setIsDirty(false); // Reset dirty state after saving
      return true;
    }
    return false;
  }, [formData, hasContent]);

  const loadDraft = useCallback(() => {
    const storedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (storedDraft) {
      try {
        const draft = JSON.parse(storedDraft) as Partial<FormDataWithNames>;
        setFormData({
          judul_catatan: draft.judul_catatan ?? "",
          isi_catatan: draft.isi_catatan ?? "",
          kategori_nama: draft.kategori_nama ?? DEFAULT_KATEGORI_NAMA,
          folder_nama: draft.folder_nama ?? DEFAULT_FOLDER_NAMA,
          is_archived: draft.is_archived ?? false,
          pinned: draft.pinned ?? false,
        });
        setIsDirty(false); // Loaded draft is not dirty initially
        return true;
      } catch (e) {
        console.error("Failed to load or parse draft:", e);
        localStorage.removeItem(DRAFT_STORAGE_KEY); // Clear corrupted draft
        return false;
      }
    }
    return false;
  }, []);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  }, []);

  // Convert form data to CreateCatatanData format for submission
  const getSubmissionData = useCallback((): CreateCatatanData => {
    return {
      judul_catatan: formData.judul_catatan.trim(),
      isi_catatan: formData.isi_catatan.trim(),
      kategori_nama: formData.kategori_nama,
      folder_nama: formData.folder_nama,
      is_archived: formData.is_archived,
      pinned: formData.pinned,
    };
  }, [formData]);

  // Get form data for display purposes
  const getFormData = useCallback((): FormDataWithNames => {
    return { ...formData };
  }, [formData]);

  return {
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
    DEFAULT_KATEGORI_NAMA,
    DEFAULT_FOLDER_NAMA,
    getFormData,
    hasContent,
  };
};
