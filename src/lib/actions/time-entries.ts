"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { canWrite } from "@/lib/constants/roles";

const timeEntrySchema = z.object({
  project_id: z.string().uuid("Projeto é obrigatório"),
  user_id: z.string().uuid("Usuário é obrigatório"),
  hours: z.string().min(1, "Horas é obrigatório"),
  description: z.string().optional().or(z.literal("")),
  date: z.string().min(1, "Data é obrigatória"),
});

const manageRoles = ["admin", "socio", "gerente"];

export async function createTimeEntryAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const parsed = timeEntrySchema.safeParse({
    project_id: formData.get("project_id"),
    user_id: formData.get("user_id"),
    hours: formData.get("hours"),
    description: formData.get("description"),
    date: formData.get("date"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { data: member } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (!member) return { error: "Sem organização" };

  const isManager = manageRoles.includes(member.role);
  const isOwnEntry = parsed.data.user_id === user.id;

  if (!isManager && !isOwnEntry) return { error: "Sem permissão" };

  const hours = parseFloat(parsed.data.hours);
  if (isNaN(hours) || hours <= 0) return { error: "Horas inválidas" };

  const { error } = await supabase.from("time_entries").insert({
    org_id: member.org_id,
    project_id: parsed.data.project_id,
    user_id: parsed.data.user_id,
    hours,
    description: parsed.data.description || null,
    date: parsed.data.date,
  });

  if (error) return { error: error.message };
  revalidatePath("/app/tempo");
  return { success: true };
}

export async function updateTimeEntryAction(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const parsed = timeEntrySchema.safeParse({
    project_id: formData.get("project_id"),
    user_id: formData.get("user_id"),
    hours: formData.get("hours"),
    description: formData.get("description"),
    date: formData.get("date"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { data: member } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (!member) return { error: "Sem organização" };

  const isManager = manageRoles.includes(member.role);
  const isOwnEntry = parsed.data.user_id === user.id;

  if (!isManager && !isOwnEntry) return { error: "Sem permissão" };

  const hours = parseFloat(parsed.data.hours);
  if (isNaN(hours) || hours <= 0) return { error: "Horas inválidas" };

  const { error } = await supabase.from("time_entries").update({
    project_id: parsed.data.project_id,
    user_id: parsed.data.user_id,
    hours,
    description: parsed.data.description || null,
    date: parsed.data.date,
  }).eq("id", id).eq("org_id", member.org_id);

  if (error) return { error: error.message };
  revalidatePath("/app/tempo");
  return { success: true };
}

export async function deleteTimeEntryAction(id: string) {
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

  const { error } = await supabase.from("time_entries").delete().eq("id", id).eq("org_id", member.org_id);
  if (error) return { error: error.message };
  revalidatePath("/app/tempo");
  return { success: true };
}
