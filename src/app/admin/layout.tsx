import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminShell from "./AdminShell";

export const metadata = {
  title: "AAME Admin",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Login page has its own layout
  // Middleware handles the redirect, but double-check here
  if (!user) {
    return <>{children}</>;
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}
