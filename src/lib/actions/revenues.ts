"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const revenueSchema = z.object({
  project_id: z.string().uuid("Projeto é obrigatório"),
  amount: z.string().min(1, "Valor é obrigatório"),
  description: z.string().optional().or(z.literal("")),
  date: z.string().min(1, "Data é obrigatória"),
  type: z.enum(["servico", "consultoria", "produto", "retainer", "outro"]).optional(),
});

const allowedRoles = ["admin", "socio", "financeiro"];

export async function createRevenueAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const parsed = revenueSchema.safeParse({
    project_id: formData.get("project_id"),
    amount: formData.get("amount"),
    description: formData.get("description"),
    date: formData.get("date"),
    type: formData.get("type"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { data: member } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (!member || !allowedRoles.includes(member.role)) {
    return { error: "Sem permissão" };
  }

  const amount = parseFloat(parsed.data.amount);
  if (isNaN(amount) || amount < 0) return { error: "Valor inválido" };

  const { error } = await supabase.from("revenues").insert({
    org_id: member.org_id,
    project_id: parsed.data.project_id,
    amount,
    description: parsed.data.description || null,
    date: parsed.data.date,
    type: parsed.data.type || "servico",
  });

  if (error) return { error: error.message };
  revalidatePath("/app/financeiro");
  return { success: true };
}

export async function updateRevenueAction(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const parsed = revenueSchema.safeParse({
    project_id: formData.get("project_id"),
    amount: formData.get("amount"),
    description: formData.get("description"),
    date: formData.get("date"),
    type: formData.get("type"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { data: member } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (!member || !allowedRoles.includes(member.role)) {
    return { error: "Sem permissão" };
  }

  const amount = parseFloat(parsed.data.amount);
  if (isNaN(amount) || amount < 0) return { error: "Valor inválido" };

  const { error } = await supabase.from("revenues").update({
    project_id: parsed.data.project_id,
    amount,
    description: parsed.data.description || null,
    date: parsed.data.date,
    type: parsed.data.type,
  }).eq("id", id).eq("org_id", member.org_id);

  if (error) return { error: error.message };
  revalidatePath("/app/financeiro");
  return { success: true };
}

export async function deleteRevenueAction(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const { data: member } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (!member || !allowedRoles.includes(member.role)) {
    return { error: "Sem permissão" };
  }

  const { error } = await supabase.from("revenues").delete().eq("id", id).eq("org_id", member.org_id);
  if (error) return { error: error.message };
  revalidatePath("/app/financeiro");
  return { success: true };
}
