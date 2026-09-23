import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { Toaster } from "@/components/layout/Toaster";

export const metadata: Metadata = { title: "Administración", robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminShell>{children}</AdminShell>
      <Toaster />
    </>
  );
}
