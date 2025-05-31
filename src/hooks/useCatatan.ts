import supabase from "../lib/supabase";
import { useCallback, useState } from "react";
import type { CreateCatatanData } from "../types/catatan.types";

interface CategoryOrFolder {
  id: string;
  name: string;
}

export const useCatatan = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  // Helper function to get or create category
  const getOrCreateKategori = async (
    kategoriData: CategoryOrFolder | null,
    allKategoris: CategoryOrFolder[],
  ) => {
    if (!kategoriData?.id) return null;

    // Check if it's a new category (has 'new_' prefix)
    const isNewCategory = kategoriData.id.startsWith("new_");

    if (isNewCategory) {
      // Create new category
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      const { data: newKategori, error } = await supabase
        .from("kategori_catatan")
        .insert([
          {
            user_id: user.user.id,
            nama: kategoriData.name,
          },
        ])
        .select("id")
        .single();

      if (error) throw error;
      return newKategori.id;
    }

    // For existing categories, check if it's from initial data or database
    if (!isNaN(Number(kategoriData.id))) {
      // This is from initial data, try to find matching database record
      const { data: existingKategori, error } = await supabase
        .from("kategori_catatan")
        .select("id")
        .eq("nama", kategoriData.name)
        .single();

      if (existingKategori) {
        return existingKategori.id;
      }

      // If not found, create it
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      const { data: newKategori, error: createError } = await supabase
        .from("kategori_catatan")
        .insert([
          {
            user_id: user.user.id,
            nama: kategoriData.name,
          },
        ])
        .select("id")
        .single();

      if (createError) throw createError;
      return newKategori.id;
    }

    // Already a UUID from database
    return kategoriData.id;
  };

  // Helper function to get or create folder
  const getOrCreateFolder = async (
    folderData: CategoryOrFolder | null,
    allFolders: CategoryOrFolder[],
  ) => {
    if (!folderData?.id) return null;

    // Check if it's a new folder (has 'new_' prefix)
    const isNewFolder = folderData.id.startsWith("new_");

    if (isNewFolder) {
      // Create new folder
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      const { data: newFolder, error } = await supabase
        .from("folder_catatan")
        .insert([
          {
            user_id: user.user.id,
            nama: folderData.name,
          },
        ])
        .select("id")
        .single();

      if (error) throw error;
      return newFolder.id;
    }

    // For existing folders, check if it's from initial data or database
    if (!isNaN(Number(folderData.id))) {
      // This is from initial data, try to find matching database record
      const { data: existingFolder, error } = await supabase
        .from("folder_catatan")
        .select("id")
        .eq("nama", folderData.name)
        .single();

      if (existingFolder) {
        return existingFolder.id;
      }

      // If not found, create it
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      const { data: newFolder, error: createError } = await supabase
        .from("folder_catatan")
        .insert([
          {
            user_id: user.user.id,
            nama: folderData.name,
          },
        ])
        .select("id")
        .single();

      if (createError) throw createError;
      return newFolder.id;
    }

    // Already a UUID from database
    return folderData.id;
  };

  const createCatatan = useCallback(
    async (
      data: CreateCatatanData,
      selectedKategori?: CategoryOrFolder | null,
      selectedFolder?: CategoryOrFolder | null,
      allKategoris?: CategoryOrFolder[],
      allFolders?: CategoryOrFolder[],
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        // Get current user
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) {
          throw new Error("User not authenticated");
        }

        // Handle kategori (create new if needed)
        let kategoriId = null;
        if (selectedKategori && data.kategori_id) {
          kategoriId = await getOrCreateKategori(
            selectedKategori,
            allKategoris || [],
          );
        }

        // Handle folder (create new if needed)
        let folderId = null;
        if (selectedFolder && data.folder_id) {
          folderId = await getOrCreateFolder(selectedFolder, allFolders || []);
        }

        // Create the catatan record
        const catatanData = {
          user_id: user.user.id,
          judul_catatan: data.judul_catatan,
          isi_catatan: data.isi_catatan || "",
          kategori_id: kategoriId,
          folder_id: folderId,
          pinned: data.pinned || false,
          is_archived: data.is_archived || false,
        };

        const { data: result, error: catatanError } = await supabase
          .from("catatan")
          .insert([catatanData])
          .select(
            `
          *,
          kategori_catatan(id, nama),
          folder_catatan(id, nama)
        `,
          )
          .single();

        if (catatanError) throw catatanError;

        setSuccess("Catatan berhasil ditambahkan!");
        return {
          success: true,
          data: result,
          newKategoriId: kategoriId,
          newFolderId: folderId,
        };
      } catch (err) {
        console.error("Error creating catatan:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat menyimpan catatan";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const updateCatatan = useCallback(
    async (id: string, data: Partial<CreateCatatanData>) => {
      setIsLoading(true);
      setError(null);

      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) {
          throw new Error("User not authenticated");
        }

        const { data: result, error } = await supabase
          .from("catatan")
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .eq("user_id", user.user.id) // Ensure user can only update their own notes
          .select(
            `
            *,
            kategori_catatan(id, nama),
            folder_catatan(id, nama)
          `,
          )
          .single();

        if (error) throw error;

        setSuccess("Catatan berhasil diperbarui!");
        return { success: true, data: result };
      } catch (err) {
        console.error("Error updating catatan:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat memperbarui catatan";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const deleteCatatan = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase
        .from("catatan")
        .delete()
        .eq("id", id)
        .eq("user_id", user.user.id); // Ensure user can only delete their own notes

      if (error) throw error;

      setSuccess("Catatan berhasil dihapus!");
      return { success: true };
    } catch (err) {
      console.error("Error deleting catatan:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menghapus catatan";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Helper function to fetch existing categories for a user
  const fetchKategoris = useCallback(async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from("kategori_catatan")
        .select("id, nama")
        .eq("user_id", user.user.id)
        .order("nama");

      if (error) throw error;

      return data.map((item) => ({ id: item.id, name: item.nama }));
    } catch (err) {
      console.error("Error fetching kategoris:", err);
      return [];
    }
  }, []);

  // Helper function to fetch existing folders for a user
  const fetchFolders = useCallback(async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from("folder_catatan")
        .select("id, nama")
        .eq("user_id", user.user.id)
        .order("nama");

      if (error) throw error;

      return data.map((item) => ({ id: item.id, name: item.nama }));
    } catch (err) {
      console.error("Error fetching folders:", err);
      return [];
    }
  }, []);

  return {
    isLoading,
    error,
    success,
    clearMessages,
    createCatatan,
    updateCatatan,
    deleteCatatan,
    fetchKategoris,
    fetchFolders,
  };
};
