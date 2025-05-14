"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { DatePicker } from "@/components/DatePicker"
import { ChartCard } from "@/components/ChartCard"
import { PieChartCard } from "@/components/PieChartCard"
import { StatCard } from "@/components/StatCard"

interface WorkOrderData {
  date: string
  count: number
}

interface WorkOrderStatusData {
  status: string
  count: number
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
    <div className="w-full h-full p-6 bg-blue-50">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Work Orders" value={stats.workOrders} />
        <StatCard title="Registered Users" value={stats.users} />
        <StatCard title="Total Completion Rate" value={stats.totalCompletionRate.toFixed(2) + "%"} />
      </div>

      {/* Date Filter Card */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">Filter by Date</h3>
        <div className="flex flex-wrap gap-4 items-center mb-4">
          <DatePicker
            value={startDate ?? undefined}
            onChange={(date) => setStartDate(date ?? null)}
          />
          <DatePicker
            value={endDate ?? undefined}
            onChange={(date) => setEndDate(date ?? null)}
          />
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={handleDateRangeChange}
            disabled={!startDate || !endDate}
          >
            Apply Date Filter
          </button>
          <button
            className="px-4 py-2 bg-gray-300 text-black rounded"
            onClick={resetFilters}
          >
            Reset Filter
          </button>
        </div>
        <div>
          <span className="font-medium">Filtered Completion Rate: </span>
          {stats.filteredCompletionRate.toFixed(2)}%
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
        <ChartCard title="Monthly Work Orders" data={monthlyWorkOrders} dataKey="count" />
        <PieChartCard title="Work Order Status" data={statusData} />
      </div>
    </div>
  )
}