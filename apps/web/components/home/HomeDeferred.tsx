"use client";

import dynamic from "next/dynamic";

function HomeDataFallback() {
  return (
    <div className="space-y-8 px-6 py-6 lg:px-12" aria-hidden>
      <div className="mx-auto h-16 max-w-7xl animate-pulse rounded-2xl bg-white/40" />
      <div className="mx-auto h-40 max-w-7xl animate-pulse rounded-[1.5rem] bg-white/40" />
      <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-36 animate-pulse rounded-[1.5rem] bg-white/40" />
        ))}
      </div>
    </div>
  );
}

const HomeDataSections = dynamic(
  () => import("@/components/home/HomeDataSections").then((m) => m.HomeDataSections),
  { ssr: false, loading: () => <HomeDataFallback /> },
);

/** Client 岛：ssr:false 只能写在 Client Component 里，不能写在 app/page.tsx */
export function HomeDeferred() {
  return <HomeDataSections />;
}
