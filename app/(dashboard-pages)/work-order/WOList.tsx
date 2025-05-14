"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import WorkOrderCard from "@/components/ui/WorkOrderCard";
import WorkOrderDetailModal from "@/components/ui/WorkOrderDetailModal";
import { AddWorkOrderDialog } from "@/components/ui/add-WorkOrder-dialog";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";


type WorkOrder = {
  id: string;
  title: string;
  status: string;
  description?: string;
  start_time: string;
  end_time: string;
  created_at: string;
  technician_id: string; 
  technician?: {         
    name: string;
  };
};

export default function WorkOrderList() {
  const supabase = createClient();
  const router = useRouter();
  
  // State management
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [now, setNow] = useState(new Date());
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from("workorder")
          .select("*, technician:technician_id (name)")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setOrders(data);
      } catch (err) {
        setError("Gagal memuat data work order");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Real-time updates
  useEffect(() => {
    const channel = supabase
      .channel("realtime-workorders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "workorder" },
        () => {
          supabase
            .from("workorder")
            .select("*, technician:technician_id (name)")
            .order("created_at", { ascending: false })
            .then(({ data, error }) => {
              if (!error && data) setOrders(data);
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Status mapping and filtering
  const statusMapping: { [key: string]: string } = {
    belum_mulai: "Waiting",
    dalam_pengerjaan: "Process",
    selesai: "Finish",
    terkendala: "Trouble"
  };

  const filteredOrders = orders
    .map((wo) => ({
      ...wo,
      status: statusMapping[wo.status] || wo.status,
    }))
    .filter((wo) => {
      const matchesTitle = wo.title.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All Status" || wo.status === statusFilter;
      return matchesTitle && matchesStatus;
    });

  // Handlers
  const handleViewDetail = (data: WorkOrder) => {
    setSelectedOrder(data);
    setShowDetailModal(true);
  };

  const handleAddWorkOrder = async (newOrder: WorkOrder) => {
    try {
      setOrders((prev) => [newOrder, ...prev]);
    } catch (err) {
      console.error("Insert error:", err);
      setOrders((prev) => prev.filter((order) => order.id !== newOrder.id));
    }
  };
  
  // Time updater
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Loading and error states
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Memuat data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p>{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="mt-4"
            variant="outline"
          >
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-start justify-center py-10">
      <div className="relative top-[-40px] h-full w-full">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
          Work Orders
        </h2>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          {now.toLocaleString("id-ID")}
        </p>

        {/* Filter controls */}
        <div className="flex flex-row gap-4 items-center mb-6">
          <Input
            placeholder="Cari berdasarkan judul..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-64 bg-white border-gray-300"
          />
          
          <select
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-4 py-2 text-sm text-gray-700 dark:text-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Status</option>
            <option>Finish</option>
            <option>Process</option>
            <option>Waiting</option>
            <option>Trouble</option>
          </select>

          <div className="justify-end w-full flex gap-8">
            <Button
              variant="outline"
              className="text-sm bg-[#0066ae] text-[#f1f5f8]"
              onClick={() => setShowAddModal(true)}
            >
              Tambah Work Order
            </Button>
            <Button
              variant="outline"
              className="text-sm bg-[#0066ae] text-[#f1f5f8]"
              onClick={() => router.push("/work-order/history")}
            >
              Riwayat
            </Button>
          </div>
        </div>

        {/* Work order list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredOrders.map((wo) => (
            <WorkOrderCard
              key={wo.id}
              data={wo}
              onViewDetail={handleViewDetail}
            />
          ))}
        </div>

        {/* Modals */}
        <WorkOrderDetailModal
          open={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          workOrder={selectedOrder}
        />

        <AddWorkOrderDialog
          open={showAddModal}
          onOpenChange={setShowAddModal}
          onAddWorkOrder={handleAddWorkOrder}
          now={now}
        />
      </div>
    </div>
  );
}