import { useState, useEffect, useCallback } from "react";
import CatatanSidebar from "./CatatanSidebar";
import CatatanListPaginated from "./CatatanListPaginated";
import FormCatatanAdd from "../forms/FormCatatanAdd";
import supabase from "../../lib/supabase";
import { Menu, X } from "lucide-react";
import ToastAlert from "../ToastAlert";

interface Category {
  id: string;
  name: string;
  count: number;
}

interface DatabaseCategory {
  id: string;
  user_id: string;
  nama: string;
  created_at: string;
}

type MinimalCategory = Pick<DatabaseCategory, "id" | "nama">;

interface Folder {
  id: string;
  name: string;
  count: number;
}

interface DatabaseFolder {
  id: string;
  user_id: string;
  nama: string;
  created_at: string;
}

type MinimalFolder = Pick<DatabaseFolder, "id" | "nama">;

interface SupabaseCountResult {
  count: number | null;
  error: Error | null;
}

const CatatanMainLayout = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

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
        setCategories([]);
        return;
      }

      const { data, error: categoriesError } = await supabase
        .from("kategori_catatan")
        .select("id, nama")
        .eq("user_id", userId)
        .order("nama");

      const categoriesData = data as MinimalCategory[];

      if (categoriesError) {
        console.error("Error fetching categories:", categoriesError);
        return;
      }

      const categoriesWithCount = await Promise.all(
        categoriesData.map(async (category) => {
          const { count, error: countError }: SupabaseCountResult =
            await supabase
              .from("catatan")
              .select("*", { count: "exact", head: true })
              .eq("kategori_id", category.id)
              .eq("user_id", userId);

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
      const { data: userAuthData } = await supabase.auth.getUser();
      const userId = userAuthData.user?.id;

      if (!userId) {
        setFolders([]);
        return;
      }

      const { data, error: foldersError } = await supabase
        .from("folder_catatan")
        .select("id, nama")
        .eq("user_id", userId)
        .order("nama");

      const foldersData = data as MinimalFolder[];

      if (foldersError) {
        console.error("Error fetching folders:", foldersError);
        return;
      }

      const foldersWithCount = await Promise.all(
        foldersData.map(async (folder) => {
          const { count, error: countError }: SupabaseCountResult =
            await supabase
              .from("catatan")
              .select("*", { count: "exact", head: true })
              .eq("folder_id", folder.id)
              .eq("user_id", userId);

          if (countError) {
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
      await Promise.all([fetchCategories(), fetchFolders()]);
    };

    void loadData();
  }, []);

  const handleAddNew = useCallback(() => {
    setShowAddForm(true);
    setIsSidebarOpen(false);
  }, []);

  const handleFormSuccess = useCallback(async () => {
    console.log("Catatan berhasil ditambahkan!");
    setShowAddForm(false);

    await Promise.all([fetchCategories(), fetchFolders()]);
    setRefreshTrigger((prev) => prev + 1);
    setToastAlert({
      show: true,
      type: "success",
      message: "Catatan berhasil ditambahkan!",
    });
  }, []);

  const handleFormCancel = useCallback(() => {
    console.log("Cancelled");
    setShowAddForm(false);

    setToastAlert({ show: false, type: "success", message: "" });
  }, []);

  const closeToast = useCallback(() => {
    setToastAlert((prev) => ({ ...prev, show: false }));
  }, []);

  const handleCategorySelectAndCloseSidebar = useCallback(
    (categoryId: string | null) => {
      setSelectedCategory(categoryId);
      setSelectedFolder(null);
      setIsSidebarOpen(false);
    },
    [],
  );

  const handleFolderSelectAndCloseSidebar = useCallback(
    (folderId: string | null) => {
      setSelectedFolder(folderId);
      setSelectedCategory(null);
      setIsSidebarOpen(false);
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
              type="button"
              className="btn btn-square btn-ghost"
              onClick={() => {
                setIsSidebarOpen(true);
              }}
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
          onClick={() => {
            setIsSidebarOpen(false);
          }}
        >
          <div
            className="fixed left-0 top-0 h-full bg-base-200 w-64 p-4 z-50 overflow-y-auto"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="flex justify-end mb-4">
              <button
                type="button"
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
          duration={4000}
        />
      )}
    </div>
  );
};

export default CatatanMainLayout;
