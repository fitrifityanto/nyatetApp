import { useEffect, useState } from "react";

import CatatanItem from "./CatatanItem";
import supabase from "../../lib/supabase";

type Catatan = {
  id: string;
  judul_catatan: string;
  isi_catatan: string | null;
  created_at: string;
};

const CatatanList = () => {
  const [catatan, setCatatan] = useState<Catatan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatatan = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("catatan")
        .select("id, judul_catatan, isi_catatan, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Gagal fetch catatan:", error.message);
      } else {
        setCatatan(data || []);
      }
      setLoading(false);
    };

    fetchCatatan();
  }, []);

  if (loading) return <p className="text-center">Loading catatan...</p>;
  if (catatan.length === 0)
    return <p className="text-center">Belum ada catatan.</p>;

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
