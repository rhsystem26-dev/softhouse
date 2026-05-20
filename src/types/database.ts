export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      organization_members: {
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          role: "admin" | "socio" | "financeiro" | "gerente" | "dev";
          joined_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          user_id: string;
          role: "admin" | "socio" | "financeiro" | "gerente" | "dev";
          joined_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          user_id?: string;
          role?: "admin" | "socio" | "financeiro" | "gerente" | "dev";
          joined_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          org_id: string;
          actor_id: string;
          action: string;
          table_name: string;
          record_id: string;
          old_data: Json | null;
          new_data: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          actor_id: string;
          action: string;
          table_name: string;
          record_id: string;
          old_data?: Json | null;
          new_data?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          actor_id?: string;
          action?: string;
          table_name?: string;
          record_id?: string;
          old_data?: Json | null;
          new_data?: Json | null;
          created_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          contact_name: string | null;
          contact_email: string | null;
          notes: string | null;
          email: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          contact_name?: string | null;
          contact_email?: string | null;
          notes?: string | null;
          email?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          contact_name?: string | null;
          contact_email?: string | null;
          notes?: string | null;
          email?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          org_id: string;
          client_id: string | null;
          name: string;
          description: string | null;
          status: "active" | "completed" | "on_hold" | "cancelled";
          start_date: string | null;
          end_date: string | null;
          budget: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          client_id?: string | null;
          name: string;
          description?: string | null;
          status?: "active" | "completed" | "on_hold" | "cancelled";
          start_date?: string | null;
          end_date?: string | null;
          budget?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          client_id?: string | null;
          name?: string;
          description?: string | null;
          status?: "active" | "completed" | "on_hold" | "cancelled";
          start_date?: string | null;
          end_date?: string | null;
          budget?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      revenues: {
        Row: {
          id: string;
          project_id: string;
          org_id: string;
          amount: number;
          description: string | null;
          date: string;
          type: "servico" | "consultoria" | "produto" | "retainer" | "outro";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          org_id: string;
          amount: number;
          description?: string | null;
          date?: string;
          type?: "servico" | "consultoria" | "produto" | "retainer" | "outro";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          org_id?: string;
          amount?: number;
          description?: string | null;
          date?: string;
          type?: "servico" | "consultoria" | "produto" | "retainer" | "outro";
          created_at?: string;
          updated_at?: string;
        };
      };
      costs: {
        Row: {
          id: string;
          project_id: string;
          org_id: string;
          amount: number;
          description: string | null;
          date: string;
          category: "ia" | "infra" | "pessoal" | "outros";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          org_id: string;
          amount: number;
          description?: string | null;
          date?: string;
          category?: "ia" | "infra" | "pessoal" | "outros";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          org_id?: string;
          amount?: number;
          description?: string | null;
          date?: string;
          category?: "ia" | "infra" | "pessoal" | "outros";
          created_at?: string;
          updated_at?: string;
        };
      };
      project_members: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          role: "gerente" | "dev";
          assigned_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          role?: "gerente" | "dev";
          assigned_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          role?: "gerente" | "dev";
          assigned_at?: string;
        };
      };
      ai_providers: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
      ai_models: {
        Row: {
          id: string;
          provider_id: string;
          name: string;
          input_cost_per_1m: number;
          output_cost_per_1m: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          name: string;
          input_cost_per_1m?: number;
          output_cost_per_1m?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          name?: string;
          input_cost_per_1m?: number;
          output_cost_per_1m?: number;
          created_at?: string;
        };
      };
      ai_usage: {
        Row: {
          id: string;
          project_id: string;
          org_id: string;
          user_id: string;
          model_id: string;
          tokens_in: number;
          tokens_out: number;
          cost: number;
          latency_ms: number | null;
          quality_score: number | null;
          time_saved_hours: number | null;
          result: "accepted" | "rejected" | "modified" | null;
          delivery_id: string | null;
          rework: boolean;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          org_id: string;
          user_id: string;
          model_id: string;
          tokens_in?: number;
          tokens_out?: number;
          cost?: number;
          latency_ms?: number | null;
          quality_score?: number | null;
          time_saved_hours?: number | null;
          result?: "accepted" | "rejected" | "modified" | null;
          delivery_id?: string | null;
          rework?: boolean;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          org_id?: string;
          user_id?: string;
          model_id?: string;
          tokens_in?: number;
          tokens_out?: number;
          cost?: number;
          latency_ms?: number | null;
          quality_score?: number | null;
          time_saved_hours?: number | null;
          result?: "accepted" | "rejected" | "modified" | null;
          delivery_id?: string | null;
          rework?: boolean;
          notes?: string | null;
          created_at?: string;
        };
      };
      time_entries: {
        Row: {
          id: string;
          project_id: string;
          org_id: string;
          user_id: string;
          hours: number;
          description: string | null;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          org_id: string;
          user_id: string;
          hours: number;
          description?: string | null;
          date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          org_id?: string;
          user_id?: string;
          hours?: number;
          description?: string | null;
          date?: string;
          created_at?: string;
        };
      };
      deliveries: {
        Row: {
          id: string;
          project_id: string;
          org_id: string;
          title: string;
          description: string | null;
          status: "backlog" | "in_progress" | "review" | "done" | "blocked";
          due_date: string | null;
          completed_at: string | null;
          assignee_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          org_id: string;
          title: string;
          description?: string | null;
          status?: "backlog" | "in_progress" | "review" | "done" | "blocked";
          due_date?: string | null;
          completed_at?: string | null;
          assignee_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          org_id?: string;
          title?: string;
          description?: string | null;
          status?: "backlog" | "in_progress" | "review" | "done" | "blocked";
          due_date?: string | null;
          completed_at?: string | null;
          assignee_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      infra_resources: {
        Row: {
          id: string;
          project_id: string;
          org_id: string;
          name: string;
          type: "server" | "database" | "storage" | "cdn" | "function" | "queue" | "other";
          provider: string | null;
          cost_monthly: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          org_id: string;
          name: string;
          type?: "server" | "database" | "storage" | "cdn" | "function" | "queue" | "other";
          provider?: string | null;
          cost_monthly?: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          org_id?: string;
          name?: string;
          type?: "server" | "database" | "storage" | "cdn" | "function" | "queue" | "other";
          provider?: string | null;
          cost_monthly?: number;
          notes?: string | null;
          created_at?: string;
        };
      };
      task_boards: {
        Row: { id: string; project_id: string; org_id: string; name: string; created_at: string };
        Insert: { id?: string; project_id: string; org_id: string; name: string; created_at?: string };
        Update: { id?: string; project_id?: string; org_id?: string; name?: string; created_at?: string };
      };
      task_columns: {
        Row: { id: string; board_id: string; org_id: string; name: string; position: number; color: string; created_at: string };
        Insert: { id?: string; board_id: string; org_id: string; name: string; position?: number; color?: string; created_at?: string };
        Update: { id?: string; board_id?: string; org_id?: string; name?: string; position?: number; color?: string; created_at?: string };
      };
      tasks: {
        Row: { id: string; column_id: string; org_id: string; project_id: string; title: string; description: string | null; priority: "baixa" | "media" | "alta" | "critica"; due_date: string | null; position: number; created_by: string; created_at: string; updated_at: string };
        Insert: { id?: string; column_id: string; org_id: string; project_id: string; title: string; description?: string | null; priority?: "baixa" | "media" | "alta" | "critica"; due_date?: string | null; position?: number; created_by: string; created_at?: string; updated_at?: string };
        Update: { id?: string; column_id?: string; org_id?: string; project_id?: string; title?: string; description?: string | null; priority?: "baixa" | "media" | "alta" | "critica"; due_date?: string | null; position?: number; created_by?: string; created_at?: string; updated_at?: string };
      };
      task_assignments: {
        Row: { id: string; task_id: string; user_id: string; assigned_at: string };
        Insert: { id?: string; task_id: string; user_id: string; assigned_at?: string };
        Update: { id?: string; task_id?: string; user_id?: string; assigned_at?: string };
      };
      task_comments: {
        Row: { id: string; task_id: string; user_id: string; content: string; created_at: string };
        Insert: { id?: string; task_id: string; user_id: string; content: string; created_at?: string };
        Update: { id?: string; task_id?: string; user_id?: string; content?: string; created_at?: string };
      };
      task_activity_logs: {
        Row: { id: string; task_id: string; user_id: string | null; action: string; details: Record<string, unknown> | null; created_at: string };
        Insert: { id?: string; task_id: string; user_id?: string | null; action: string; details?: Record<string, unknown> | null; created_at?: string };
        Update: { id?: string; task_id?: string; user_id?: string | null; action?: string; details?: Record<string, unknown> | null; created_at?: string };
      };
      task_ai_suggestions: {
        Row: { id: string; task_id: string | null; org_id: string; type: "move_card" | "create_task" | "add_comment" | "change_priority" | "assign_user"; payload: Record<string, unknown>; status: "pending" | "approved" | "rejected" | "executed"; created_by_ia: string | null; reason: string | null; created_at: string; resolved_at: string | null };
        Insert: { id?: string; task_id?: string | null; org_id: string; type: "move_card" | "create_task" | "add_comment" | "change_priority" | "assign_user"; payload?: Record<string, unknown>; status?: "pending" | "approved" | "rejected" | "executed"; created_by_ia?: string | null; reason?: string | null; created_at?: string; resolved_at?: string | null };
        Update: { id?: string; task_id?: string | null; org_id?: string; type?: "move_card" | "create_task" | "add_comment" | "change_priority" | "assign_user"; payload?: Record<string, unknown>; status?: "pending" | "approved" | "rejected" | "executed"; created_by_ia?: string | null; reason?: string | null; created_at?: string; resolved_at?: string | null };
      };
      notification_templates: {
        Row: { id: string; org_id: string; name: string; type: "task_delayed"|"delivery_due"|"project_stale"|"budget_alert"|"ia_cost_alert"|"custom"; title_template: string; body_template: string|null; enabled: boolean; created_at: string };
        Insert: { id?: string; org_id: string; name: string; type: "task_delayed"|"delivery_due"|"project_stale"|"budget_alert"|"ia_cost_alert"|"custom"; title_template: string; body_template?: string|null; enabled?: boolean; created_at?: string };
        Update: { id?: string; org_id?: string; name?: string; type?: "task_delayed"|"delivery_due"|"project_stale"|"budget_alert"|"ia_cost_alert"|"custom"; title_template?: string; body_template?: string|null; enabled?: boolean; created_at?: string };
      };
      notification_logs: {
        Row: { id: string; org_id: string; user_id: string; template_id: string|null; title: string; body: string|null; read: boolean; read_at: string|null; metadata: Record<string,unknown>|null; created_at: string };
        Insert: { id?: string; org_id: string; user_id: string; template_id?: string|null; title: string; body?: string|null; read?: boolean; read_at?: string|null; metadata?: Record<string,unknown>|null; created_at?: string };
        Update: { id?: string; org_id?: string; user_id?: string; template_id?: string|null; title?: string; body?: string|null; read?: boolean; read_at?: string|null; metadata?: Record<string,unknown>|null; created_at?: string };
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_dashboard_metrics: {
        Args: { p_org_id: string };
        Returns: {
          projects_active: number;
          projects_completed: number;
          projects_on_hold: number;
          projects_total: number;
          total_budget_active: number;
          org_members: number;
        };
      };
      get_projects_budget_summary: {
        Args: { p_org_id: string };
        Returns: {
          id: string;
          name: string;
          status: string;
          budget: number | null;
          start_date: string | null;
          end_date: string | null;
          member_count: number;
        }[];
      };
    };
    Enums: {
      user_role: "admin" | "socio" | "financeiro" | "gerente" | "dev";
      project_status: "active" | "completed" | "on_hold" | "cancelled";
      project_member_role: "gerente" | "dev";
      revenue_type: "servico" | "consultoria" | "produto" | "retainer" | "outro";
      cost_category: "ia" | "infra" | "pessoal" | "outros";
      ai_usage_result: "accepted" | "rejected" | "modified";
      delivery_status: "backlog" | "in_progress" | "review" | "done" | "blocked";
      infra_resource_type: "server" | "database" | "storage" | "cdn" | "function" | "queue" | "other";
      task_priority: "baixa" | "media" | "alta" | "critica";
      task_suggestion_type: "move_card" | "create_task" | "add_comment" | "change_priority" | "assign_user";
      task_suggestion_status: "pending" | "approved" | "rejected" | "executed";
      notification_type: "task_delayed" | "delivery_due" | "project_stale" | "budget_alert" | "ia_cost_alert" | "custom";
    };
  };
}

