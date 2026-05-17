"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { canWrite } from "@/lib/constants/roles";

const projectSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional().or(z.literal("")),
  client_id: z.string().uuid().optional().or(z.literal("")),
  status: z.enum(["active", "completed", "on_hold", "cancelled"]).optional(),
  start_date: z.string().optional().or(z.literal("")),
  end_date: z.string().optional().or(z.literal("")),
  budget: z.string().optional().or(z.literal("")),
});

export async function createProjectAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const parsed = projectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    client_id: formData.get("client_id"),
    status: formData.get("status"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
    budget: formData.get("budget"),
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

  const budget = parsed.data.budget ? parseFloat(parsed.data.budget) : null;

  const { error } = await supabase.from("projects").insert({
    org_id: member.org_id,
    name: parsed.data.name,
    description: parsed.data.description || null,
    client_id: parsed.data.client_id || null,
    status: parsed.data.status || "active",
    start_date: parsed.data.start_date || null,
    end_date: parsed.data.end_date || null,
    budget,
  });

  if (error) return { error: error.message };
  revalidatePath("/app/projetos");
  return { success: true };
}

export async function updateProjectAction(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const parsed = projectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    client_id: formData.get("client_id"),
    status: formData.get("status"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
    budget: formData.get("budget"),
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

  const budget = parsed.data.budget ? parseFloat(parsed.data.budget) : null;

  const { error } = await supabase.from("projects").update({
    name: parsed.data.name,
    description: parsed.data.description || null,
    client_id: parsed.data.client_id || null,
    status: parsed.data.status,
    start_date: parsed.data.start_date || null,
    end_date: parsed.data.end_date || null,
    budget,
  }).eq("id", id).eq("org_id", member.org_id);

  if (error) return { error: error.message };
  revalidatePath("/app/projetos");
  revalidatePath(`/app/projetos/${id}`);
  return { success: true };
}

export async function deleteProjectAction(id: string) {
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

  const { error } = await supabase.from("projects").delete().eq("id", id).eq("org_id", member.org_id);
  if (error) return { error: error.message };
  revalidatePath("/app/projetos");
  return { success: true };
}
