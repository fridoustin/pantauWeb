import type { ScheduleEvent } from "../types/schedule-types"

// Get current date for sample data
const today = new Date()
const tomorrow = new Date(today)
tomorrow.setDate(today.getDate() + 1)
const dayAfterTomorrow = new Date(today)
dayAfterTomorrow.setDate(today.getDate() + 2)

// Initial schedule data
const initialScheduleData: ScheduleEvent[] = [
  {
    id: "1",
    title: "Team Meeting",
    date: today.toISOString(),
    startTime: 9,
    duration: 1,
    type: "Meeting",
    location: "Success Meeting Room",
    description: "Weekly team sync to discuss project progress and blockers.",
  },
  {
    id: "2",
    title: "Client Call",
    date: today.toISOString(),
    startTime: 11,
    duration: 1,
    type: "Meeting",
    location: "Hard Work Meeting Room",
    description: "Quarterly review with client to present project updates.",
  },
  {
    id: "3",
    title: "Lunch Break",
    date: today.toISOString(),
    startTime: 12,
    duration: 1,
    type: "Break",
    location: "Holding Room/Library",
  },
  {
    id: "4",
    title: "Project Planning",
    date: today.toISOString(),
    startTime: 14,
    duration: 2,
    type: "Task",
    location: "Auditorium",
    description: "Plan next sprint and assign tasks to team members.",
  },
]

// This will be our mutable data store
export let scheduleData: ScheduleEvent[] = [...initialScheduleData]

// Function to add an event
export function addEvent(event: ScheduleEvent): void {
  scheduleData = [...scheduleData, event]
}

// Function to delete an event
export function deleteEvent(eventId: string): void {
  scheduleData = scheduleData.filter((event) => event.id !== eventId)
}

// Function to reset to initial data (for testing)
export function resetData(): void {
  scheduleData = [...initialScheduleData]
}

