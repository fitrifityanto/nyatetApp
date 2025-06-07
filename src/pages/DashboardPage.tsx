import { Link } from "react-router";

export default function DashboardPage() {
  return (
    <>
      <div>Dashboard</div>
      <div>
        <Link to="/catatan">Catatan</Link>
      </div>
    </>
  );
}
