import WorkOrderList from "./WOList";

const workOrders = [
  { id: 1, title: "AC Rusak", status: "Waiting" },
  { id: 2, title: "Lampu Mati", status: "Process" },
  { id: 3, title: "Meja Pecah", status: "Finish" },
  { id: 4, title: "Perlu Dibersihkan", status: "Waiting" },
  { id: 5, title: "Kursi Rusak", status: "Process" },
  { id: 6, title: "Pintu Macet", status: "Finish" },
  { id: 7, title: "Ruangan Berdebu", status: "Process" },
  { id: 8, title: "AC Bocor", status: "Process" },
  { id: 9, title: "Monitor Tidak Dapat Nyala", status: "Finish" },
];

export default function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <WorkOrderList initialOrders={workOrders} />
    </div>
  );
}