export type Organization = Database["public"]["Tables"]["organizations"]["Row"];
export type OrganizationMember = Database["public"]["Tables"]["organization_members"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type AuditLog = Database["public"]["Tables"]["audit_logs"]["Row"];
export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectMember = Database["public"]["Tables"]["project_members"]["Row"];
export type AiProvider = Database["public"]["Tables"]["ai_providers"]["Row"];
export type AiModel = Database["public"]["Tables"]["ai_models"]["Row"];
export type AiUsage = Database["public"]["Tables"]["ai_usage"]["Row"];
export type AiUsageResult = Database["public"]["Enums"]["ai_usage_result"];
export type UserRole = Database["public"]["Enums"]["user_role"];
export type ProjectStatus = Database["public"]["Enums"]["project_status"];
export type ProjectMemberRole = Database["public"]["Enums"]["project_member_role"];
export type DashboardMetrics = Database["public"]["Functions"]["get_dashboard_metrics"]["Returns"];
export type ProjectBudgetSummary = Database["public"]["Functions"]["get_projects_budget_summary"]["Returns"][number];
export type Revenue = Database["public"]["Tables"]["revenues"]["Row"];
export type Cost = Database["public"]["Tables"]["costs"]["Row"];
export type RevenueType = Database["public"]["Enums"]["revenue_type"];
export type CostCategory = Database["public"]["Enums"]["cost_category"];
export type TimeEntry = Database["public"]["Tables"]["time_entries"]["Row"];
export type Delivery = Database["public"]["Tables"]["deliveries"]["Row"];
export type DeliveryStatus = Database["public"]["Enums"]["delivery_status"];
export type InfraResourceType = Database["public"]["Enums"]["infra_resource_type"];
export type InfraResource = Database["public"]["Tables"]["infra_resources"]["Row"];
export type TaskPriority = Database["public"]["Enums"]["task_priority"];
export type TaskSuggestionType = Database["public"]["Enums"]["task_suggestion_type"];
export type TaskSuggestionStatus = Database["public"]["Enums"]["task_suggestion_status"];
export type TaskBoard = Database["public"]["Tables"]["task_boards"]["Row"];
export type TaskColumn = Database["public"]["Tables"]["task_columns"]["Row"];
export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type TaskAssignment = Database["public"]["Tables"]["task_assignments"]["Row"];
export type TaskComment = Database["public"]["Tables"]["task_comments"]["Row"];
export type TaskActivityLog = Database["public"]["Tables"]["task_activity_logs"]["Row"];
export type TaskAISuggestion = Database["public"]["Tables"]["task_ai_suggestions"]["Row"];
export type NotificationType = Database["public"]["Enums"]["notification_type"];
export type NotificationTemplate = Database["public"]["Tables"]["notification_templates"]["Row"];
export type NotificationLog = Database["public"]["Tables"]["notification_logs"]["Row"];
