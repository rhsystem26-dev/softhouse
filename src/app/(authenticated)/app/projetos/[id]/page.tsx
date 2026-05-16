import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ProjetoDetailView } from "@/components/projetos/projeto-detail-view";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProjetoDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();
  if (!project) notFound();

  const { data: client } = project.client_id
    ? await supabase
        .from("clients")
        .select("id, name")
        .eq("id", project.client_id)
        .single()
    : { data: null };

  const { data: members } = await supabase
    .from("project_members")
    .select("id, user_id, role, assigned_at")
    .eq("project_id", id);

  const [{ data: timeEntries }, { data: deliveries }] = await Promise.all([
    supabase.from("time_entries").select("*").eq("project_id", id).order("date", { ascending: false }),
    supabase.from("deliveries").select("*").eq("project_id", id).order("due_date", { ascending: true, nullsFirst: false }),
  ]);

  return (
    <ProjetoDetailView
      project={project}
      client={client}
      members={members ?? []}
      timeEntries={timeEntries ?? []}
      deliveries={deliveries ?? []}
    />
  );
}
