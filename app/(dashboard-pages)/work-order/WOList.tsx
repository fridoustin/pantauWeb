"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import WorkOrderCard from "@/components/ui/WorkOrderCard";
import WorkOrderDetailModal from "@/components/ui/WorkOrderDetailModal";
import { useRouter } from "next/navigation";


function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted;
}

export default function WorkOrderList({ initialOrders }: { initialOrders: any[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Status");
  const [date, setDate] = useState<Date>(new Date());
  const [now, setNow] = useState(new Date());
  const router = useRouter();
  const hasMounted = useHasMounted();

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const handleViewDetail = (data: any) => {
    setSelectedOrder(data);
    setShowModal(true);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredOrders = initialOrders.filter((wo) => {
    const matchesTitle = wo.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === "All Status" || wo.status === status;
    return matchesTitle && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background flex items-start justify-center px-4 py-10">
      <div className="relative top-[-40px] h-full w-full">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">Work Orders</h2>

        {/* realtime calendar */}
        {hasMounted && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {now.toLocaleString("id-ID")}
          </p>
        )}

        {/* Filter bar */}
        <div className="flex flex-row gap-4 items-center mb-6">
          <Input
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-64"
          />
          <select
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-4 py-2 text-sm text-gray-700 dark:text-white"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option>All Status</option>
            <option>Finish</option>
            <option>Procces</option>
            <option>Waiting</option>
          </select>

          {/* posisi button */}
          <div className="justify-end w-full flex gap-8">
            <Button variant="outline" className="text-sm" onClick={() => router.push("/work-order/add")}>
              Add Work Order
            </Button>
            <Button variant="outline" className="text-sm" onClick={() => router.push("/work-order/history")}>
              History
            </Button>
          </div>
        </div>

        {/* Daftar work order */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredOrders.map((wo) => (
            <WorkOrderCard key={wo.id} data={wo} onViewDetail={handleViewDetail} />
          ))}
        </div>

        {/* Modal Detail */}
        <WorkOrderDetailModal
          open={showModal}
          onClose={() => setShowModal(false)}
          workOrder={selectedOrder}
        />
      </div>
    </div>
  );
}
