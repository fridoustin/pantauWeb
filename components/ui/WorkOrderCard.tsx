interface WorkOrderCardProps {
    data: {
      id: number;
      title: string;
      status: string;
    };
  }
  
  export default function WorkOrderCard({ data }: WorkOrderCardProps) {
    return (
      <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition">
        <h2 className="font-bold text-lg">{data.title}</h2>
        <p className="text-sm text-gray-600">Status: {data.status}</p>
        <button className="mt-2 text-blue-600 hover:underline text-sm">
          Lihat Detail
        </button>
      </div>
    );
  }
  