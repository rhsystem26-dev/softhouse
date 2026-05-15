# Fase 1 — Fundação — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold completo do sistema: Next.js App Router + Tailwind + shadcn/ui + Supabase SSR auth + layout base (sidebar/header) + migration inicial (organizations, organization_members, profiles, audit_logs) + RLS + seed + redirect `/`.

**Architecture:** App Router com grupo `(public)` para login e `(authenticated)` para rotas protegidas. Middleware global verifica sessão Supabase e redireciona. Layout autenticado compartilha sidebar + header. Supabase SSR para sessão no servidor com refresh automático.

**Tech Stack:** Next.js 15 App Router, Tailwind CSS v4, shadcn/ui, Supabase SSR (@supabase/ssr), Supabase CLI, TypeScript, Lucide React

**Out of scope para Fase 1:** CRUDs de negócio (clientes, projetos, receitas, custos, etc.), gráficos, dashboard com dados reais, páginas além de login e dashboard placeholder.

---

## Estrutura de Arquivos da Fase 1

```
softhouse-finance/
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── components.json                  # shadcn/ui config
├── .gitignore
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   │   └── 001_foundation.sql
│   └── seed.sql
└── src/
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx               # root — html/body wrapper
    │   ├── page.tsx                  # redirect handler
    │   ├── (public)/
    │   │   └── login/
    │   │       └── page.tsx
    │   ├── (authenticated)/
    │   │   └── app/
    │   │       ├── layout.tsx        # sidebar + header shell
    │   │       └── dashboard/
    │   │           └── page.tsx      # placeholder
    │   └── auth/
    │       ├── callback/
    │       │   └── route.ts
    │       └── signout/
    │           └── route.ts
    ├── components/
    │   ├── ui/                       # shadcn/ui (button, input, label, card, sheet, separator, skeleton, avatar, dropdown-menu)
    │   └── layout/
    │       ├── app-shell.tsx
    │       ├── sidebar.tsx
    │       ├── sidebar-group.tsx
    │       ├── sidebar-user-footer.tsx
    │       └── header.tsx
    ├── lib/
    │   ├── supabase/
    │   │   ├── server.ts
    │   │   ├── client.ts
    │   │   └── middleware.ts
    │   └── utils.ts
    ├── hooks/
    │   └── use-user.ts
    ├── types/
    │   └── database.ts
    └── middleware.ts
```

---

### Task 1: Scaffold do Projeto Next.js

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `components.json`, `src/app/globals.css`, `src/lib/utils.ts`
- Modify: `.gitignore` (already exists)

- [ ] **Step 1: Criar projeto Next.js via CLI**

```bash
cd c:/softhouse-finance
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
```

Expected: Scaffold completo sem erros. `package.json` criado com next, react, tailwind.

- [ ] **Step 2: Instalar dependências adicionais**

```bash
npm install @supabase/ssr @supabase/supabase-js lucide-react recharts @tanstack/react-table react-hook-form zod @hookform/resolvers
npm install -D supabase
```

- [ ] **Step 3: Inicializar shadcn/ui**

```bash
npx shadcn@latest init -d
```

Expected: `components.json` criado, `src/lib/utils.ts` gerado, CSS variables no `globals.css`.

- [ ] **Step 4: Adicionar componentes shadcn/ui usados na Fase 1**

```bash
npx shadcn@latest add button input label card sheet separator skeleton avatar dropdown-menu
```

Expected: Componentes em `src/components/ui/`.

- [ ] **Step 5: Configurar Tailwind para dark mode + font Inter**

Read `src/app/globals.css` and replace with:

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --font-sans: var(--font-inter);
  --font-mono: var(--font-jetbrains-mono);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
}

:root {
  --sidebar: hsl(222 47% 4%);
  --sidebar-foreground: hsl(210 40% 96%);
  --sidebar-primary: hsl(224 76% 48%);
  --sidebar-primary-foreground: hsl(0 0% 100%);
  --sidebar-accent: hsl(217 33% 17%);
  --sidebar-accent-foreground: hsl(210 40% 96%);
  --sidebar-border: hsl(217 33% 17%);
  --sidebar-ring: hsl(224 76% 48%);
}

.dark {
  --sidebar: hsl(222 47% 4%);
  --sidebar-foreground: hsl(210 40% 96%);
  --sidebar-primary: hsl(224 76% 48%);
  --sidebar-primary-foreground: hsl(0 0% 100%);
  --sidebar-accent: hsl(217 33% 17%);
  --sidebar-accent-foreground: hsl(210 40% 96%);
  --sidebar-border: hsl(217 33% 17%);
  --sidebar-ring: hsl(224 76% 48%);
}
```

- [ ] **Step 6: Adicionar fontes ao layout raiz**

Read `src/app/layout.tsx`. Replace with:

```tsx
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Softhouse",
  description: "Painel interno de gestão da softhouse",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-slate-950 text-slate-100 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 7: Verificar build**

