import { isAdmin } from "@/lib/auth";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminNav from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) {
    return <AdminLogin />;
  }
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--cream)]">
      <AdminNav />
      <div className="flex-1 p-4 sm:p-8 max-w-full overflow-x-hidden">{children}</div>
    </div>
  );
}
