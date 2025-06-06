import { useCallback, useEffect, useState } from "react";
import type { FolderOption, KategoriOption } from "../types/catatan.types";

interface UseDynamicOptionsProps {
  initialKategoris: KategoriOption[];
  initialFolders: FolderOption[];
  fetchKategoris: () => Promise<KategoriOption[]>;
  fetchFolders: () => Promise<FolderOption[]>;
}

export const useDynamicOptions = ({
  initialKategoris,
  initialFolders,
  fetchKategoris,
  fetchFolders,
}: UseDynamicOptionsProps) => {
  const [kategoris, setKategoris] =
    useState<KategoriOption[]>(initialKategoris);
  const [folders, setFolders] = useState<FolderOption[]>(initialFolders);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // States untuk penambahan kategori/folder baru
  const [showAddKategori, setShowAddKategori] = useState(false);
  const [newKategoriName, setNewKategoriName] = useState("");
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // Refresh options from database
  const refreshOptions = useCallback(async () => {
    try {
      const [updatedKategoris, updatedFolders] = await Promise.all([
        fetchKategoris(),
        fetchFolders(),
      ]);

      // Update state with fresh data from DB
      const uniqueKategoris = Array.from(
        new Map(updatedKategoris.map((item) => [item.id, item])).values(),
      );
      const uniqueFolders = Array.from(
        new Map(updatedFolders.map((item) => [item.id, item])).values(),
      );

      setKategoris(uniqueKategoris);
      setFolders(uniqueFolders);
    } catch (err) {
      console.error("Error refreshing categories/folders from DB:", err);
    }
  }, [fetchKategoris, fetchFolders]);

  // Load initial data from database and merge with initial props
  useEffect(() => {
    const loadAndMergeInitialData = async () => {
      if (isDataLoaded) return;

      try {
        const [dbKategoris, dbFolders] = await Promise.all([
          fetchKategoris(),
          fetchFolders(),
        ]);

        // Merge initial props with database data, avoiding duplicates
        const mergedKategoris = [
          ...initialKategoris,
          ...dbKategoris.filter(
            (dbItem) =>
              !initialKategoris.some(
                (initItem) => initItem.name === dbItem.name,
              ),
          ),
        ];

        const mergedFolders = [
          ...initialFolders,
          ...dbFolders.filter(
            (dbItem) =>
              !initialFolders.some((initItem) => initItem.name === dbItem.name),
          ),
        ];

        setKategoris(mergedKategoris);
        setFolders(mergedFolders);
        setIsDataLoaded(true);
      } catch (err) {
        console.error("Error loading initial categories/folders:", err);
      }
    };

    loadAndMergeInitialData();
  }, [
    fetchKategoris,
    fetchFolders,
    initialKategoris,
    initialFolders,
    isDataLoaded,
  ]);

  // Add category to local state
  const addKategoriLocally = useCallback((name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return null;

    const newId = `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`; // Temporary ID
    const newKategori = { id: newId, name: trimmedName };

    setKategoris((prev) => {
      // Avoid adding duplicate names
      if (prev.some((k) => k.name === trimmedName)) {
        return prev;
      }
      return [...prev, newKategori];
    });
    return newKategori;
  }, []);

  // Add folder to local state
  const addFolderLocally = useCallback((name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return null;

    const newId = `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`; // Temporary ID
    const newFolder = { id: newId, name: trimmedName };

    setFolders((prev) => {
      // Avoid adding duplicate names
      if (prev.some((f) => f.name === trimmedName)) {
        return prev;
      }
      return [...prev, newFolder];
    });
    return newFolder;
  }, []);

  return {
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
  };
};
