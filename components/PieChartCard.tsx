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
  count: number
}

const STATUS_COLORS: Record<string, string> = {
  "dalam_pengerjaan": "#2563eb",
  "belum mulai": "#facc15",
  "terkendala": "#f87171",
  "selesai": "#10b981",
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
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="status"
          cx="50%"
          cy="50%"
          outerRadius={140}
          label
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || "#8884d8"} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>
)