```bash
npm run build
```

Expected: Build sem erros.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js + Tailwind + shadcn/ui + fonts"
```

---

### Task 2: Configurar Supabase CLI

**Files:**
- Create: `supabase/config.toml`
- Modify: `.gitignore`

- [ ] **Step 1: Inicializar Supabase local**

```bash
npx supabase init
```

Expected: `supabase/config.toml` criado.

- [ ] **Step 2: Editar supabase/config.toml**

Read `supabase/config.toml`. Update these keys:

```toml
project_id = "softhouse-finance"

[auth]
enabled = true
site_url = "http://localhost:3000"
additional_redirect_urls = ["http://localhost:3000/auth/callback"]

[auth.email]
enable_signup = false
double_confirm_changes = false

[db]
port = 54322

[api]
port = 54321
```

- [ ] **Step 3: Iniciar Supabase local**

```bash
npx supabase start
```

Expected: Supabase services iniciados. Anotar `API URL` e `anon key` do output.

- [ ] **Step 4: Criar .env.local**

```bash
echo "NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321" > .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY_DO_OUTPUT>" >> .env.local
```

- [ ] **Step 5: Commit**

```bash
git add supabase/config.toml .gitignore
git commit -m "feat: init Supabase CLI and local config"
```

---

### Task 3: Tipos do Banco de Dados

**Files:**
- Create: `src/types/database.ts`

- [ ] **Step 1: Criar arquivo de tipos**

Write `src/types/database.ts`:

```typescript
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
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          created_at?: string;
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
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          avatar_url?: string | null;
          created_at?: string;
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
    };
    Views: {};
    Functions: {};
    Enums: {
      user_role: "admin" | "socio" | "financeiro" | "gerente" | "dev";
    };
  };
}

export type Organization = Database["public"]["Tables"]["organizations"]["Row"];
export type OrganizationMember = Database["public"]["Tables"]["organization_members"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type AuditLog = Database["public"]["Tables"]["audit_logs"]["Row"];
export type UserRole = Database["public"]["Enums"]["user_role"];
```

- [ ] **Step 2: Commit**

```bash
git add src/types/database.ts
git commit -m "feat: add database types for foundation tables"
```

---

### Task 4: Migration 001 — Tabelas da Fundação + RLS + Funções

**Files:**
- Create: `supabase/migrations/001_foundation.sql`

- [ ] **Step 1: Escrever migration completa**

Write `supabase/migrations/001_foundation.sql`:

```sql
-- 001_foundation.sql
-- Tabelas base do sistema: organizations, organization_members, profiles, audit_logs
-- + RLS policies + helper functions

-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists "pgcrypto" with schema extensions;

-- ============================================================
-- ENUMS
-- ============================================================
do $$ begin
  create type user_role as enum ('admin', 'socio', 'financeiro', 'gerente', 'dev');
exception when duplicate_object then null;
end $$;

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Retorna o organization_id do usuário autenticado (primeira org onde é membro)
create or replace function auth_user_org_id()
returns uuid
language sql
security definer
stable
as $$
  select org_id
  from organization_members
  where user_id = auth.uid()
  limit 1;
$$;

-- Retorna o role do usuário autenticado na organização
create or replace function auth_user_role()
returns user_role
language sql
security definer
stable
as $$
  select role
  from organization_members
  where user_id = auth.uid()
  limit 1;
$$;

-- Verifica se o usuário pertence à organização
create or replace function is_member_of_org(org_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from organization_members
    where user_id = auth.uid()
    and org_id = is_member_of_org.org_id
  );
$$;

-- Verifica se o usuário tem um dos papéis especificados
create or replace function has_role(variadic allowed_roles user_role[])
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from organization_members
    where user_id = auth.uid()
    and role = any(allowed_roles)
  );
$$;

-- ============================================================
-- TABELAS
-- ============================================================

-- Organizations
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

alter table organizations enable row level security;

-- Todos os membros da org podem ver sua própria organização
create policy "Membros podem ver a própria organização"
  on organizations for select
  using (is_member_of_org(id));

-- Apenas admin pode criar/editar organização
create policy "Admin pode criar organizações"
  on organizations for insert
  with check (is_member_of_org(id) and has_role('admin'));

create policy "Admin pode editar organizações"
  on organizations for update
  using (is_member_of_org(id) and has_role('admin'));

-- Organization Members
create table organization_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role user_role not null default 'dev',
  joined_at timestamptz not null default now(),
  unique(org_id, user_id)
);

alter table organization_members enable row level security;

-- Membros podem ver outros membros da mesma org
create policy "Membros podem ver membros da mesma org"
  on organization_members for select
  using (is_member_of_org(org_id));

-- Admin e Sócio podem gerenciar membros
create policy "Admin e Socio podem inserir membros"
  on organization_members for insert
  with check (is_member_of_org(org_id) and has_role('admin', 'socio'));

