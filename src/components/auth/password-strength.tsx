"use client";

function getStrength(password: string): { score: number; label: string; color: string; pct: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (password.length < 8) {
    return { score: 0, label: "Muito curta", color: "bg-slate-500", pct: "w-1/6" };
  }
  if (score <= 2) return { score: 1, label: "Fraca", color: "bg-rose-500", pct: "w-1/4" };
  if (score <= 3) return { score: 2, label: "Média", color: "bg-amber-500", pct: "w-2/4" };
  if (score <= 4) return { score: 3, label: "Forte", color: "bg-emerald-500", pct: "w-3/4" };
  return { score: 4, label: "Muito forte", color: "bg-emerald-400", pct: "w-full" };
}

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const { label, color, pct } = getStrength(password);

  return (
    <div className="space-y-1">
      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-300 ${color} ${pct}`} />
      </div>
      <p className={`text-xs ${color.replace("bg-", "text-")}`}>{label}</p>
    </div>
  );
}
