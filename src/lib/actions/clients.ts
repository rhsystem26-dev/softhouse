"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { canWrite } from "@/lib/constants/roles";

const clientSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
});

export async function createClientAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const parsed = clientSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { data: member } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (!member || !canWrite(member.role)) {
    return { error: "Sem permissão" };
  }

  const { error } = await supabase.from("clients").insert({
    org_id: member.org_id,
    name: parsed.data.name,
    email: parsed.data.email || null,
    phone: parsed.data.phone || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/app/clientes");
  return { success: true };
}

export async function updateClientAction(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const parsed = clientSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { data: member } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (!member || !canWrite(member.role)) {
    return { error: "Sem permissão" };
  }

  const { error } = await supabase.from("clients").update({
    name: parsed.data.name,
    email: parsed.data.email || null,
    phone: parsed.data.phone || null,
  }).eq("id", id).eq("org_id", member.org_id);

  if (error) return { error: error.message };
  revalidatePath("/app/clientes");
  return { success: true };
}

export async function deleteClientAction(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const { data: member } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (!member || !canWrite(member.role)) {
    return { error: "Sem permissão" };
  }

  const { error } = await supabase.from("clients").delete().eq("id", id).eq("org_id", member.org_id);
  if (error) return { error: error.message };
  revalidatePath("/app/clientes");
  return { success: true };
}
