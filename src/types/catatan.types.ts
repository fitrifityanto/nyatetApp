export interface Catatan {
  id?: string;
  user_id?: string;
  judul_catatan: string;
  isi_catatan?: string;
  kategori_id?: string;
  folder_id?: string;
  is_archived: boolean;
  pinned: boolean;
  created_at?: string;
  updated_at?: string;
  // Tambahkan properti untuk relasi kategori dan folder
  kategori_catatan?: {
    id: string;
    nama: string;
  };
  folder_catatan?: {
    id: string;
    nama: string;
  };
}

export interface CreateCatatanData {
  judul_catatan: string;
  isi_catatan: string;
  kategori_nama: string; // Nama kategori untuk ditampilkan di UI
  folder_nama: string; // Nama folder untuk ditampilkan di UI
  is_archived: boolean;
  pinned: boolean;
}

// Type untuk data dari database (dengan join)
export interface CatatanWithDetails {
  id: string;
  user_id: string;
  judul_catatan: string;
  isi_catatan: string | null;
  kategori_id: string | null;
  folder_id: string | null;
  is_archived: boolean;
  pinned: boolean;
  created_at: string;
  updated_at: string;
  kategori_catatan?: {
    id: string;
    nama: string;
  };
  folder_catatan?: {
    id: string;
    nama: string;
  };
}

export interface KategoriOption {
  id: string;
  name: string;
}

export interface FolderOption {
  id: string;
  name: string;
}

export interface CreateCatatanData {
  judul_catatan: string;
  isi_catatan: string;
  kategori_nama: string; // Nama kategori untuk ditampilkan di UI
  folder_nama: string; // Nama folder untuk ditampilkan di UI
  is_archived: boolean;
  pinned: boolean;
}

// Type untuk data dari database (dengan join)
export interface CatatanWithDetails {
  id: string;
  user_id: string;
  judul_catatan: string;
  isi_catatan: string | null;
  kategori_id: string | null;
  folder_id: string | null;
  is_archived: boolean;
  pinned: boolean;
  created_at: string;
  updated_at: string;
  kategori_catatan?: {
    id: string;
    nama: string;
  };
  folder_catatan?: {
    id: string;
    nama: string;
  };
}

export interface KategoriOption {
  id: string;
  name: string;
}

export interface FolderOption {
  id: string;
  name: string;
}
