import WorkOrderList from "./WOList";

const workOrders = [
  { id: 1, title: "AC Rusak", status: "Menunggu" },
  { id: 2, title: "Lampu Mati", status: "Sedang Dikerjakan" },
  { id: 3, title: "Meja Pecah", status: "Selesai" },
  { id: 4, title: "Perlu Dibersihkan", status: "Menunggu" },
  { id: 5, title: "Kursi Rusak", status: "Sedang Dikerjakan" },
  { id: 6, title: "Pintu Macet", status: "Selesai" },
  { id: 7, title: "Ruangan Berdebu", status: "Sedang Dikerjakan" },
  { id: 8, title: "AC Bocor", status: "Sedang Dikerjakan" },
  { id: 9, title: "Monitor Tidak Dapat Nyala", status: "Selesai" },
];

export default function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <WorkOrderList initialOrders={workOrders} />
    </div>
  );
}