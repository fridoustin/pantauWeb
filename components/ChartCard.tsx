import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
} from "recharts"

interface WorkOrderData {
  date: string
  count: number
}

export const ChartCard = ({
  title,
  data,
  dataKey,
}: {
  title: string
  data: WorkOrderData[]
  dataKey: string
}) => (
  <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow">
    <h3 className="text-xl font-semibold mb-6">{title}</h3>
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey={dataKey} stroke="#2563eb" strokeWidth={3} />
      </LineChart>
    </ResponsiveContainer>
  </div>
)
