import "server-only";
import { createClient } from "@/lib/supabase/server";

export const MAX_MESSAGES_PER_MINUTE = 10;
const WINDOW_SECONDS = 60;

export interface RateLimitResult {
  allowed: boolean;
  currentCount: number;
  retryAfterSeconds: number;
}

export async function checkRateLimit(orgId: string): Promise<RateLimitResult> {
  const supabase = await createClient();
  const since = new Date(Date.now() - WINDOW_SECONDS * 1000).toISOString();

  const { count, error } = await supabase
    .from("evolution_message_logs")
    .select("id", { count: "exact", head: true })
    .eq("org_id", orgId)
    .in("status", ["pending", "sent", "failed"])
    .gte("created_at", since);

  if (error) {
    console.error("Rate limit check failed:", error.message);
    return { allowed: true, currentCount: 0, retryAfterSeconds: 0 };
  }

  const currentCount = count ?? 0;
  if (currentCount >= MAX_MESSAGES_PER_MINUTE) {
    const { data: oldest } = await supabase
      .from("evolution_message_logs")
      .select("created_at")
      .eq("org_id", orgId)
      .in("status", ["pending", "sent", "failed"])
      .gte("created_at", since)
      .order("created_at", { ascending: true })
      .limit(1);

    if (oldest && oldest.length > 0) {
      const oldestTime = new Date(oldest[0].created_at).getTime();
      const retryAfter = Math.ceil((oldestTime + WINDOW_SECONDS * 1000 - Date.now()) / 1000);
      return { allowed: false, currentCount, retryAfterSeconds: Math.max(1, retryAfter) };
    }
    return { allowed: false, currentCount, retryAfterSeconds: WINDOW_SECONDS };
  }

  return { allowed: true, currentCount, retryAfterSeconds: 0 };
}
