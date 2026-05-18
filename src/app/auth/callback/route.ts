import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
    }

    // Check approval status — redirect pending users away from app
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("approval_status")
        .eq("user_id", user.id)
        .single();

      if (profile?.approval_status === "pending") {
        return NextResponse.redirect(`${origin}/aguardando-aprovacao`);
      }
      if (profile?.approval_status === "rejected") {
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/login?error=acesso_negado`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/app/dashboard`);
}
