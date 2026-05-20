"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const taskSchema = z.object({
  column_id: z.string().uuid(),
  project_id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional().or(z.literal("")),
  priority: z.enum(["baixa","media","alta","critica"]).optional(),
  due_date: z.string().optional().or(z.literal("")),
});

const manageRoles = ["admin","socio","gerente"];

export async function createTaskAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Nao autenticado" };

  const parsed = taskSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { data: member } = await supabase.from("organization_members").select("org_id, role").eq("user_id", user.id).single();
  if (!member) return { error: "Sem organizacao" };

  const isManager = manageRoles.includes(member.role);

  const { error } = await supabase.from("tasks").insert({
    org_id: member.org_id,
    column_id: parsed.data.column_id,
    project_id: parsed.data.project_id,
    title: parsed.data.title,
    description: parsed.data.description || null,
    priority: parsed.data.priority || "media",
    due_date: parsed.data.due_date || null,
    position: 0,
    created_by: isManager ? (formData.get("assignee") as string || user.id) : user.id,
  });
  if (error) return { error: error.message };
  revalidatePath("/app/tarefas");
  return { success: true };
}

export async function updateTaskAction(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Nao autenticado" };

  const parsed = taskSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { data: member } = await supabase.from("organization_members").select("org_id, role").eq("user_id", user.id).single();
  if (!member) return { error: "Sem organizacao" };

  const { error } = await supabase.from("tasks").update({
    column_id: parsed.data.column_id,
    project_id: parsed.data.project_id,
    title: parsed.data.title,
    description: parsed.data.description || null,
    priority: parsed.data.priority || "media",
    due_date: parsed.data.due_date || null,
    updated_at: new Date().toISOString(),
  }).eq("id", id).eq("org_id", member.org_id);
  if (error) return { error: error.message };
  revalidatePath("/app/tarefas");
  return { success: true };
}

export async function moveTaskAction(id: string, columnId: string, position: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Nao autenticado" };

  const { data: member } = await supabase.from("organization_members").select("org_id, role").eq("user_id", user.id).single();
  if (!member) return { error: "Sem organizacao" };

  const { error } = await supabase.from("tasks").update({
    column_id: columnId,
    position,
    updated_at: new Date().toISOString(),
  }).eq("id", id).eq("org_id", member.org_id);
  if (error) return { error: error.message };
  revalidatePath("/app/tarefas");
  return { success: true };
}

const DEFAULT_COLUMNS = [
  { name: "Backlog", position: 0, color: "#6b7280" },
  { name: "A Fazer", position: 1, color: "#3b82f6" },
  { name: "Em Andamento", position: 2, color: "#f59e0b" },
  { name: "Revisão", position: 3, color: "#8b5cf6" },
  { name: "Concluído", position: 4, color: "#10b981" },
];

export async function createDefaultBoardAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const { data: member } = await supabase.from("organization_members").select("org_id, role").eq("user_id", user.id).single();
  if (!member || !["admin", "socio", "gerente"].includes(member.role)) return { error: "Sem permissão" };

  // Check if board already exists
  const { data: existing } = await supabase.from("task_boards").select("id").eq("org_id", member.org_id).limit(1);
  if (existing && existing.length > 0) return { error: "Já existe um quadro Kanban" };

  // Create board
  const { data: board, error: boardError } = await supabase.from("task_boards").insert({
    org_id: member.org_id,
    name: "Quadro Principal",
  }).select("id").single();

  if (boardError || !board) return { error: boardError?.message ?? "Erro ao criar quadro" };

  // Create default columns
  const { error: colError } = await supabase.from("task_columns").insert(
    DEFAULT_COLUMNS.map((c) => ({
      board_id: board.id,
      org_id: member.org_id,
      name: c.name,
      position: c.position,
      color: c.color,
    }))
  );

  if (colError) return { error: colError.message };
  revalidatePath("/app/tarefas");
  return { success: true };
}

export async function deleteTaskAction(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Nao autenticado" };

  const { data: member } = await supabase.from("organization_members").select("org_id, role").eq("user_id", user.id).single();
  if (!member || !["admin","socio"].includes(member.role)) return { error: "Sem permissao" };

  const { error } = await supabase.from("tasks").delete().eq("id", id).eq("org_id", member.org_id);
  if (error) return { error: error.message };
  revalidatePath("/app/tarefas");
  return { success: true };
}
