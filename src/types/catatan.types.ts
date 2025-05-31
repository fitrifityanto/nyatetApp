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
}

export interface CreateCatatanData {
  judul_catatan: string;
  isi_catatan?: string;
  kategori_id?: string;
  folder_id?: string;
  is_archived: boolean;
  pinned: boolean;
}

export interface KategoriOption {
  id: string;
  name: string;
}

export interface FolderOption {
  id: string;
  name: string;
}
