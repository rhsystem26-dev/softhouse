"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Profile, UserRole } from "@/types/database";

interface AppUser {
  user: User;
  profile: Profile | null;
  role: UserRole | null;
  orgId: string | null;
}

export function useUser() {
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchUser = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setAppUser(null);
      setLoading(false);
      return;
    }

    const [{ data: profile }, { data: member }] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user.id).single(),
      supabase.from("organization_members").select("*").eq("user_id", user.id).single(),
    ]);

    setAppUser({
      user,
      profile,
      role: member?.role ?? null,
      orgId: member?.org_id ?? null,
    });
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchUser();
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      fetchUser();
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchUser, supabase]);

  return { appUser, loading };
}
