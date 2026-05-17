import { Skeleton } from "@/components/ui/skeleton";

export default function ProjetoDetailLoading() {
  return (
    <div className="flex flex-col lg:flex-row gap-0 -m-6 lg:-m-8 min-h-[calc(100vh-3.5rem)]">
      <aside className="w-56 shrink-0 hidden lg:block p-3 space-y-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-9 rounded-md" />
        ))}
      </aside>
      <div className="flex-1 p-4 lg:p-8 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </div>
  );
}
