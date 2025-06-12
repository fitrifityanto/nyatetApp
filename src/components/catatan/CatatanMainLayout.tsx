// src/components/CatatanMainLayout.tsx

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
      const { data: userAuthData } = await supabase.auth.getUser(); // Ambil data user
      const userId = userAuthData.user?.id; // Ambil user ID

      if (!userId) {
        // Jika tidak ada user ID, mungkin user belum login, atau token expired
        // Set categories menjadi kosong dan keluar dari fungsi
        setCategories([]);
        return;
      }

      const { data: categoriesData, error: categoriesError } = await supabase
        .from<"kategori_catatan", { id: string; nama: string }>(
          "kategori_catatan",
        )
        .select("id, nama")
        .eq("user_id", userId) // **Tambahkan filter user_id di sini**
        .order("nama");

      if (categoriesError) {
        console.error("Error fetching categories:", categoriesError);
        return;
      }

      const categoriesWithCount = await Promise.all(
        categoriesData.map(async (category) => {
          const { count, error: countError } = await supabase
            .from("catatan")
            .select("*", { count: "exact", head: true }) // Meminta hanya 'count()'
            .eq("kategori_id", category.id)
            .eq("user_id", userId); // **Tambahkan filter user_id di sini**

          if (countError) {
            console.error(
              `Error fetching count for category ${category.nama}:`,
              countError,
            );
            return {
              id: category.id,
              name: category.nama,
              count: 0,
            };
          }

          return {
            id: category.id,
            name: category.nama,
            count: count ?? 0,
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
      const { data: userAuthData } = await supabase.auth.getUser(); // Ambil data user
      const userId = userAuthData.user?.id; // Ambil user ID

      if (!userId) {
        setFolders([]);
        return;
      }

      const { data: foldersData, error: foldersError } = await supabase
        .from("folder_catatan")
        .select("id, nama")
        .eq("user_id", userId) // **Tambahkan filter user_id di sini**
        .order("nama");

      if (foldersError) {
        console.error("Error fetching folders:", foldersError);
        return;
      }

      const foldersWithCount = await Promise.all(
        foldersData.map(async (folder) => {
          const { count, error: countError } = await supabase // Tambahkan error di sini
            .from("catatan") // Sesuaikan dengan nama tabel catatan Anda
            .select("*", { count: "exact", head: true })
            .eq("folder_id", folder.id)
            .eq("user_id", userId); // **Tambahkan filter user_id di sini**

          if (countError) {
            // Tangani error untuk count folder
            console.error(
              `Error fetching count for folder ${folder.nama}:`,
              countError,
            );
            return {
              id: folder.id,
              name: folder.nama,
              count: 0,
            };
          }

          return {
            id: folder.id,
            name: folder.nama,
            count: count ?? 0,
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

    void loadData();
  }, []);

  const handleAddNew = useCallback(() => {
    setShowAddForm(true);
    setIsSidebarOpen(false);
  }, []);

  const handleFormSuccess = useCallback(async () => {
    console.log("Catatan berhasil ditambahkan!");
    setShowAddForm(false); // Tutup modal terlebih dahulu
    // Refresh data setelah menambahkan catatan baru
    await Promise.all([fetchCategories(), fetchFolders()]);
    setRefreshTrigger((prev) => prev + 1); // Increment trigger untuk refresh CatatanListPaginated
    setToastAlert({
      show: true,
      type: "success",
      message: "Catatan berhasil ditambahkan!",
    });
  }, []);

  const handleFormCancel = useCallback(() => {
    console.log("Cancelled");
    setShowAddForm(false);
    // Clear toast alert jika pengguna membatalkan dan ada pesan yang mungkin tertunda
    setToastAlert({ show: false, type: "success", message: "" });
  }, []); // Fungsi untuk menang

  const closeToast = useCallback(() => {
    setToastAlert((prev) => ({ ...prev, show: false }));
  }, []);

  const handleCategorySelectAndCloseSidebar = useCallback(
    (categoryId: string | null) => {
      setSelectedCategory(categoryId);
      setSelectedFolder(null); // Reset folder selection when category is selected
      setIsSidebarOpen(false); // Close sidebar on mobile
    },
    [],
  );

  const handleFolderSelectAndCloseSidebar = useCallback(
    (folderId: string | null) => {
      setSelectedFolder(folderId);
      setSelectedCategory(null); // Reset category selection when folder is selected
      setIsSidebarOpen(false); // Close sidebar on mobile
    },
    [],
  );

  return (
    <div className="flex h-screen bg-base-100">
      {/* Sidebar for larger screens */}
      <div className="hidden md:block">
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar for mobile */}
        <div className="navbar bg-base-200 shadow-md md:hidden">
          <div className="flex-none">
            <button
              className="btn btn-square btn-ghost"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>
          <div className="flex-1">
            <a className="btn btn-ghost text-xl">Catatan App</a>
          </div>
        </div>

        <main className="flex-1 p-4 overflow-y-auto">
          <h1 className="text-3xl font-bold mb-6">Daftar Catatan</h1>
          <CatatanListPaginated
            selectedCategory={selectedCategory}
            selectedFolder={selectedFolder}
            refreshTrigger={refreshTrigger}
          />
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        >
          <div
            className="fixed left-0 top-0 h-full bg-base-200 w-64 p-4 z-50 overflow-y-auto"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside sidebar
          >
            <div className="flex justify-end mb-4">
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setIsSidebarOpen(false);
                }}
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
              onSuccess={() => void handleFormSuccess()}
              onCancel={handleFormCancel}
              setParentToastAlert={setToastAlert}
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
