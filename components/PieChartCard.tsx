import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  Legend,
  Cell,
} from "recharts"

interface WorkOrderStatusData {
  status: string
  label: string
  count: number
}

const STATUS_COLORS: Record<string, string> = {
  belum_mulai: "#facc15",
  dalam_pengerjaan: "#2563eb",
  terkendala: "#f87171",
  selesai: "#10b981",
}

export const PieChartCard = ({
  title,
  data,
}: {
  title: string
  data: WorkOrderStatusData[]
}) => (
  <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow">
    <h3 className="text-xl font-semibold mb-6">{title}</h3>
    <ResponsiveContainer width="100%" height={400}>
      <PieChart margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
        <Pie
          data={data}
          dataKey="count"
          nameKey="label"
          cx="50%"
          cy="50%"
          outerRadius={120}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          labelLine={{ stroke: '#8884d8', strokeWidth: 0.5 }}
          minAngle={5} // Memastikan slice kecil tetap memiliki ruang label
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={STATUS_COLORS[entry.status] || "#8884d8"}
            />
          ))}
        </Pie>
        <Tooltip formatter={(value: number, name: string) => [value, name]} />
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }} // Memberi jarak antara chart dan legend
        />
      </PieChart>
    </ResponsiveContainer>
  </div>
)