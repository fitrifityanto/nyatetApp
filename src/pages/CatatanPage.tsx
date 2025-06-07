import CatatanList from "../components/catatan/CatatanList";
import FormCatatanAdd from "../components/forms/FormCatatanAdd";

export default function CatatanPage() {
  const handleSuccess = () => {
    console.log("Catatan berhasil ditambahkan!");
    // Redirect or refresh data
  };

  const handleCancel = () => {
    console.log("Cancelled");
    // Close modal or navigate back
  };
  return (
    <>
      <h1>Halaman Catatan</h1>
      <FormCatatanAdd onSuccess={handleSuccess} onCancel={handleCancel} />
      <CatatanList />
    </>
  );
}
