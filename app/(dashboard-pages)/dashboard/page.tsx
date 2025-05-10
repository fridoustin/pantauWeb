"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { DatePicker } from "@/components/DatePicker"

interface WorkOrderData {
  date: string
  count: number
}

interface WorkOrderStatusData {
  status: string
  count: number
}

const STATUS_COLORS: Record<string, string> = {
  "dalam_pengerjaan": "#2563eb", // blue
  "belum mulai": "#facc15", // yellow
  "terkendala": "#f87171", // red
  "selesai": "#10b981", // green
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    workOrders: 0,
    users: 0,
    totalCompletionRate: 0, // Total completion rate
    filteredCompletionRate: 0, // Filtered completion rate
  })

  const [monthlyWorkOrders, setMonthlyWorkOrders] = useState<WorkOrderData[]>([])
  const [statusData, setStatusData] = useState<WorkOrderStatusData[]>([])

  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  useEffect(() => {
    fetchAllStats()
    fetchInitialData()
  }, [])

  const fetchAllStats = async () => {
    const supabase = createClient()

    const { count: workOrders } = await supabase
      .from("workorder")
      .select("*", { count: "exact", head: true })

    const { count: bookedRooms } = await supabase
      .from("meeting_room_booking")
      .select("*", { count: "exact", head: true })

    const { count: users } = await supabase
      .from("technician")
      .select("*", { count: "exact", head: true })

    const { data: allWorkOrders } = await supabase.from("workorder").select("status")

    // Calculate the total completion rate
    const total = allWorkOrders?.length || 0
    const completed = allWorkOrders?.filter((wo: any) => wo.status === "selesai").length || 0
    const totalCompletionRate = total > 0 ? (completed / total) * 100 : 0

    setStats({
      workOrders: workOrders ?? 0,
      users: users ?? 0,
      totalCompletionRate, // Set total completion rate
      filteredCompletionRate: 0, // Set filtered completion rate to 0 initially
    })
  }

  const fetchInitialData = async () => {
    const supabase = createClient()

    const { data: workData } = await supabase.rpc("get_monthly_work_orders")
    setMonthlyWorkOrders(workData ?? [])

    const { data: allWorkOrders } = await supabase.from("workorder").select("status")

    const statusMap: Record<string, number> = {}
    allWorkOrders?.forEach(({ status }) => {
      statusMap[status] = (statusMap[status] || 0) + 1
    })

    const groupedStatusData = Object.entries(statusMap).map(([status, count]) => ({
      status,
      count,
    }))
    setStatusData(groupedStatusData)
  }

  const handleDateRangeChange = async () => {
    if (!startDate || !endDate) return

    const supabase = createClient()

    const { data: filteredWorkOrders, error } = await supabase
      .from("workorder")
      .select("*")
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString())

    if (error || !filteredWorkOrders) {
      setStats((prevStats) => ({
        ...prevStats,
        filteredCompletionRate: 0,
      }))
      setMonthlyWorkOrders([])
      setStatusData([])
      return
    }

    const workOrdersMap: Record<string, number> = {}
    filteredWorkOrders.forEach((item: any) => {
      const date = item.created_at.substring(0, 10) // YYYY-MM-DD
      workOrdersMap[date] = (workOrdersMap[date] || 0) + 1
    })

    // Fill in missing dates with 0
    const filledWorkOrdersData: WorkOrderData[] = []
    let current = new Date(startDate)
    while (current <= endDate) {
      const dateStr = current.toISOString().substring(0, 10)
      filledWorkOrdersData.push({
        date: dateStr,
        count: workOrdersMap[dateStr] || 0,
      })
      current.setDate(current.getDate() + 1)
    }

    setMonthlyWorkOrders(filledWorkOrdersData)

    const statusMap: Record<string, number> = {}
    filteredWorkOrders.forEach(({ status }) => {
      statusMap[status] = (statusMap[status] || 0) + 1
    })

    const groupedStatusData = Object.entries(statusMap).map(([status, count]) => ({
      status,
      count,
    }))
    setStatusData(groupedStatusData)

    // Calculate the filtered completion rate
    const total = filteredWorkOrders.length
    const completed = filteredWorkOrders.filter(wo => wo.status === "selesai").length
    const filteredCompletionRate = total > 0 ? (completed / total) * 100 : 0
    setStats((prevStats) => ({
      ...prevStats,
      filteredCompletionRate, // Set filtered completion rate
    }))
  }

  const resetFilters = () => {
    setStartDate(null)
    setEndDate(null)
    fetchInitialData()
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Work Orders" value={stats.workOrders} />
        <StatCard title="Registered Users" value={stats.users} />
        <StatCard title="Total Completion Rate" value={stats.totalCompletionRate.toFixed(2) + "%"} />
      </div>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-4">Filter by Date</h3>
        <div className="flex flex-wrap gap-4 items-center">
          <DatePicker
            value={startDate ?? undefined}
            onChange={(date) => setStartDate(date ?? null)}
          />
          <DatePicker
            value={endDate ?? undefined}
            onChange={(date) => setEndDate(date ?? null)}
          />
          <button
            className="p-2 bg-blue-600 text-white rounded"
            onClick={handleDateRangeChange}
            disabled={!startDate || !endDate}
          >
            Apply Date Filter
          </button>
          <button
            className="p-2 bg-gray-300 text-black rounded"
            onClick={resetFilters}
          >
            Reset Filter
          </button>
        </div>
        <div className="mt-4">
          <span className="font-medium">Filtered Completion Rate: </span>
          {stats.filteredCompletionRate.toFixed(2)}%
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Monthly Work Orders" data={monthlyWorkOrders} dataKey="count" />
        <PieChartCard title="Work Order Status" data={statusData} />
      </div>
    </div>
  )
}

const StatCard = ({ title, value }: { title: string; value: number | string }) => (
  <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow text-center">
    <h2 className="text-lg font-medium text-muted-foreground">{title}</h2>
    <p className="text-3xl font-bold mt-2">{value}</p>
  </div>
)

const ChartCard = ({
  title,
  data,
  dataKey,
}: {
  title: string
  data: WorkOrderData[]
  dataKey: string
}) => (
  <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow  col-span-4 row-span-4">
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

const PieChartCard = ({
  title,
  data,
}: {
  title: string
  data: WorkOrderStatusData[]
}) => (
  <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow  col-span-4 row-span-4">
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