create policy "Admin e Socio podem editar membros"
  on organization_members for update
  using (is_member_of_org(org_id) and has_role('admin', 'socio'));

create policy "Admin e Socio podem remover membros"
  on organization_members for delete
  using (is_member_of_org(org_id) and has_role('admin', 'socio'));

-- Profiles (espelha auth.users)
create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- Usuário pode ver o próprio perfil
create policy "Usuário pode ver o próprio perfil"
  on profiles for select
  using (user_id = auth.uid());

-- Admin e Sócio podem ver todos os perfis da org
-- (via organization_members com mesmo org_id)
create policy "Admin e Socio podem ver perfis da org"
  on profiles for select
  using (
    exists (
      select 1
      from organization_members om1
      join organization_members om2 on om1.org_id = om2.org_id
      where om1.user_id = auth.uid()
      and om1.role in ('admin', 'socio')
      and om2.user_id = profiles.user_id
    )
  );

-- Usuário pode editar o próprio perfil
create policy "Usuário pode editar o próprio perfil"
  on profiles for update
  using (user_id = auth.uid());

-- Trigger: criar profile automaticamente ao criar usuário
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (user_id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email));
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Audit Logs
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  actor_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  table_name text not null,
  record_id text not null,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

alter table audit_logs enable row level security;

-- Admin e Sócio podem ver audit logs da org
create policy "Admin e Socio podem ver audit logs"
  on audit_logs for select
  using (is_member_of_org(org_id) and has_role('admin', 'socio'));

-- Trigger function para audit log
create or replace function audit_trigger()
returns trigger
language plpgsql
security definer
as $$
declare
  _org_id uuid;
  _action text;
begin
  _action := TG_ARGV[0];

  -- Tenta encontrar org_id no registro
  if TG_OP = 'DELETE' then
    _org_id := old.org_id;
  else
    _org_id := new.org_id;
  end if;

  if _org_id is null and TG_OP != 'DELETE' then
    -- tenta via project_id -> org_id se existir
    if new ? 'project_id' then
      select p.org_id into _org_id from projects p where p.id = (new->>'project_id')::uuid;
    end if;
  end if;

  if _org_id is not null then
    insert into audit_logs (org_id, actor_id, action, table_name, record_id, old_data, new_data)
    values (
      _org_id,
      auth.uid(),
      _action,
      TG_TABLE_NAME,
      coalesce(
        case when TG_OP = 'DELETE' then old.id::text else new.id::text end,
        'unknown'
      ),
      case when TG_OP = 'DELETE' or TG_OP = 'UPDATE' then to_jsonb(old) else null end,
      case when TG_OP = 'INSERT' or TG_OP = 'UPDATE' then to_jsonb(new) else null end
    );
  end if;

  return coalesce(new, old);
end;
$$;

-- Índices
create index idx_org_members_user on organization_members(user_id);
create index idx_org_members_org on organization_members(org_id);
create index idx_profiles_user on profiles(user_id);
create index idx_audit_logs_org on audit_logs(org_id);
create index idx_audit_logs_table on audit_logs(table_name, record_id);
create index idx_audit_logs_created on audit_logs(created_at desc);
```

- [ ] **Step 2: Aplicar migration**

```bash
npx supabase db push
```

Expected: "Applied migration 001_foundation.sql" sem erros.

- [ ] **Step 3: Verificar tabelas no Supabase Studio**

Abrir `http://localhost:54323` → Table Editor. Verificar que `organizations`, `organization_members`, `profiles`, `audit_logs` existem com RLS enabled.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/001_foundation.sql
git commit -m "feat: migration 001 — foundation tables + RLS + helper functions + audit trigger"
```

---

### Task 5: Supabase Clients (Server + Browser + Middleware)

**Files:**
- Create: `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`, `src/lib/supabase/middleware.ts`

- [ ] **Step 1: Server client**

Write `src/lib/supabase/server.ts`:

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Pode falhar em Server Components — middleware lida com refresh
          }
        },
      },
    }
  );
}
```

- [ ] **Step 2: Browser client**

Write `src/lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 3: Middleware client**

Write `src/lib/supabase/middleware.ts`:

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Usuário não autenticado → redireciona para /login
  if (!user && pathname !== "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Usuário autenticado tentando acessar /login → redireciona para /app/dashboard
  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/app/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/supabase/
git commit -m "feat: Supabase SSR clients (server, browser, middleware)"
```

---

### Task 6: Middleware Global (Auth Guard)

**Files:**
- Create: `src/middleware.ts`

- [ ] **Step 1: Criar middleware global**

Write `src/middleware.ts`:

```typescript
import { updateSession } from "@/lib/supabase/middleware";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Protege todas as rotas exceto recursos estáticos, _next, e favicon
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

- [ ] **Step 2: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: global auth middleware — redirect / → /login or /app/dashboard"
```

---

