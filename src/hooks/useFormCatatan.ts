import { useCallback, useState } from "react";
import type { CreateCatatanData } from "../types/catatan.types";

interface FormErrors {
  judul_catatan?: string;
  isi_catatan?: string;
  kategori_id?: string;
  folder_id?: string;
}

export const useFormCatatan = (initialData?: Partial<CreateCatatanData>) => {
  const [formData, setFormData] = useState<CreateCatatanData>({
    judul_catatan: initialData?.judul_catatan || "",
    isi_catatan: initialData?.isi_catatan || "",
    kategori_id: initialData?.kategori_id || "",
    folder_id: initialData?.folder_id || "",
    is_archived: initialData?.is_archived || false,
    pinned: initialData?.pinned || false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isDirty, setIsDirty] = useState(false);

  const updateField = useCallback(
    (field: keyof CreateCatatanData, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setIsDirty(true);

      // Clear error when user starts typing
      if (errors[field as keyof FormErrors]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors],
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.judul_catatan.trim()) {
      newErrors.judul_catatan = "Judul catatan wajib diisi";
      newErrors.isi_catatan = "Isi catatan wajib diisi";
      newErrors.kategori_id = "Kategori wajib diisi";
      newErrors.folder_id = "Folder wajib diisi";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData({
      judul_catatan: "",
      isi_catatan: "",
      kategori_id: "",
      folder_id: "",
      is_archived: false,
      pinned: false,
    });
    setErrors({});
    setIsDirty(false);
  }, []);

  const saveDraft = useCallback(() => {
    try {
      localStorage.setItem("catatan_draft", JSON.stringify(formData));
      return true;
    } catch (error) {
      console.error("Failed to save draft:", error);
      return false;
    }
  }, [formData]);

  const loadDraft = useCallback(() => {
    try {
      const draft = localStorage.getItem("catatan_draft");
      if (draft) {
        const parsedDraft = JSON.parse(draft);
        setFormData(parsedDraft);
        setIsDirty(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to load draft:", error);
      return false;
    }
  }, []);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem("catatan_draft");
    } catch (error) {
      console.error("Failed to clear draft:", error);
    }
  }, []);

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
  };
};
