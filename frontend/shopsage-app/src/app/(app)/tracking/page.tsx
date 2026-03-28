"use client";

import { useRouter } from "next/navigation";
import { TrackingList } from "@/components/tracking/tracking-list";
import { useTracking } from "@/hooks/use-tracking";

export default function TrackingPage() {
  const { trackedItems, removeItem } = useTracking();
  const router = useRouter();

  const handleSearch = (title: string) => {
    sessionStorage.setItem("shopsage:pending-search", title);
    router.push("/search");
  };

  return (
    <main className="hide-scrollbar flex-1 overflow-y-auto px-4 pb-[100px] pt-[120px]">
      <div className="mx-auto w-full max-w-md">
        <TrackingList items={trackedItems} onRemove={removeItem} onSearch={handleSearch} />
      </div>
    </main>
  );
}
