"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const costSchema = z.object({
  project_id: z.string().uuid("Projeto é obrigatório"),
  amount: z.string().min(1, "Valor é obrigatório"),
  description: z.string().optional().or(z.literal("")),
  date: z.string().min(1, "Data é obrigatória"),
  category: z.enum(["ia", "infra", "pessoal", "outros"]).optional(),
});

const allowedRoles = ["admin", "socio", "financeiro"];

export async function createCostAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const parsed = costSchema.safeParse({
    project_id: formData.get("project_id"),
    amount: formData.get("amount"),
    description: formData.get("description"),
    date: formData.get("date"),
    category: formData.get("category"),
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

  const { error } = await supabase.from("costs").insert({
    org_id: member.org_id,
    project_id: parsed.data.project_id,
    amount,
    description: parsed.data.description || null,
    date: parsed.data.date,
    category: parsed.data.category || "outros",
  });

  if (error) return { error: error.message };
  revalidatePath("/app/financeiro");
  return { success: true };
}

export async function updateCostAction(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const parsed = costSchema.safeParse({
    project_id: formData.get("project_id"),
    amount: formData.get("amount"),
    description: formData.get("description"),
    date: formData.get("date"),
    category: formData.get("category"),
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

  const { error } = await supabase.from("costs").update({
    project_id: parsed.data.project_id,
    amount,
    description: parsed.data.description || null,
    date: parsed.data.date,
    category: parsed.data.category,
  }).eq("id", id).eq("org_id", member.org_id);

  if (error) return { error: error.message };
  revalidatePath("/app/financeiro");
  return { success: true };
}

export async function deleteCostAction(id: string) {
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

  const { error } = await supabase.from("costs").delete().eq("id", id).eq("org_id", member.org_id);
  if (error) return { error: error.message };
  revalidatePath("/app/financeiro");
  return { success: true };
}
