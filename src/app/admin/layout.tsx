import { requireAdminOrEditor } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireAdminOrEditor();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AdminSidebar profile={profile} />
      <main className="flex-1 bg-cream p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
