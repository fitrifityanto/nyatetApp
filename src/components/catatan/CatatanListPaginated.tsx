import { useState, useEffect } from "react";

import CatatanList from "./CatatanList";
import { usePagination } from "../../hooks/usePagination";
import supabase from "../../lib/supabase";
import type { CatatanWithDetails } from "../../types/catatan.types";

interface CatatanListPaginatedProps {
  selectedCategory: string | null;
  selectedFolder: string | null;
  refreshTrigger?: number; // Prop untuk trigger refresh
}

const CatatanListPaginated = ({
  selectedCategory,
  selectedFolder,
  refreshTrigger = 0,
}: CatatanListPaginatedProps) => {
  const [allCatatan, setAllCatatan] = useState<CatatanWithDetails[]>([]);
  const [filteredCatatan, setFilteredCatatan] = useState<CatatanWithDetails[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  const { currentItems, hasMore, loadMore, reset, totalItems } = usePagination({
    data: filteredCatatan,
    itemsPerPage: 10,
  });

  const fetchCatatan = async () => {
    try {
      setLoading(true);

      // Fetch catatan with kategori and folder details
      const { data, error } = await supabase
        .from("catatan")
        .select(
          `
          *,
          kategori_catatan:kategori_id(id, nama),
          folder_catatan:folder_id(id, nama)
        `,
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching catatan:", error.message);
        // Fallback to mock data if error
        const mockData: CatatanWithDetails[] = Array.from(
          { length: 25 },
          (_, i) => ({
            id: `catatan-${String(i + 1)}`,
            user_id: "mock-user",
            judul_catatan: `Catatan ${String(i + 1)}`,
            isi_catatan: `Ini adalah konten catatan ke-${String(i + 1)}`,
            kategori_id:
              i % 3 === 0 ? "cat-1" : i % 3 === 1 ? "cat-2" : "cat-3",
            folder_id: i % 2 === 0 ? "folder-1" : "folder-2",
            is_archived: false,
            pinned: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }),
        );
        setAllCatatan(mockData);
      } else {
        setAllCatatan(data);
      }
    } catch (error) {
      console.error("Error fetching catatan:", error);
      // Fallback to empty array
      setAllCatatan([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount and when refreshTrigger changes
  useEffect(() => {
    void fetchCatatan();
  }, [refreshTrigger]);

  // Filter catatan based on selected category and folder
  useEffect(() => {
    let filtered = allCatatan;

    if (selectedCategory) {
      filtered = filtered.filter(
        (catatan) => catatan.kategori_id === selectedCategory,
      );
    }

    if (selectedFolder) {
      filtered = filtered.filter(
        (catatan) => catatan.folder_id === selectedFolder,
      );
    }

    setFilteredCatatan(filtered);
    reset(); // Reset pagination when filter changes
  }, [allCatatan, selectedCategory, selectedFolder, reset]);

  return (
    <div className="space-y-4">
      {/* Results Info */}
      <div className="text-sm text-base-content/70">
        Menampilkan {currentItems.length} dari {totalItems} catatan
        {(selectedCategory ?? selectedFolder) && (
          <span className="ml-2">(filtered)</span>
        )}
      </div>

      <CatatanList catatan={currentItems} loading={loading} />

      {hasMore && !loading && (
        <div className="flex justify-center pt-4">
          <button
            type="button"
            onClick={loadMore}
            className="btn btn-outline btn-primary"
          >
            Muat Lebih Banyak
          </button>
        </div>
      )}

      {!hasMore && totalItems > 10 && !loading && (
        <div className="text-center text-sm text-base-content/50 pt-4">
          Semua catatan telah ditampilkan
        </div>
      )}

      {totalItems === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-lg font-medium mb-2">Belum ada catatan</h3>
          <p className="text-base-content/60">
            {selectedCategory || selectedFolder
              ? "Tidak ada catatan untuk filter yang dipilih"
              : "Mulai dengan membuat catatan baru"}
          </p>
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      )}
    </div>
  );
};

export default CatatanListPaginated;
