import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("approval_status")
    .eq("user_id", user.id)
    .single();

  if (profile?.approval_status === "pending") {
    redirect("/aguardando-aprovacao");
  }

  if (profile?.approval_status === "rejected") {
    await supabase.auth.signOut();
    redirect("/login?error=acesso_negado");
  }

  return <AppShell>{children}</AppShell>;
}
