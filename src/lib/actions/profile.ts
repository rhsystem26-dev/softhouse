"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const full_name = (formData.get("full_name") as string | null)?.trim();
  const phone = (formData.get("phone") as string | null)?.trim() || null;

  if (!full_name) return { error: "Nome é obrigatório" };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name, phone })
    .eq("user_id", user.id);

  if (error) return { error: "Erro ao salvar perfil" };

  revalidatePath("/app/perfil");
  revalidatePath("/app", "layout");
  return {};
}

export async function updateEmailAction(
  formData: FormData
): Promise<{ error?: string; sent?: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const email = (formData.get("email") as string | null)?.trim();
  if (!email) return { error: "Email é obrigatório" };
  if (email === user.email) return { error: "Mesmo email atual" };

  const { error } = await supabase.auth.updateUser({ email });
  if (error) return { error: "Erro ao atualizar email. Tente novamente." };

  return { sent: true };
}

export async function uploadAvatarAction(
  formData: FormData
): Promise<{ error?: string; url?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const file = formData.get("avatar") as File | null;
  if (!file || file.size === 0) return { error: "Nenhum arquivo selecionado" };
  if (file.size > 2 * 1024 * 1024) return { error: "Imagem deve ter no máximo 2MB" };

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${user.id}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) return { error: "Erro ao fazer upload da imagem" };

  const { data: { publicUrl } } = supabase.storage
    .from("avatars")
    .getPublicUrl(path);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("user_id", user.id);

  if (updateError) return { error: "Imagem salva mas erro ao atualizar perfil" };

  revalidatePath("/app/perfil");
  revalidatePath("/app", "layout");
  return { url: publicUrl };
}
