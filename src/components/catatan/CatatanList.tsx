import CatatanItem from "./CatatanItem";
import type { CatatanWithDetails } from "@/types/catatan.types";

interface CatatanListProps {
  catatan: CatatanWithDetails[];
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
          judul={item.judul_catatan}
          isi={item.isi_catatan}
          createdAt={item.created_at}
        />
      ))}
    </div>
  );
};

export default CatatanList;
