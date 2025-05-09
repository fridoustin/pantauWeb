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
} from "recharts"
import { DatePicker } from "@/components/DatePicker"

// Define the types for the data
interface WorkOrderData {
  month: string
  count: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    workOrders: 0,
    bookedRooms: 0,
    users: 0,
  })

  const [monthlyWorkOrders, setMonthlyWorkOrders] = useState<WorkOrderData[]>([])
  const [monthlyBookings, setMonthlyBookings] = useState<WorkOrderData[]>([])

  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
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

      setStats({
        workOrders: workOrders ?? 0,
        bookedRooms: bookedRooms ?? 0,
        users: users ?? 0,
      })
    }

    const fetchMonthlyData = async () => {
      const supabase = createClient()

      const { data: workData } = await supabase.rpc("get_monthly_work_orders")
      setMonthlyWorkOrders(workData ?? [])

      const { data: bookingData } = await supabase.rpc("get_monthly_bookings")
      setMonthlyBookings(bookingData ?? [])
    }

    fetchStats()
    fetchMonthlyData()
  }, [])

  const handleDateRangeChange = async () => {
    if (!startDate || !endDate) return

    const supabase = createClient()

    const { data: filteredWorkOrders } = await supabase
      .from("workorder")
      .select("*")
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString())

    const workOrdersData: WorkOrderData[] =
      (filteredWorkOrders ?? []).map((item: any) => ({
        month: item.created_at.substring(0, 7),
        count: 1, // Grouping logic placeholder — change if needed
      }))

    setMonthlyWorkOrders(workOrdersData)
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Work Orders" value={stats.workOrders} />
        <StatCard title="Booked Rooms" value={stats.bookedRooms} />
        <StatCard title="Registered Users" value={stats.users} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-4">Filter Work Orders by Date</h3>
          <div className="flex gap-4">
            <DatePicker
              value={startDate ?? undefined}
              onChange={(date) => setStartDate(date ?? null)}
            />
            <DatePicker
              value={endDate ?? undefined}
              onChange={(date) => setEndDate(date ?? null)}
            />
          </div>
          <button
            className="mt-4 p-2 bg-blue-600 text-white rounded"
            onClick={handleDateRangeChange}
            disabled={!startDate || !endDate}
          >
            Apply Date Range Filter
          </button>
        </div>

        <ChartCard title="Monthly Work Orders" data={monthlyWorkOrders} dataKey="count" />
        <ChartCard title="Monthly Bookings" data={monthlyBookings} dataKey="count" />
      </div>
    </div>
  )
}

const StatCard = ({ title, value }: { title: string; value: number }) => (
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
  <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey={dataKey} stroke="#2563eb" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  </div>
)
