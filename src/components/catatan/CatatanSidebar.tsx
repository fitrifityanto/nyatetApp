import { Plus, Tag, Folder } from "lucide-react";

interface Category {
  id: string;
  name: string;
  count: number;
}

interface FolderItem {
  id: string;
  name: string;
  count: number;
}

interface CatatanSidebarProps {
  categories: Category[];
  folders: FolderItem[];
  onAddNew: () => void;
  onCategorySelect: (categoryId: string | null) => void;
  onFolderSelect: (folderId: string | null) => void;
  selectedCategory: string | null;
  selectedFolder: string | null;
}

export default function CatatanSidebar({
  categories,
  folders,
  onAddNew,
  onCategorySelect,
  onFolderSelect,
  selectedCategory,
  selectedFolder,
}: CatatanSidebarProps) {
  return (
    <div className="w-64 bg-base-200 p-4 min-h-screen">
      {/* Add New Button */}
      <button
        type="button"
        onClick={onAddNew}
        className="btn btn-primary w-full mb-6 gap-2"
      >
        <Plus size={18} />
        Tambah Catatan Baru
      </button>

      {/* Categories Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Tag size={16} />
          <h3 className="font-semibold text-sm">Kategori</h3>
        </div>
        <ul className="space-y-1">
          <li>
            <button
              type="button"
              onClick={() => {
                onCategorySelect(null);
              }}
              className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-base-300 ${
                selectedCategory === null ? "bg-base-300 font-medium" : ""
              }`}
            >
              Semua Kategori
            </button>
          </li>
          {categories.length > 0 ? (
            categories.map((category) => (
              <li key={category.id}>
                <button
                  type="button"
                  onClick={() => {
                    onCategorySelect(category.id);
                  }}
                  className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-base-300 flex justify-between ${
                    selectedCategory === category.id
                      ? "bg-base-300 font-medium"
                      : ""
                  }`}
                >
                  <span>{category.name}</span>
                  <span className="text-xs opacity-60">{category.count}</span>
                </button>
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-sm text-base-content/60">
              Belum ada kategori
            </li>
          )}
        </ul>
      </div>

      {/* Folders Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Folder size={16} />
          <h3 className="font-semibold text-sm">Folder</h3>
        </div>
        <ul className="space-y-1">
          <li>
            <button
              type="button"
              onClick={() => {
                onFolderSelect(null);
              }}
              className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-base-300 ${
                selectedFolder === null ? "bg-base-300 font-medium" : ""
              }`}
            >
              Semua Folder
            </button>
          </li>
          {folders.length > 0 ? (
            folders.map((folder) => (
              <li key={folder.id}>
                <button
                  type="button"
                  onClick={() => {
                    onFolderSelect(folder.id);
                  }}
                  className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-base-300 flex justify-between ${
                    selectedFolder === folder.id
                      ? "bg-base-300 font-medium"
                      : ""
                  }`}
                >
                  <span>{folder.name}</span>
                  <span className="text-xs opacity-60">{folder.count}</span>
                </button>
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-sm text-base-content/60">
              Belum ada folder
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