### Task 7: Root Redirect + Página Raiz

**Files:**
- Modify: `src/app/layout.tsx` — já criado no Task 1, confirmar conteúdo
- Create: `src/app/page.tsx`

- [ ] **Step 1: Verificar root layout**

Confirmar que `src/app/layout.tsx` tem o conteúdo do Task 1 Step 6 (fontes + html dark).

- [ ] **Step 2: Criar página raiz com redirect**

Write `src/app/page.tsx`:

```typescript
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/app/dashboard");
  } else {
    redirect("/login");
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: root page redirect — /login or /app/dashboard"
```

---

### Task 8: Página de Login

**Files:**
- Create: `src/app/(public)/login/page.tsx`

- [ ] **Step 1: Login page com email magic link + Google OAuth placeholder**

Write `src/app/(public)/login/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Command } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <Command className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="text-xl font-semibold text-slate-100">Softhouse</span>
        </div>

        <Card className="bg-slate-900 border-slate-800/60">
          <CardHeader>
            <CardTitle className="text-slate-100">Entrar</CardTitle>
            <CardDescription className="text-slate-400">
              {sent
                ? "Verifique seu email — enviamos um link de acesso."
                : "Digite seu email para receber um link de acesso."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!sent ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="voce@sua-softhouse.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-500"
                  />
                </div>
                {error && (
                  <p className="text-sm text-rose-400">{error}</p>
                )}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500"
                >
                  {loading ? "Enviando..." : "Enviar link de acesso"}
                </Button>
              </form>
            ) : (
              <div className="text-center">
                <p className="text-sm text-slate-400 mb-4">
                  Link enviado para <strong className="text-slate-200">{email}</strong>.
                  Verifique sua caixa de entrada.
                </p>
                <Button
                  variant="outline"
                  onClick={() => { setSent(false); setEmail(""); }}
                  className="border-slate-700 text-slate-300"
                >
                  Usar outro email
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(public\)/login/page.tsx
git commit -m "feat: login page with email magic link"
```

---

### Task 9: Auth Callback + Signout Routes

**Files:**
- Create: `src/app/auth/callback/route.ts`, `src/app/auth/signout/route.ts`

- [ ] **Step 1: Auth callback route**

Write `src/app/auth/callback/route.ts`:

```typescript
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
  }

  return NextResponse.redirect(`${origin}/app/dashboard`);
}
```

- [ ] **Step 2: Signout route**

Write `src/app/auth/signout/route.ts`:

```typescript
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"));
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/auth/
git commit -m "feat: auth callback and signout routes"
```

---

### Task 10: Hook useUser

**Files:**
- Create: `src/hooks/use-user.ts`

- [ ] **Step 1: Criar hook de usuário com profile e role**

Write `src/hooks/use-user.ts`:

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/use-user.ts
git commit -m "feat: useUser hook — auth state + profile + role"
```

---

### Task 11: Componentes de Layout (Sidebar, Header, AppShell)

**Files:**
- Create: `src/components/layout/sidebar-group.tsx`, `src/components/layout/sidebar-user-footer.tsx`, `src/components/layout/sidebar.tsx`, `src/components/layout/header.tsx`, `src/components/layout/app-shell.tsx`

- [ ] **Step 1: SidebarGroup component**

Write `src/components/layout/sidebar-group.tsx`:

```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: string[];
}

interface SidebarGroupProps {
  label: string;
  items: SidebarItem[];
  userRole: string | null;
}

export function SidebarGroup({ label, items, userRole }: SidebarGroupProps) {
  const pathname = usePathname();

  const visibleItems = items.filter(
    (item) => !item.roles || !userRole || item.roles.includes(userRole)
  );

  if (visibleItems.length === 0) return null;

  return (
    <div className="mb-4">
      <p className="px-3 mb-1 text-xs font-medium text-slate-500 uppercase tracking-wider">
        {label}
      </p>
      <nav className="flex flex-col gap-0.5">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-indigo-500/10 text-indigo-400 border-l-2 border-indigo-500 rounded-l-none"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border-l-2 border-transparent rounded-l-none"
              )}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
```

- [ ] **Step 2: SidebarUserFooter component**

Write `src/components/layout/sidebar-user-footer.tsx`:

```typescript
"use client";

import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarUserFooterProps {
  fullName: string;
  email: string;
  role: string | null;
}

const roleLabels: Record<string, string> = {
  admin: "Admin",
  socio: "Sócio",
  financeiro: "Financeiro",
  gerente: "Gerente",
  dev: "Desenvolvedor",
};

