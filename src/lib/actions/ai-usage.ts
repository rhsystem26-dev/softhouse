"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { canWrite } from "@/lib/constants/roles";

const aiUsageSchema = z.object({
  project_id: z.string().uuid("Projeto é obrigatório"),
  model_id: z.string().uuid("Modelo é obrigatório"),
  tokens_in: z.string().min(1, "Tokens de entrada é obrigatório"),
  tokens_out: z.string().min(1, "Tokens de saída é obrigatório"),
  cost: z.string().min(1, "Custo é obrigatório"),
  latency_ms: z.string().optional().or(z.literal("")),
  quality_score: z.string().optional().or(z.literal("")),
  time_saved_hours: z.string().optional().or(z.literal("")),
  result: z.enum(["accepted", "rejected", "modified"]).optional().or(z.literal("")),
  rework: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

const allowedRoles = ["admin", "socio", "gerente"];

export async function createAiUsageAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const parsed = aiUsageSchema.safeParse({
    project_id: formData.get("project_id"),
    model_id: formData.get("model_id"),
    tokens_in: formData.get("tokens_in"),
    tokens_out: formData.get("tokens_out"),
    cost: formData.get("cost"),
    latency_ms: formData.get("latency_ms"),
    quality_score: formData.get("quality_score"),
    time_saved_hours: formData.get("time_saved_hours"),
    result: formData.get("result"),
    rework: formData.get("rework"),
    notes: formData.get("notes"),
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

  const tokensIn = parseInt(parsed.data.tokens_in);
  const tokensOut = parseInt(parsed.data.tokens_out);
  const cost = parseFloat(parsed.data.cost);

  if (isNaN(tokensIn) || tokensIn < 0) return { error: "Tokens de entrada inválido" };
  if (isNaN(tokensOut) || tokensOut < 0) return { error: "Tokens de saída inválido" };
  if (isNaN(cost) || cost < 0) return { error: "Custo inválido" };

  const latency = parsed.data.latency_ms ? parseInt(parsed.data.latency_ms) : null;
  const quality = parsed.data.quality_score ? parseInt(parsed.data.quality_score) : null;
  const hours = parsed.data.time_saved_hours ? parseFloat(parsed.data.time_saved_hours) : null;
  const result = parsed.data.result || null;
  const rework = parsed.data.rework === "true" || parsed.data.rework === "on";

  const { error } = await supabase.from("ai_usage").insert({
    org_id: member.org_id,
    project_id: parsed.data.project_id,
    user_id: user.id,
    model_id: parsed.data.model_id,
    tokens_in: tokensIn,
    tokens_out: tokensOut,
    cost,
    latency_ms: latency,
    quality_score: quality,
    time_saved_hours: hours,
    result,
    rework,
    notes: parsed.data.notes || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/app/ia");
  return { success: true };
}

export async function deleteAiUsageAction(id: string) {
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

  const { error } = await supabase.from("ai_usage").delete().eq("id", id).eq("org_id", member.org_id);
  if (error) return { error: error.message };
  revalidatePath("/app/ia");
  return { success: true };
}
