import { useState, useEffect } from "react";

import CatatanList from "./CatatanList";
import { usePagination } from "../../hooks/usePagination";
import supabase from "../../lib/supabase";

interface Catatan {
  id: string;
  title: string;
  content: string;
  kategori_id: string | null;
  folder_id: string | null;
  created_at: string;
  updated_at: string;
}

interface CatatanListPaginatedProps {
  selectedCategory: string | null;
  selectedFolder: string | null;
}

export default function CatatanListPaginated({
  selectedCategory,
  selectedFolder,
}: CatatanListPaginatedProps) {
  const [allCatatan, setAllCatatan] = useState<Catatan[]>([]);
  const [filteredCatatan, setFilteredCatatan] = useState<Catatan[]>([]);
  const [loading, setLoading] = useState(true);

  const { currentItems, hasMore, loadMore, reset, currentPage, totalItems } =
    usePagination({
      data: filteredCatatan,
      itemsPerPage: 10,
    });

  // Fetch all catatan from Supabase
  useEffect(() => {
    const fetchCatatan = async () => {
      try {
        setLoading(true);

        // Actual Supabase call
        const { data, error } = await supabase
          .from("catatan")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching catatan:", error.message);
          // Fallback to mock data if error
          const mockData: Catatan[] = Array.from({ length: 25 }, (_, i) => ({
            id: `catatan-${i + 1}`,
            title: `Catatan ${i + 1}`,
            content: `Ini adalah konten catatan ke-${i + 1}`,
            kategori_id:
              i % 3 === 0 ? "cat-1" : i % 3 === 1 ? "cat-2" : "cat-3",
            folder_id: i % 2 === 0 ? "folder-1" : "folder-2",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }));
          setAllCatatan(mockData);
        } else {
          // Transform data to match interface if needed
          const transformedData: Catatan[] = data.map((item) => ({
            id: item.id,
            title: item.judul_catatan || item.title,
            content: item.isi_catatan || item.content,
            kategori_id: item.kategori_id,
            folder_id: item.folder_id,
            created_at: item.created_at,
            updated_at: item.updated_at || item.created_at,
          }));
          setAllCatatan(transformedData);
        }
      } catch (error) {
        console.error("Error fetching catatan:", error);
        // Fallback to empty array
        setAllCatatan([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCatatan();
  }, []);

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
        {(selectedCategory || selectedFolder) && (
          <span className="ml-2">(filtered)</span>
        )}
      </div>

      {/* Catatan List */}
      <CatatanList catatan={currentItems} loading={loading} />

      {/* Load More Button */}
      {hasMore && !loading && (
        <div className="flex justify-center pt-4">
          <button onClick={loadMore} className="btn btn-outline btn-primary">
            Muat Lebih Banyak
          </button>
        </div>
      )}

      {/* No more items message */}
      {!hasMore && totalItems > 10 && !loading && (
        <div className="text-center text-sm text-base-content/50 pt-4">
          Semua catatan telah ditampilkan
        </div>
      )}

      {/* Empty state */}
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

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      )}
    </div>
  );
}
