function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-gray-100 dark:bg-zinc-900 rounded ${className}`} />
}

export default function Loading() {
  return (
    <main className="max-w-[1440px] mx-auto px-5 sm:px-8 w-full flex flex-col gap-8 pt-6 sm:pt-8 opacity-60 animate-pulse">
      <Skeleton className="h-5 w-20 border border-dashed border-gray-200/60 dark:border-gray-800/60" />

      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <div className="flex gap-6">
          <Skeleton className="h-12 w-24" />
          <Skeleton className="h-12 w-20" />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        {/* Pull Requests Panel */}
        <section className="overflow-hidden rounded-xl border border-dashed border-gray-200 dark:border-gray-800/80 bg-white dark:bg-zinc-950">
          <div className="flex justify-between items-center px-5 pt-5 pb-3.5">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex gap-2 px-5 pb-4">
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-16 rounded-full" />
            <Skeleton className="h-8 w-16 rounded-full" />
          </div>
          <ul className="flex flex-col">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <li
                key={i}
                className="flex items-center gap-3.5 px-5 py-3.5 border-t border-dashed border-gray-200 dark:border-gray-800/80"
              >
                <Skeleton className="w-8 h-8 rounded-[10px] shrink-0 border border-gray-200/60 dark:border-gray-800/60" />
                <div className="flex-1 space-y-1.5 min-w-0">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Breakdown Panel */}
        <aside className="flex flex-col gap-6">
          <section className="rounded-xl border border-dashed border-gray-200 dark:border-gray-800/80 bg-white dark:bg-zinc-950 p-5 space-y-4">
            <Skeleton className="h-6 w-36" />
            <ul className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <li key={i} className="flex items-center gap-3">
                  <Skeleton className="h-6 w-28 rounded-full" />
                  <Skeleton className="h-2 flex-1 rounded-full" />
                  <Skeleton className="h-4 w-6 shrink-0" />
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </main>
  )
}
