import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Rotas acessíveis sem autenticação
const PUBLIC_PATHS = [
  "/login",
  "/criar-conta",
  "/esqueceu-senha",
  "/redefinir-senha",
  "/aguardando-aprovacao",
  "/auth/callback",
  "/auth/signout",
];

// Rotas públicas que usuário autenticado e aprovado não deve ver (redireciona pro app)
const AUTH_REDIRECT_PATHS = ["/login", "/criar-conta", "/esqueceu-senha", "/redefinir-senha"];

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

  // Refresca a sessão (crítico para Supabase SSR)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  // Não autenticado tentando acessar rota protegida → login
  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Autenticado tentando acessar login/criar-conta etc. → app
  if (user && AUTH_REDIRECT_PATHS.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/app/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
