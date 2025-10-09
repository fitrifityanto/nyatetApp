import { useParams } from "react-router";
import CatatanDetail from "@/components/catatan/CatatanDetail";

const CatatanDetailPage = () => {
  const { id } = useParams();

  if (!id) {
    return <p className="text-center text-error">Invalid catatan ID.</p>;
  }

  return <CatatanDetail id={id} />;
};

export default CatatanDetailPage;
