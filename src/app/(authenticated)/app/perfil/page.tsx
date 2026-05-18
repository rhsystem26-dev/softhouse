import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PerfilForm } from "@/components/perfil/perfil-form";

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, phone, avatar_url")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-100">Meu Perfil</h1>
        <p className="text-sm text-slate-400 mt-1">Edite seus dados pessoais</p>
      </div>
      <PerfilForm
        currentName={profile?.full_name ?? ""}
        currentEmail={user.email ?? ""}
        currentPhone={profile?.phone ?? ""}
        currentAvatarUrl={profile?.avatar_url ?? null}
      />
    </div>
  );
}
