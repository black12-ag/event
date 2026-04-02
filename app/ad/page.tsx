import AdminDashboard from "../components/AdminDashboard";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return <AdminDashboard initialAuthenticated={isAdminAuthenticated()} />;
}
