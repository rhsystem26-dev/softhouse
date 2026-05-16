"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const deliverySchema = z.object({
  project_id: z.string().uuid("Projeto é obrigatório"),
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional().or(z.literal("")),
  status: z.enum(["backlog", "in_progress", "review", "done", "blocked"]),
  due_date: z.string().optional().or(z.literal("")),
  assignee_id: z.string().optional().or(z.literal("")),
});

const manageRoles = ["admin", "socio", "gerente"];

export async function createDeliveryAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const parsed = deliverySchema.safeParse({
    project_id: formData.get("project_id"),
    title: formData.get("title"),
    description: formData.get("description"),
    status: formData.get("status") || "backlog",
    due_date: formData.get("due_date"),
    assignee_id: formData.get("assignee_id"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { data: member } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (!member || !manageRoles.includes(member.role)) {
    return { error: "Sem permissão" };
  }

  const { error } = await supabase.from("deliveries").insert({
    org_id: member.org_id,
    project_id: parsed.data.project_id,
    title: parsed.data.title,
    description: parsed.data.description || null,
    status: parsed.data.status,
    due_date: parsed.data.due_date || null,
    assignee_id: parsed.data.assignee_id || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/app/entregas");
  return { success: true };
}

export async function updateDeliveryAction(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const parsed = deliverySchema.safeParse({
    project_id: formData.get("project_id"),
    title: formData.get("title"),
    description: formData.get("description"),
    status: formData.get("status") || "backlog",
    due_date: formData.get("due_date"),
    assignee_id: formData.get("assignee_id"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { data: member } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (!member || !manageRoles.includes(member.role)) {
    return { error: "Sem permissão" };
  }

  const { error } = await supabase.from("deliveries").update({
    project_id: parsed.data.project_id,
    title: parsed.data.title,
    description: parsed.data.description || null,
    status: parsed.data.status,
    due_date: parsed.data.due_date || null,
    assignee_id: parsed.data.assignee_id || null,
    updated_at: new Date().toISOString(),
  }).eq("id", id).eq("org_id", member.org_id);

  if (error) return { error: error.message };
  revalidatePath("/app/entregas");
  return { success: true };
}

export async function deleteDeliveryAction(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const { data: member } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (!member || !["admin", "socio"].includes(member.role)) {
    return { error: "Sem permissão" };
  }

  const { error } = await supabase.from("deliveries").delete().eq("id", id).eq("org_id", member.org_id);
  if (error) return { error: error.message };
  revalidatePath("/app/entregas");
  return { success: true };
}
