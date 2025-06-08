import supabase from "../lib/supabase";
import { useCallback, useState } from "react";
import type { CreateCatatanData, Catatan } from "../types/catatan.types";

// Default values, dipindahkan ke sini karena logikanya akan terpusat di sini untuk DB interaction
export const DEFAULT_KATEGORI_NAMA = "Tanpa Kategori";
export const DEFAULT_FOLDER_NAMA = "Dokumen";

export const useCatatan = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  // Helper function to ensure kategori exists in database
  const ensureKategoriExists = useCallback(
    async (kategoriName: string, userId: string): Promise<string> => {
      try {
        // Check if kategori already exists for this user
        const { data: existingKategori, error: fetchError } = await supabase
          .from("kategori_catatan")
          .select("id")
          .eq("nama", kategoriName)
          .eq("user_id", userId)
          .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          // PGRST116 = no rows returned (record not found)
          throw fetchError;
        }

        if (existingKategori) {
          return existingKategori.id;
        }

        // Kategori doesn't exist, create it
        const { data: newKategori, error: createError } = await supabase
          .from("kategori_catatan")
          .insert({ nama: kategoriName, user_id: userId })
          .select("id")
          .single();

        if (createError) {
          throw createError;
        }
        if (!newKategori) {
          throw new Error("Failed to create new kategori.");
        }
        return newKategori.id;
      } catch (err) {
        console.error(`Error ensuring kategori '${kategoriName}' exists:`, err);
        throw new Error(`Gagal memproses kategori: ${kategoriName}`);
      }
    },
    [],
  );

  // Helper function to ensure folder exists in database
  const ensureFolderExists = useCallback(
    async (folderName: string, userId: string): Promise<string> => {
      try {
        // Check if folder already exists for this user
        const { data: existingFolder, error: fetchError } = await supabase
          .from("folder_catatan")
          .select("id")
          .eq("nama", folderName)
          .eq("user_id", userId)
          .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          // PGRST116 = no rows returned
          throw fetchError;
        }

        if (existingFolder) {
          return existingFolder.id;
        }

        // Folder doesn't exist, create it
        const { data: newFolder, error: createError } = await supabase
          .from("folder_catatan")
          .insert({ nama: folderName, user_id: userId })
          .select("id")
          .single();

        if (createError) {
          throw createError;
        }
        if (!newFolder) {
          throw new Error("Failed to create new folder.");
        }
        return newFolder.id;
      } catch (err) {
        console.error(`Error ensuring folder '${folderName}' exists:`, err);
        throw new Error(`Gagal memproses folder: ${folderName}`);
      }
    },
    [],
  );

  // Method untuk mengambil catatan berdasarkan ID
  const getCatatanById = useCallback(async (catatanId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: userAuthData } = await supabase.auth.getUser();
      const userId = userAuthData.user?.id;

      if (!userId) {
        throw new Error("User not authenticated.");
      }

      const { data, error: fetchError } = await supabase
        .from("catatan")
        .select(
          `
          *,
          kategori_catatan:kategori_id (
            id,
            nama
          ),
          folder_catatan:folder_id (
            id,
            nama
          )
        `,
        )
        .eq("id", catatanId)
        .eq("user_id", userId)
        .single();

      if (fetchError) {
        if (fetchError.code === "PGRST116") {
          throw new Error(
            "Catatan tidak ditemukan atau Anda tidak memiliki akses.",
          );
        }
        throw fetchError;
      }

      if (!data) {
        throw new Error("Catatan tidak ditemukan.");
      }

      // Transform data to match Catatan interface
      const catatan: Catatan = {
        ...data,
        kategori_catatan: data.kategori_catatan
          ? {
              id: data.kategori_catatan.id,
              nama: data.kategori_catatan.nama,
            }
          : undefined,
        folder_catatan: data.folder_catatan
          ? {
              id: data.folder_catatan.id,
              nama: data.folder_catatan.nama,
            }
          : undefined,
      };

      return { success: true, data: catatan, message: null };
    } catch (err) {
      console.error("Error fetching catatan by ID:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Gagal mengambil data catatan";
      setError(errorMessage);
      return { success: false, data: null, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCatatan = useCallback(
    async (data: CreateCatatanData) => {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      try {
        const { data: userAuthData } = await supabase.auth.getUser();
        const userId = userAuthData.user?.id;

        if (!userId) {
          throw new Error("User not authenticated.");
        }

        let kategoriId: string | null = null;
        let folderId: string | null = null;

        // Pastikan kategori ada di DB, jika tidak ada, buat.
        // Ini termasuk kategori default jika dipilih oleh user.
        if (data.kategori_nama) {
          kategoriId = await ensureKategoriExists(data.kategori_nama, userId);
        }

        // Pastikan folder ada di DB, jika tidak ada, buat.
        // Ini termasuk folder default jika dipilih oleh user.
        if (data.folder_nama) {
          folderId = await ensureFolderExists(data.folder_nama, userId);
        }

        const { error: insertError } = await supabase.from("catatan").insert({
          judul_catatan: data.judul_catatan,
          isi_catatan: data.isi_catatan,
          kategori_id: kategoriId,
          folder_id: folderId,
          is_archived: data.is_archived,
          pinned: data.pinned,
          user_id: userId,
        });

        if (insertError) {
          throw insertError;
        }

        setSuccess("Catatan berhasil ditambahkan!");
        return { success: true, error: null };
      } catch (err) {
        console.error("Error creating catatan:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan yang tidak diketahui saat menambahkan catatan";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [ensureKategoriExists, ensureFolderExists],
  );

  const updateCatatan = useCallback(
    async (catatanId: string, data: CreateCatatanData) => {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      try {
        const { data: userAuthData } = await supabase.auth.getUser();
        const userId = userAuthData.user?.id;

        if (!userId) {
          throw new Error("User not authenticated.");
        }

        // Verify that the catatan belongs to the current user
        const { data: existingCatatan, error: verifyError } = await supabase
          .from("catatan")
          .select("user_id")
          .eq("id", catatanId)
          .single();

        if (verifyError) {
          throw new Error("Catatan tidak ditemukan.");
        }

        if (existingCatatan.user_id !== userId) {
          throw new Error(
            "Anda tidak memiliki akses untuk mengubah catatan ini.",
          );
        }

        let kategoriId: string | null = null;
        let folderId: string | null = null;

        // Pastikan kategori ada di DB, jika tidak ada, buat.
        if (data.kategori_nama) {
          kategoriId = await ensureKategoriExists(data.kategori_nama, userId);
        }

        // Pastikan folder ada di DB, jika tidak ada, buat.
        if (data.folder_nama) {
          folderId = await ensureFolderExists(data.folder_nama, userId);
        }

        const { error: updateError } = await supabase
          .from("catatan")
          .update({
            judul_catatan: data.judul_catatan,
            isi_catatan: data.isi_catatan,
            kategori_id: kategoriId,
            folder_id: folderId,
            is_archived: data.is_archived,
            pinned: data.pinned,
            updated_at: new Date().toISOString(),
          })
          .eq("id", catatanId)
          .eq("user_id", userId);

        if (updateError) {
          throw updateError;
        }

        setSuccess("Catatan berhasil diperbarui!");
        return { success: true, error: null };
      } catch (err) {
        console.error("Error updating catatan:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan yang tidak diketahui saat memperbarui catatan";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [ensureKategoriExists, ensureFolderExists],
  );

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
    getCatatanById, // Tambahkan method baru ini
    createCatatan,
    updateCatatan,
    isLoading,
    error,
    success,
    clearMessages,
    fetchKategoris,
    fetchFolders,
  };
};
