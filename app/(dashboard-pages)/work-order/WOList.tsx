"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import WorkOrderCard from "@/components/ui/WorkOrderCard";
import { useRouter } from "next/navigation";

// Custom hook untuk mengecek apakah komponen sudah ter-mount
function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted;
}

export default function WorkOrderList({ initialOrders }: { initialOrders: any[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Semua Status");
  const [now, setNow] = useState(new Date());
  const router = useRouter();
  const hasMounted = useHasMounted();

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredOrders = initialOrders.filter((wo) => {
    const matchesTitle = wo.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === "Semua Status" || wo.status === status;
    return matchesTitle && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background flex items-start justify-center px-4 py-10">
      <div className="relative top-[-40px] left-[125px] max-w-7xl w-full">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">Work Orders</h2>
  
        {hasMounted && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {now.toLocaleString("id-ID")}
          </p>
        )}
  
        <div className="flex flex-wrap gap-4 items-center mb-6">
          <Input
            placeholder="Cari berdasarkan judul..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-64"
          />
          <select
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-4 py-2 text-sm text-gray-700 dark:text-white"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option>Semua Status</option>
            <option>Menunggu</option>
            <option>Sedang Dikerjakan</option>
            <option>Selesai</option>
          </select>
          <Button variant="outline" className="text-sm" onClick={() => router.push("/work-order/add")}>
            Add Work Order
          </Button>
  
          <Button variant="outline" className="text-sm" onClick={() => router.push("/work-order/history")}>
            History
          </Button>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((wo) => (
            <WorkOrderCard key={wo.id} data={wo} />
          ))}
        </div>
      </div>
    </div>
  );
}  