import FormCatatanAdd from "../components/forms/FormCatatanAdd";

export default function DashboardPage() {
  const handleSuccess = () => {
    console.log("Catatan berhasil ditambahkan!");
    // Redirect or refresh data
  };

  const handleCancel = () => {
    console.log("Cancelled");
    // Close modal or navigate back
  };
  return (
    <div>
      Dashboard
      <FormCatatanAdd onSuccess={handleSuccess} onCancel={handleCancel} />
    </div>
  );
}
