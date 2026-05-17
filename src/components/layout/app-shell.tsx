import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { Toaster } from "sonner";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="p-6 lg:p-8">{children}</main>
      </div>
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: "bg-slate-900 border border-slate-800 text-slate-100",
            description: "text-slate-400",
            actionButton: "bg-indigo-500 text-white",
            cancelButton: "bg-slate-800 text-slate-300",
            error: "border-rose-500/30 bg-rose-500/5",
            success: "border-emerald-500/30 bg-emerald-500/5",
          },
        }}
      />
    </div>
  );
}
