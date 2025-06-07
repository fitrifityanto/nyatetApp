import CatatanItem from "./CatatanItem";

type Catatan = {
  id: string;
  title: string;
  content: string;
  category_id: string | null;
  folder_id: string | null;
  created_at: string;
  updated_at: string;
};

interface CatatanListProps {
  catatan: Catatan[];
  loading?: boolean;
}

const CatatanList = ({ catatan, loading = false }: CatatanListProps) => {
  if (loading) return <p className="text-center">Loading catatan...</p>;

  if (catatan.length === 0) {
    return <p className="text-center">Belum ada catatan.</p>;
  }

  return (
    <div className="space-y-4">
      {catatan.map((item) => (
        <CatatanItem
          key={item.id}
          id={item.id}
          judul={item.title}
          isi={item.content}
          createdAt={item.created_at}
        />
      ))}
    </div>
  );
};

export default CatatanList;
