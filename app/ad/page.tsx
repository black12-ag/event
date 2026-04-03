export const runtime = "edge";

import AdminDashboard from "../components/AdminDashboard";

import { isAdminAuthenticated } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";


export default function AdminPage() {
  return <AdminDashboard initialAuthenticated={isAdminAuthenticated()} />;
}