export function SidebarUserFooter({ fullName, email, role }: SidebarUserFooterProps) {
  const router = useRouter();
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleSignOut() {
    await fetch("/auth/signout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="border-t border-slate-800/60 p-3">
      <div className="flex items-center gap-3 mb-2">
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-indigo-500/20 text-indigo-400 text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-200 truncate">{fullName}</p>
          <p className="text-xs text-slate-500 truncate">{email}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className={cn(
          "text-xs px-2 py-0.5 rounded-full font-medium",
          role === "admin" || role === "socio"
            ? "bg-indigo-500/10 text-indigo-400"
            : "bg-slate-800 text-slate-400"
        )}>
          {role ? roleLabels[role] ?? role : "—"}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSignOut}
          className="h-7 w-7 text-slate-500 hover:text-slate-300"
        >
          <LogOut className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Sidebar component**

Write `src/components/layout/sidebar.tsx`:

```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Command } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { SidebarGroup, type SidebarItem } from "./sidebar-group";
import { SidebarUserFooter } from "./sidebar-user-footer";
import { useUser } from "@/hooks/use-user";
import { Skeleton } from "@/components/ui/skeleton";

// Todos os itens da sidebar com controle de role
const sidebarItems: { label: string; items: SidebarItem[] }[] = [
  {
    label: "Principal",
    items: [
      { label: "Dashboard", href: "/app/dashboard", icon: require("lucide").LayoutDashboard },
    ],
  },
  {
    label: "Projetos",
    items: [
      { label: "Projetos", href: "/app/projetos", icon: require("lucide").FolderKanban },
      { label: "Clientes", href: "/app/clientes", icon: require("lucide").Building2, roles: ["admin", "socio", "financeiro"] },
    ],
  },
  {
    label: "Financeiro",
    items: [
      { label: "Financeiro", href: "/app/financeiro", icon: require("lucide").DollarSign, roles: ["admin", "socio", "financeiro"] },
      { label: "Relatórios", href: "/app/financeiro/relatorios", icon: require("lucide").FileText, roles: ["admin", "socio", "financeiro"] },
    ],
  },
  {
    label: "Operação",
    items: [
      { label: "IAs e Tokens", href: "/app/ia", icon: require("lucide").Cpu, roles: ["admin", "socio", "gerente"] },
      { label: "Tempo", href: "/app/tempo", icon: require("lucide").Clock, roles: ["admin", "socio", "gerente"] },
      { label: "Entregas", href: "/app/entregas", icon: require("lucide").CheckSquare, roles: ["admin", "socio", "gerente"] },
      { label: "Infraestrutura", href: "/app/infraestrutura", icon: require("lucide").Server, roles: ["admin", "socio", "financeiro"] },
    ],
  },
  {
    label: "Sistema",
    items: [
      { label: "Usuários", href: "/app/admin/usuarios", icon: require("lucide").Users, roles: ["admin"] },
    ],
  },
];

// Resolve ícones estáticos (evita require dinâmico)
import {
  LayoutDashboard, FolderKanban, Building2, DollarSign, FileText,
  Cpu, Clock, CheckSquare, Server, Users,
} from "lucide-react";

const resolvedItems = sidebarItems.map((group) => ({
  ...group,
  items: group.items.map((item) => {
    const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
      LayoutDashboard, FolderKanban, Building2, DollarSign, FileText,
      Cpu, Clock, CheckSquare, Server, Users,
    };
    const iconName = item.label === "Dashboard" ? "LayoutDashboard"
      : item.label === "Projetos" ? "FolderKanban"
      : item.label === "Clientes" ? "Building2"
      : item.label === "Financeiro" ? "DollarSign"
      : item.label === "Relatórios" ? "FileText"
      : item.label === "IAs e Tokens" ? "Cpu"
      : item.label === "Tempo" ? "Clock"
      : item.label === "Entregas" ? "CheckSquare"
      : item.label === "Infraestrutura" ? "Server"
      : "Users";
    return { ...item, icon: iconMap[iconName] };
  }),
}));

export function Sidebar() {
  const { appUser, loading } = useUser();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-slate-950 border-r border-slate-800/60 flex flex-col hidden lg:flex">
      {/* Logo */}
      <div className="h-14 flex items-center gap-3 px-4 border-b border-slate-800/60 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
          <Command className="w-4 h-4 text-indigo-400" />
        </div>
        <Link href="/app/dashboard" className="font-semibold text-slate-100">
          Softhouse
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="space-y-4 p-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-16 bg-slate-800" />
                <Skeleton className="h-8 w-full bg-slate-800" />
                <Skeleton className="h-8 w-full bg-slate-800" />
              </div>
            ))}
          </div>
        ) : (
          resolvedItems.map((group) => (
            <SidebarGroup
              key={group.label}
              label={group.label}
              items={group.items}
              userRole={appUser?.role ?? null}
            />
          ))
        )}
      </nav>

      {/* User footer */}
      {loading ? (
        <div className="border-t border-slate-800/60 p-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-full bg-slate-800" />
            <div className="space-y-1">
              <Skeleton className="h-3 w-24 bg-slate-800" />
              <Skeleton className="h-2 w-16 bg-slate-800" />
            </div>
          </div>
        </div>
      ) : appUser ? (
        <SidebarUserFooter
          fullName={appUser.profile?.full_name ?? appUser.user.email ?? ""}
          email={appUser.user.email ?? ""}
          role={appUser.role}
        />
      ) : null}
    </aside>
  );
}

export function MobileSidebar() {
  const { appUser, loading } = useUser();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" className="w-64 p-0 bg-slate-950 border-r border-slate-800/60">
        {/* Mesmo conteúdo da sidebar desktop */}
        <div className="flex flex-col h-full">
          <div className="h-14 flex items-center gap-3 px-4 border-b border-slate-800/60 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <Command className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="font-semibold text-slate-100">Softhouse</span>
          </div>
          <nav className="flex-1 overflow-y-auto p-3">
            {resolvedItems.map((group) => (
              <SidebarGroup
                key={group.label}
                label={group.label}
                items={group.items}
                userRole={appUser?.role ?? null}
              />
            ))}
          </nav>
          {appUser && (
            <SidebarUserFooter
              fullName={appUser.profile?.full_name ?? appUser.user.email ?? ""}
              email={appUser.user.email ?? ""}
              role={appUser.role}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

> **Nota do revisor:** O código acima usa `require("lucide")` — isso não funciona em ESM. A correção está inline abaixo. Depois do Step 3, rodar o Step 3b.

- [ ] **Step 3b: Corrigir sidebar.tsx — remover require, usar imports estáticos**

O arquivo final correto de `src/components/layout/sidebar.tsx` deve usar imports estáticos para todos os ícones. Substituir o conteúdo por:

```typescript
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Command, LayoutDashboard, FolderKanban, Building2, DollarSign,
  FileText, Cpu, Clock, CheckSquare, Server, Users, Menu,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarGroup } from "./sidebar-group";
import { SidebarUserFooter } from "./sidebar-user-footer";
import { useUser } from "@/hooks/use-user";
import { Skeleton } from "@/components/ui/skeleton";
import type { SidebarItem } from "./sidebar-group";

const sidebarItems: { label: string; items: SidebarItem[] }[] = [
  {
    label: "Principal",
    items: [
      { label: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Projetos",
    items: [
      { label: "Projetos", href: "/app/projetos", icon: FolderKanban },
      { label: "Clientes", href: "/app/clientes", icon: Building2, roles: ["admin", "socio", "financeiro"] },
    ],
  },
  {
    label: "Financeiro",
    items: [
      { label: "Financeiro", href: "/app/financeiro", icon: DollarSign, roles: ["admin", "socio", "financeiro"] },
      { label: "Relatórios", href: "/app/financeiro/relatorios", icon: FileText, roles: ["admin", "socio", "financeiro"] },
    ],
  },
  {
    label: "Operação",
    items: [
      { label: "IAs e Tokens", href: "/app/ia", icon: Cpu, roles: ["admin", "socio", "gerente"] },
      { label: "Tempo", href: "/app/tempo", icon: Clock, roles: ["admin", "socio", "gerente"] },
      { label: "Entregas", href: "/app/entregas", icon: CheckSquare, roles: ["admin", "socio", "gerente"] },
      { label: "Infraestrutura", href: "/app/infraestrutura", icon: Server, roles: ["admin", "socio", "financeiro"] },
    ],
  },
  {
    label: "Sistema",
    items: [
      { label: "Usuários", href: "/app/admin/usuarios", icon: Users, roles: ["admin"] },
    ],
  },
];

export function Sidebar() {
  const { appUser, loading } = useUser();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-slate-950 border-r border-slate-800/60 flex-col hidden lg:flex">
      <div className="h-14 flex items-center gap-3 px-4 border-b border-slate-800/60 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
          <Command className="w-4 h-4 text-indigo-400" />
        </div>
        <Link href="/app/dashboard" className="font-semibold text-slate-100">
          Softhouse
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="space-y-4 p-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-16 bg-slate-800" />
                <Skeleton className="h-8 w-full bg-slate-800" />
                <Skeleton className="h-8 w-full bg-slate-800" />
              </div>
            ))}
          </div>
        ) : (
          sidebarItems.map((group) => (
            <SidebarGroup
              key={group.label}
              label={group.label}
              items={group.items}
              userRole={appUser?.role ?? null}
            />
          ))
        )}
      </nav>

      {loading ? (
        <div className="border-t border-slate-800/60 p-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-full bg-slate-800" />
            <div className="space-y-1">
              <Skeleton className="h-3 w-24 bg-slate-800" />
              <Skeleton className="h-2 w-16 bg-slate-800" />
            </div>
          </div>
        </div>
      ) : appUser ? (
        <SidebarUserFooter
          fullName={appUser.profile?.full_name ?? appUser.user.email ?? ""}
          email={appUser.user.email ?? ""}
          role={appUser.role}
        />
      ) : null}
    </aside>
  );
}

