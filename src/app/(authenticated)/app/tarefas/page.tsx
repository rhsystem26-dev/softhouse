import { createClient } from "@/lib/supabase/server";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { TaskCreateDialog } from "@/components/kanban/task-dialog";
import { TaskAISuggestions } from "@/components/kanban/task-ai-suggestions";
import { CreateBoardButton } from "@/components/kanban/create-board-button";
import { safeError } from "@/lib/server/safe-log";

export default async function TarefasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-muted-foreground">Sessão expirada. Faça login novamente.</p>
      </div>
    );
  }

  const { data: member } = await supabase.from("organization_members").select("org_id, role").eq("user_id", user.id).single();
  const orgId = member?.org_id;
  const canManage = member?.role && ["admin","socio","gerente"].includes(member.role);

  if (!orgId) {
    return <div className="flex items-center justify-center py-16"><p className="text-muted-foreground">Nenhuma organização vinculada.</p></div>;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let boards: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let columns: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let tasks: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let comments: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let projects: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let aiSuggestions: any[] = [];

  try {
    const results = await Promise.all([
      supabase.from("task_boards").select("*").eq("org_id", orgId).order("created_at"),
      supabase.from("task_columns").select("*").eq("org_id", orgId).order("position"),
      supabase.from("tasks").select("*").eq("org_id", orgId).order("position"),
      supabase.from("task_comments").select("*, tasks!inner(org_id)").eq("tasks.org_id", orgId).order("created_at", { ascending: false }).limit(100),
      supabase.from("projects").select("id, name").eq("org_id", orgId).order("name"),
      supabase.from("task_ai_suggestions").select("*").eq("org_id", orgId).eq("status", "pending").order("created_at", { ascending: false }).limit(20),
    ]);
    boards = results[0].data ?? [];
    columns = results[1].data ?? [];
    tasks = results[2].data ?? [];
    comments = results[3].data ?? [];
    projects = results[4].data ?? [];
    aiSuggestions = results[5].data ?? [];
  } catch (err) {
    safeError("Erro ao carregar tarefas", err);
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground mb-2">Erro ao carregar dados do Kanban.</p>
        <p className="text-sm text-muted-foreground">Tente recarregar a página.</p>
      </div>
    );
  }

  const board = boards[0];

  if (!board) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Tarefas</h1>
          <p className="text-sm text-slate-400 mt-1">Quadro Kanban</p>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-slate-400 mb-4">Nenhum quadro Kanban criado.</p>
          {canManage ? (
            <CreateBoardButton />
          ) : (
            <p className="text-sm text-muted-foreground">Solicite a um admin ou gerente para criar o primeiro quadro.</p>
          )}
        </div>
      </div>
    );
  }

  const boardColumns = columns.filter((c) => c.board_id === board.id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const taskComments = comments.map((c: any) => ({
    id: c.id, task_id: c.task_id, user_id: c.user_id, content: c.content, created_at: c.created_at,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">{board.name}</h1>
          <p className="text-sm text-slate-400 mt-1">Quadro Kanban</p>
        </div>
        {canManage && <TaskCreateDialog columns={boardColumns} projects={projects} />}
      </div>
      <KanbanBoard board={board} columns={boardColumns} tasks={tasks} comments={taskComments} />
      <div className="mt-6">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <TaskAISuggestions suggestions={aiSuggestions as any[]} />
      </div>
    </div>
  );
}
