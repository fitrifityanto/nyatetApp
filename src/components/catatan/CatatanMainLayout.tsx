import { useState, useEffect } from "react";

import CatatanSidebar from "./CatatanSidebar";
import CatatanListPaginated from "./CatatanListPaginated";
import FormCatatanAdd from "../forms/FormCatatanAdd";
import supabase from "../../lib/supabase";

interface Category {
  id: string;
  name: string;
  count: number;
}

interface Folder {
  id: string;
  name: string;
  count: number;
}

export default function CatatanMainLayout() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch categories from Supabase
  const fetchCategories = async () => {
    try {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("kategori_catatan")
        .select("id, nama")
        .order("nama");

      if (categoriesError) {
        console.error("Error fetching categories:", categoriesError);
        return;
      }

      // Get count for each category (assuming you have a catatan table with kategori_id)
      const categoriesWithCount = await Promise.all(
        categoriesData.map(async (category) => {
          const { count } = await supabase
            .from("catatan") // Sesuaikan dengan nama tabel catatan Anda
            .select("*", { count: "exact", head: true })
            .eq("kategori_id", category.id);

          return {
            id: category.id,
            name: category.nama,
            count: count || 0,
          };
        }),
      );

      setCategories(categoriesWithCount);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Fetch folders from Supabase
  const fetchFolders = async () => {
    try {
      const { data: foldersData, error: foldersError } = await supabase
        .from("folder_catatan")
        .select("id, nama")
        .order("nama");

      if (foldersError) {
        console.error("Error fetching folders:", foldersError);
        return;
      }

      // Get count for each folder (assuming you have a catatan table with folder_id)
      const foldersWithCount = await Promise.all(
        foldersData.map(async (folder) => {
          const { count } = await supabase
            .from("catatan") // Sesuaikan dengan nama tabel catatan Anda
            .select("*", { count: "exact", head: true })
            .eq("folder_id", folder.id);

          return {
            id: folder.id,
            name: folder.nama,
            count: count || 0,
          };
        }),
      );

      setFolders(foldersWithCount);
    } catch (error) {
      console.error("Error fetching folders:", error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCategories(), fetchFolders()]);
      setLoading(false);
    };

    loadData();
  }, []);

  const handleAddNew = () => {
    setShowAddForm(true);
  };

  const handleFormSuccess = async () => {
    console.log("Catatan berhasil ditambahkan!");
    setShowAddForm(false);
    // Refresh data after adding new catatan
    await Promise.all([fetchCategories(), fetchFolders()]);
  };

  const handleFormCancel = () => {
    console.log("Cancelled");
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-base-100">
        <div className="w-64 bg-base-200 p-4 min-h-screen">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-base-300 rounded"></div>
            <div className="space-y-2">
              <div className="h-4 bg-base-300 rounded w-20"></div>
              <div className="h-8 bg-base-300 rounded"></div>
              <div className="h-8 bg-base-300 rounded"></div>
              <div className="h-8 bg-base-300 rounded"></div>
            </div>
          </div>
        </div>
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-base-300 rounded w-40"></div>
              <div className="h-4 bg-base-300 rounded w-60"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-base-100">
      {/* Sidebar */}
      <CatatanSidebar
        categories={categories}
        folders={folders}
        onAddNew={handleAddNew}
        onCategorySelect={setSelectedCategory}
        onFolderSelect={setSelectedFolder}
        selectedCategory={selectedCategory}
        selectedFolder={selectedFolder}
      />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Catatan</h1>
            <p className="text-base-content/60">
              Kelola semua catatan Anda dengan mudah
            </p>
          </div>

          {/* Filter Badge */}
          {(selectedCategory || selectedFolder) && (
            <div className="mb-4 flex gap-2">
              {selectedCategory && (
                <div className="badge badge-primary gap-2">
                  Kategori:{" "}
                  {categories.find((c) => c.id === selectedCategory)?.name}
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="btn btn-ghost btn-xs"
                  >
                    ×
                  </button>
                </div>
              )}
              {selectedFolder && (
                <div className="badge badge-secondary gap-2">
                  Folder: {folders.find((f) => f.id === selectedFolder)?.name}
                  <button
                    onClick={() => setSelectedFolder(null)}
                    className="btn btn-ghost btn-xs"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Catatan List with Pagination */}
          <CatatanListPaginated
            selectedCategory={selectedCategory}
            selectedFolder={selectedFolder}
          />
        </div>
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">Tambah Catatan Baru</h3>
            <FormCatatanAdd
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </div>
          <div className="modal-backdrop" onClick={handleFormCancel}></div>
        </div>
      )}
    </div>
  );
}