export function MobileSidebar() {
  const { appUser, loading } = useUser();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="lg:hidden p-2 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800">
          <Menu className="w-5 h-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 bg-slate-950 border-r border-slate-800/60">
        <div className="flex flex-col h-full">
          <div className="h-14 flex items-center gap-3 px-4 border-b border-slate-800/60 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <Command className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="font-semibold text-slate-100">Softhouse</span>
          </div>
          <nav className="flex-1 overflow-y-auto p-3">
            {sidebarItems.map((group) => (
              <SidebarGroup
                key={group.label}
                label={group.label}
                items={group.items}
                userRole={appUser?.role ?? null}
              />
            ))}
          </nav>
          {appUser && (
            <SidebarUserFooter
              fullName={appUser.profile?.full_name ?? appUser.user.email ?? ""}
              email={appUser.user.email ?? ""}
              role={appUser.role}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **Step 4: Header component**

Write `src/components/layout/header.tsx`:

```typescript
"use client";

import { usePathname } from "next/navigation";
import { MobileSidebar } from "./sidebar";

export function Header() {
  const pathname = usePathname();

  // Gera breadcrumbs simples a partir do path
  const segments = pathname
    .split("/")
    .filter(Boolean)
    .slice(1) // remove "app"
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1));

  return (
    <header className="h-14 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <MobileSidebar />
        <nav className="hidden sm:flex items-center gap-1.5 text-sm">
          {segments.length === 0 ? (
            <span className="text-slate-200 font-medium">Dashboard</span>
          ) : (
            segments.map((segment, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-slate-600">/</span>}
                <span className={i === segments.length - 1 ? "text-slate-200 font-medium" : "text-slate-500"}>
                  {segment.length > 30 ? segment.slice(0, 30) + "..." : segment}
                </span>
              </span>
            ))
          )}
        </nav>
      </div>
      <div className="flex items-center gap-2">
        {/* Placeholder para futuros: notification bell, command palette, etc. */}
      </div>
    </header>
  );
}
```

- [ ] **Step 5: AppShell component**

Write `src/components/layout/app-shell.tsx`:

```typescript
import { Sidebar } from "./sidebar";
import { Header } from "./header";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/
git commit -m "feat: sidebar, header, app-shell layout components"
```

---

### Task 12: Layout Autenticado + Dashboard Placeholder

**Files:**
- Create: `src/app/(authenticated)/app/layout.tsx`, `src/app/(authenticated)/app/dashboard/page.tsx`

- [ ] **Step 1: App layout (wrapper autenticado)**

Write `src/app/(authenticated)/app/layout.tsx`:

```typescript
import { AppShell } from "@/components/layout/app-shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
```

- [ ] **Step 2: Dashboard placeholder**

Write `src/app/(authenticated)/app/dashboard/page.tsx`:

```typescript
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, DollarSign, Percent, Cpu } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-100">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">
          Bem-vindo, {user?.email}
        </p>
      </div>

      {/* KPIs placeholder */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Receita (mês)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-100 font-mono">R$ 0</p>
            <p className="text-xs text-slate-500 mt-1">Dados disponíveis na Fase 3</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Custo (mês)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-100 font-mono">R$ 0</p>
            <p className="text-xs text-slate-500 mt-1">Dados disponíveis na Fase 3</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Percent className="w-4 h-4" />
              Margem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-100 font-mono">—%</p>
            <p className="text-xs text-slate-500 mt-1">Dados disponíveis na Fase 3</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              Tokens (mês)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-100 font-mono">0</p>
            <p className="text-xs text-slate-500 mt-1">Dados disponíveis na Fase 5</p>
          </CardContent>
        </Card>
      </div>

      {/* Estado vazio central */}
      <Card className="bg-slate-900 border-slate-800/60">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Building2 className="w-12 h-12 text-slate-600 mb-4" />
          <h2 className="text-lg font-medium text-slate-300 mb-2">
            Nenhum projeto cadastrado
          </h2>
          <p className="text-sm text-slate-500 text-center max-w-md">
            Os projetos, clientes e dados financeiros estarão disponíveis
            a partir da Fase 2. A fundação está pronta.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(authenticated\)/
git commit -m "feat: app layout (sidebar+header) + dashboard placeholder"
```

---

### Task 13: Seed Inicial

**Files:**
- Create: `supabase/seed.sql`

- [ ] **Step 1: Criar seed com 1 org + 1 admin**

Write `supabase/seed.sql`:

```sql
-- Seed inicial: 1 organização + 1 admin
-- O usuário admin precisa ser criado manualmente via Supabase Auth ou Dashboard.
-- Este seed insere apenas os dados da organização.

-- Inserir organização
insert into public.organizations (id, name, slug)
values (
  '00000000-0000-0000-0000-000000000001',
  'Softhouse',
  'softhouse'
)
on conflict (slug) do nothing;
```

- [ ] **Step 2: Instruções para criar usuário admin manual**

Após o seed, criar o primeiro usuário via Supabase Dashboard (http://localhost:54323):
1. Authentication → Add User → email + password
2. SQL Editor: inserir o member com role admin

```sql
insert into public.organization_members (org_id, user_id, role)
values (
  '00000000-0000-0000-0000-000000000001',
  '<USER_ID_DO_DASHBOARD>',
  'admin'
);
```

- [ ] **Step 3: Commit**

```bash
git add supabase/seed.sql
git commit -m "feat: seed — 1 organization + instructions for admin user"
```

---

### Task 14: Verificação Final

- [ ] **Step 1: Rodar build**

```bash
npm run build
```

Expected: Build sem erros TypeScript. Se houver erros, corrigir antes de prosseguir.

- [ ] **Step 2: Rodar dev server**

```bash
npm run dev
```

Expected: Servidor em `http://localhost:3000`.

- [ ] **Step 3: Testar redirect /**

Abrir `http://localhost:3000/` → redireciona para `/login`.

- [ ] **Step 4: Testar página de login**

Abrir `http://localhost:3000/login` → página de login renderiza com card e formulário de email.

- [ ] **Step 5: Testar proteção de rota autenticada**

Abrir `http://localhost:3000/app/dashboard` → redireciona para `/login`.

- [ ] **Step 6: Testar auth flow completo**

No Supabase Dashboard (http://localhost:54323):
1. Criar usuário com email
2. No SQL Editor, executar seed do organization_members
3. Confirmar email ou usar magic link para login
4. Após login → redireciona para `/app/dashboard`
5. Dashboard placeholder renderiza com sidebar + header

- [ ] **Step 7: Verificar RLS**

No Supabase SQL Editor:
```sql
-- Simular RLS para usuário sem membership
set role authenticated;
set request.jwt.claims = '{"sub": "<USER_ID>"}';
select * from organizations; -- Deve retornar vazio (sem membership)
```

- [ ] **Step 8: Verificar tabelas e indices**

Abrir Supabase Studio → Table Editor. Confirmar:
- `organizations` com RLS enabled
- `organization_members` com RLS enabled
- `profiles` com RLS enabled
- `audit_logs` com RLS enabled
- Todos os índices criados

- [ ] **Step 9: Commit final da fase**

```bash
git add -A
git commit -m "feat: Fase 1 completa — fundação com auth + layout + migrations + RLS"
```

---

## Critérios de Aceite da Fase 1

- [ ] Build sem erros (`npm run build`)
- [ ] `/` redireciona para `/login` (não autenticado)
- [ ] `/` redireciona para `/app/dashboard` (autenticado)
- [ ] `/login` renderiza formulário de email
- [ ] Login com magic link funciona (email → callback → dashboard)
- [ ] Logout funciona (redireciona para `/login`)
- [ ] Rota `/app/dashboard` protegida — redireciona para `/login` sem sessão
- [ ] Sidebar renderiza em desktop (w-64 fixa)
- [ ] Sidebar mobile abre via Sheet (hamburger menu)
- [ ] Header com breadcrumbs
- [ ] Sidebar mostra itens filtrados por role
- [ ] Sidebar footer mostra nome, email e role do usuário
- [ ] Migration 001 aplicada sem erros
- [ ] RLS ativo em todas as tabelas
- [ ] Profiles criado automaticamente ao criar usuário (trigger)
- [ ] Sem `USING (true)` em nenhuma policy
- [ ] Sem landing page — `/` nunca renderiza HTML estático
- [ ] Sem service_role no frontend

## Riscos Técnicos

| Risco | Mitigação |
|---|---|
| Supabase local não inicia (Docker) | Verificar Docker Desktop rodando antes de `supabase start` |
| Magic link não chega (Inbucket) | Supabase local usa Inbucket — acessar http://localhost:54324 para ver emails |
| Conflito de porta 3000/54321 | Configurar portas alternativas no `.env.local` e `config.toml` |
| Tailwind v4 breaking changes | Usar `@tailwindcss/vite` plugin no Next.js — `create-next-app` já configura |
| shadcn/ui init falha por conflito de versão | Rodar `npx shadcn@latest init` com flag `--force` se necessário |

## O Que Ficou Fora da Fase 1 (Intencionalmente)

- CRUD de projetos, clientes, receitas, custos (Fase 2+)
- Dashboard com dados reais e gráficos (Fase 3)
- Página de detalhe do projeto (Fase 2)
- Registro de uso de IA (Fase 5)
- Lançamento de horas e entregas (Fase 6)
- Páginas de financeiro, IA, tempo, entregas, infra, admin (Fases 2-7)
- Gráficos Recharts (Fase 3+)
- Tabelas TanStack (Fase 2+)
- Formulários React Hook Form + Zod (Fase 2+)
- Testes Playwright (configurados na Fase 1, cenários nas fases seguintes)
