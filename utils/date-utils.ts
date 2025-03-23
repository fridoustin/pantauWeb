export function getWeekDates(weekOffset = 0): Date[] {
    const today = new Date()
    const currentDay = today.getDay() // 0 = Sunday, 1 = Monday, etc.
  
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - currentDay + weekOffset * 7)
  
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      return date
    })
  }
  
  export function formatDate(date: Date): string {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }
  
  export function formatDateRange(startDate: Date, endDate: Date): string {
    const startMonth = startDate.toLocaleDateString("en-US", { month: "short" })
    const endMonth = endDate.toLocaleDateString("en-US", { month: "short" })
    const startDay = startDate.getDate()
    const endDay = endDate.getDate()
    const year = startDate.getFullYear()
  
    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} - ${endDay}, ${year}`
    } else {
      return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`
    }
  }
  
  export function getDayName(date: Date): string {
    return date.toLocaleDateString("en-US", { weekday: "short" })
  }
  
  