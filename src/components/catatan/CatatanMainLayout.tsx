import { useState, useEffect, useCallback } from "react";
import CatatanSidebar from "./CatatanSidebar";
import CatatanListPaginated from "./CatatanListPaginated";
import FormCatatanAdd from "../forms/FormCatatanAdd";
import supabase from "../../lib/supabase";
import { Menu, X } from "lucide-react";
import ToastAlert from "../ToastAlert"; // Import ToastAlert

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

const CatatanMainLayout = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // State baru untuk memicu refresh CatatanListPaginated

  const [toastAlert, setToastAlert] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({
    show: false,
    type: "success",
    message: "",
  });

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
    setIsSidebarOpen(false);
  };

  const handleFormSuccess = useCallback(async () => {
    console.log("Catatan berhasil ditambahkan!");
    setShowAddForm(false); // Tutup modal terlebih dahulu
    // Refresh data setelah menambahkan catatan baru
    await Promise.all([fetchCategories(), fetchFolders()]);
    setRefreshTrigger((prev) => prev + 1); // Increment trigger untuk refresh CatatanListPaginated
    // ToastAlert akan ditampilkan oleh useEffect di FormCatatanAdd yang memanggil setParentToastAlert
    // Tidak perlu clear toast alert di sini karena FormCatatanAdd sudah memanggil setParentToastAlert.
  }, []); // Tambahkan dependensi jika ada, tapi karena tidak ada, biarkan kosong

  const handleFormCancel = useCallback(() => {
    console.log("Cancelled");
    setShowAddForm(false);
    // Clear toast alert jika pengguna membatalkan dan ada pesan yang mungkin tertunda
    setToastAlert({ show: false, type: "success", message: "" });
  }, []);

  // Fungsi untuk menangani pemilihan kategori dan menutup sidebar di mobile
  const handleCategorySelectAndCloseSidebar = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setIsSidebarOpen(false); // Tutup sidebar setelah memilih kategori
  };

  // Fungsi untuk menangani pemilihan folder dan menutup sidebar di mobile
  const handleFolderSelectAndCloseSidebar = (folderId: string | null) => {
    setSelectedFolder(folderId);
    setIsSidebarOpen(false); // Tutup sidebar setelah memilih folder
  };

  const closeToast = useCallback(() => {
    setToastAlert({ show: false, type: "success", message: "" });
    // Jika perlu, clear messages dari useCatatan hook
    // Misalnya, jika Anda memiliki akses ke clearMessages dari useCatatan di sini:
    // clearMessages();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-base-100">
        {/* Placeholder untuk sidebar di desktop */}
        <div className="hidden md:block w-64 bg-base-200 p-4 min-h-screen">
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
    <div className="flex flex-col md:flex-row min-h-screen bg-base-100">
      {/* Sidebar untuk Desktop */}
      <div className="hidden md:block">
        <CatatanSidebar
          categories={categories}
          folders={folders}
          onAddNew={handleAddNew}
          onCategorySelect={setSelectedCategory}
          onFolderSelect={setSelectedFolder}
          selectedCategory={selectedCategory}
          selectedFolder={selectedFolder}
        />
      </div>

      <div className="flex-1 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header untuk Mobile/Tablet */}
          <div className="flex justify-between items-center mb-6 md:mb-0">
            <h1 className="text-2xl md:text-3xl font-bold">Catatan</h1>
            <button
              className="btn btn-ghost md:hidden" // Hanya tampil di mobile/tablet
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <p className="hidden md:block text-base-content/60 mb-6">
            Kelola semua catatan Anda dengan mudah
          </p>

          {/* Filter Badge */}
          {(selectedCategory || selectedFolder) && (
            <div className="mb-4 flex flex-wrap gap-2">
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
            refreshTrigger={refreshTrigger}
          />
        </div>
      </div>

      {/* Sidebar sebagai Drawer untuk Mobile/Tablet */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/20 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          ></div>

          {/* Sidebar Content */}
          <div className="relative max-w-xs bg-base-200 h-full p-4 transform transition-transform duration-300 ease-in-out translate-x-0">
            <div className="flex justify-end mb-4">
              <button
                className="btn btn-ghost"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X size={24} />
              </button>
            </div>
            <CatatanSidebar
              categories={categories}
              folders={folders}
              onAddNew={handleAddNew}
              onCategorySelect={handleCategorySelectAndCloseSidebar}
              onFolderSelect={handleFolderSelectAndCloseSidebar}
              selectedCategory={selectedCategory}
              selectedFolder={selectedFolder}
            />
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">Tambah Catatan Baru</h3>
            <FormCatatanAdd
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
              setParentToastAlert={setToastAlert} // Teruskan setToastAlert ke FormCatatanAdd
            />
          </div>
          <div className="modal-backdrop" onClick={handleFormCancel}></div>
        </div>
      )}

      {/* Toast Alerts (Untuk pesan sukses/error dari form) */}
      {toastAlert.show && (
        <ToastAlert
          type={toastAlert.type}
          message={toastAlert.message}
          onClose={closeToast}
          duration={4000} // Durasi default
        />
      )}
    </div>
  );
};

export default CatatanMainLayout;
