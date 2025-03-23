"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, Plus } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScheduleTable } from "@/components/schedule-table"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { AddEventDialog } from "@/components/add-event-dialog"
import type { ScheduleEvent } from "@/types/schedule-types"

// Import schedule data and functions
import { scheduleData, addEvent, deleteEvent } from "@/data/schedule-data"

// Updated room data
const rooms = [
  "Success Meeting Room",
  "Hard Work Meeting Room",
  "Loyalty Meeting Room",
  "Fighting Meeting Room",
  "Auditorium",
  "Gym",
  "Holding Room/Library",
  "Basket Ball/Futsal Court",
]

export default function TableSchedule() {
  const [date, setDate] = useState<Date>(new Date())
  const [eventType, setEventType] = useState<string>("all")
  const [events, setEvents] = useState<ScheduleEvent[]>(scheduleData)
  const [isAddEventOpen, setIsAddEventOpen] = useState(false)

  // Update local state when scheduleData changes
  useEffect(() => {
    setEvents([...scheduleData])
  }, [])

  // Filter events for the selected date and event type
  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.date)
    const eventEndDate = new Date(eventDate)
    eventEndDate.setHours(eventEndDate.getHours() + event.duration)

    // Check if the event spans to the next day(s)
    const eventDay = eventDate.getDate()
    const eventMonth = eventDate.getMonth()
    const eventYear = eventDate.getFullYear()

    const selectedDay = date.getDate()
    const selectedMonth = date.getMonth()
    const selectedYear = date.getFullYear()

    // Event starts on the selected date
    const startsOnSelectedDate = eventDay === selectedDay && eventMonth === selectedMonth && eventYear === selectedYear

    // Event spans multiple days and includes the selected date
    const spansToSelectedDate = () => {
      // Convert dates to timestamps for easier comparison
      const eventStart = new Date(eventYear, eventMonth, eventDay).getTime()
      const eventEnd = new Date(eventYear, eventMonth, eventDay)
      eventEnd.setHours(event.startTime + event.duration)

      const selectedDate = new Date(selectedYear, selectedMonth, selectedDay).getTime()
      const nextDay = new Date(selectedYear, selectedMonth, selectedDay + 1).getTime()

      // Check if selected date is between event start and end
      return selectedDate >= eventStart && selectedDate < eventEnd.getTime()
    }

    // Event is visible on the selected date if it starts on that date or spans to it
    const dateMatches = startsOnSelectedDate || spansToSelectedDate()

    // Filter by event type if not "all"
    const typeMatches = eventType === "all" || event.type.toLowerCase() === eventType.toLowerCase()

    return dateMatches && typeMatches
  })

  const handleAddEvent = (newEvent: ScheduleEvent) => {
    // Add to the schedule data
    addEvent(newEvent)
    // Update local state
    setEvents([...scheduleData])
    setIsAddEventOpen(false)
  }

  const handleDeleteEvent = (eventId: string) => {
    // Delete from the schedule data
    deleteEvent(eventId)
    // Update local state
    setEvents([...scheduleData])
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center p-6">
        <h1 className="text-3xl font-bold">Room Schedule</h1>
        <Button className="flex items-center gap-2" onClick={() => setIsAddEventOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Event
        </Button>
      </div>

      <div className="flex-1 border rounded-lg overflow-hidden bg-card mx-6 mb-6">
        <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "MMMM do, yyyy") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center gap-2">
            <Select defaultValue="all" onValueChange={(value) => setEventType(value)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="meeting">Meetings</SelectItem>
                <SelectItem value="appointment">Appointments</SelectItem>
                <SelectItem value="task">Tasks</SelectItem>
                <SelectItem value="break">Break</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <ScheduleTable rooms={rooms} data={filteredEvents} onDeleteEvent={handleDeleteEvent} selectedDate={date} />
      </div>

      <AddEventDialog
        open={isAddEventOpen}
        onOpenChange={setIsAddEventOpen}
        onAddEvent={handleAddEvent}
        rooms={rooms}
        selectedDate={date}
        existingEvents={events}
      />
    </div>
  )
}

