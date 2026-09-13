import { TenantNav } from "@/components/layout/tenant-nav";

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 pb-20 lg:pb-0">
      <TenantNav />
      <main className="lg:pl-56">
        <div className="p-4 md:p-6 max-w-3xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
