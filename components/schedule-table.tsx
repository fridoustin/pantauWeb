"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "../utils/date-utils"
import type { ScheduleEvent } from "../types/schedule-types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ScheduleTableProps {
  rooms: string[]
  data: ScheduleEvent[]
  onDeleteEvent?: (eventId: string) => void
  selectedDate: Date
}

// buat warna card
const getEventColor = (eventType: string) => {
  switch (eventType.toLowerCase()) {
    case "meeting":
      return "bg-blue-100 border-blue-300 dark:bg-blue-950 dark:border-blue-800"
    case "appointment":
      return "bg-pink-100 border-pink-300 dark:bg-pink-950 dark:border-pink-800"
    case "task":
      return "bg-green-100 border-green-300 dark:bg-green-950 dark:border-green-800"
    case "break":
      return "bg-cyan-100 border-cyan-300 dark:bg-cyan-950 dark:border-cyan-800"
    default:
      return "bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-700"
  }
}

export function ScheduleTable({ rooms, data, onDeleteEvent, selectedDate }: ScheduleTableProps) {
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const timeSlots = Array.from({ length: 24 }, (_, i) => i)

  // Check if a time slot is the start of an event
  const isEventStart = (time: number, room: string) => {
    return data.some((event) => {
      const eventDate = new Date(event.date)
      const isSameDay =
        eventDate.getDate() === selectedDate.getDate() &&
        eventDate.getMonth() === selectedDate.getMonth() &&
        eventDate.getFullYear() === selectedDate.getFullYear()

      return event.startTime === time && event.location === room && isSameDay
    })
  }

  // Get events that start at a specific time and room
  const getEventsStartingAt = (time: number, room: string) => {
    return data.filter((event) => {
      const eventDate = new Date(event.date)
      const isSameDay =
        eventDate.getDate() === selectedDate.getDate() &&
        eventDate.getMonth() === selectedDate.getMonth() &&
        eventDate.getFullYear() === selectedDate.getFullYear()

      return event.startTime === time && event.location === room && isSameDay
    })
  }

  // Check if a time slot is a continuation of an event (not the start)
  const isEventContinuation = (time: number, room: string) => {
    return data.some((event) => {
      // Check if the event is in the selected room
      if (event.location !== room) return false

      const eventDate = new Date(event.date)
      const eventStartDay = eventDate.getDate()
      const eventStartMonth = eventDate.getMonth()
      const eventStartYear = eventDate.getFullYear()

      const selectedDay = selectedDate.getDate()
      const selectedMonth = selectedDate.getMonth()
      const selectedYear = selectedDate.getFullYear()

      // If event starts on the selected day
      if (eventStartDay === selectedDay && eventStartMonth === selectedMonth && eventStartYear === selectedYear) {
        // Check if this time slot is a continuation of the event
        return time > event.startTime && time < event.startTime + event.duration
      }

      // If event starts on a previous day
      const eventStartTime = new Date(eventStartYear, eventStartMonth, eventStartDay, event.startTime)
      const eventEndTime = new Date(eventStartTime)
      eventEndTime.setHours(eventEndTime.getHours() + event.duration)

      const timeSlotDate = new Date(selectedYear, selectedMonth, selectedDay, time)

      // Check if this time slot falls within the event's duration
      return timeSlotDate >= eventStartTime && timeSlotDate < eventEndTime
    })
  }

  const getContinuingEvent = (time: number, room: string) => {
    return data.find((event) => {
      // cek slot ruangan
      if (event.location !== room) return false

      const eventDate = new Date(event.date)
      const eventStartDay = eventDate.getDate()
      const eventStartMonth = eventDate.getMonth()
      const eventStartYear = eventDate.getFullYear()

      const selectedDay = selectedDate.getDate()
      const selectedMonth = selectedDate.getMonth()
      const selectedYear = selectedDate.getFullYear()

      if (eventStartDay === selectedDay && eventStartMonth === selectedMonth && eventStartYear === selectedYear) {
        // cek jika kelanjutan event
        return time > event.startTime && time < event.startTime + event.duration
      }

      // jika event dimulai pada hari sebelumnya
      const eventStartTime = new Date(eventStartYear, eventStartMonth, eventStartDay, event.startTime)
      const eventEndTime = new Date(eventStartTime)
      eventEndTime.setHours(eventEndTime.getHours() + event.duration)

      const timeSlotDate = new Date(selectedYear, selectedMonth, selectedDay, time)

      // cek time slot
      return timeSlotDate >= eventStartTime && timeSlotDate < eventEndTime
    })
  }

  const handleEventClick = (event: ScheduleEvent) => {
    setSelectedEvent(event)
  }

  const handleDeleteClick = async () => {
    if (selectedEvent && onDeleteEvent) {
      setIsDeleting(true)
      try {
        await onDeleteEvent(selectedEvent.id)
      } finally {
        setDeleteConfirmOpen(false)
        setSelectedEvent(null)
        setIsDeleting(false)
      }
    }
  }

  const getBadgeVariant = (type: string) => {
    switch (type.toLowerCase()) {
      case "meeting":
        return "default"
      case "appointment":
        return "secondary"
      case "task":
        return "outline"
      default:
        return "default"
    }
  }

  // 24hour format
  const formatTime = (hour: number) => {
    return `${hour.toString().padStart(2, "0")}:00`
  }

  return (
    <>
      <div className="w-full overflow-x-auto max-h-[calc(100vh-220px)] overflow-y-auto">
        <Table className="w-full table-fixed">
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="w-[80px]">Time</TableHead>
              {rooms.map((room) => (
                <TableHead key={room} className="w-1/8">
                  <div className="text-center">
                    <div className="font-bold">{room}</div>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {timeSlots.map((time) => (
              <TableRow key={time}>
                <TableCell className="font-medium whitespace-nowrap">{formatTime(time)}</TableCell>
                {rooms.map((room) => {
                  // If this is the start of an event
                  if (isEventStart(time, room)) {
                    const events = getEventsStartingAt(time, room)
                    return (
                      <TableCell key={room} className="p-1">
                        <div className="space-y-1">
                          {events.map((event) => {
                            const colorClass = getEventColor(event.type)
                            const startTime = formatTime(event.startTime)
                            const endTime = formatTime((event.startTime + event.duration) % 24)

                            return (
                              <div
                                key={event.id}
                                className={`p-2 rounded-md cursor-pointer hover:bg-opacity-80 transition-colors border ${colorClass} text-foreground`}
                                onClick={() => handleEventClick(event)}
                              >
                                <div className="flex flex-col">
                                  <div className="font-medium">{event.title}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {startTime} - {event.duration > 24 - event.startTime ? "Next day" : endTime}
                                  </div>
                                  <div className="mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {event.type}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </TableCell>
                    )
                  }

                  // If this is a continuation of an event
                  if (isEventContinuation(time, room)) {
                    const continuingEvent = getContinuingEvent(time, room)
                    if (continuingEvent) {
                      const colorClass = getEventColor(continuingEvent.type)
                      return (
                        <TableCell key={room} className="p-1">
                          <div
                            className={`h-12 w-full rounded-md border ${colorClass} opacity-60 p-2 cursor-pointer`}
                            onClick={() => handleEventClick(continuingEvent)}
                          >
                            <div className="flex items-center justify-center text-xs text-muted-foreground">
                              {continuingEvent.title} (Continued)
                            </div>
                          </div>
                        </TableCell>
                      )
                    }
                  }

                  return (
                    <TableCell key={room} className="p-1">
                      <div className="h-12 w-full"></div>
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        {selectedEvent && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedEvent.title}</DialogTitle>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Badge variant={getBadgeVariant(selectedEvent.type)} className="mr-2">
                    {selectedEvent.type}
                  </Badge>
                  <span>
                    {formatDate(new Date(selectedEvent.date))}, {formatTime(selectedEvent.startTime)} -{" "}
                    {selectedEvent.duration > 24 - selectedEvent.startTime
                      ? `Next day ${formatTime((selectedEvent.startTime + selectedEvent.duration) % 24)}`
                      : formatTime(selectedEvent.startTime + selectedEvent.duration)}
                  </span>
                </div>

                {selectedEvent.location && (
                  <div>
                    <span className="font-medium">Location:</span> {selectedEvent.location}
                  </div>
                )}

                {selectedEvent.description && (
                  <div className="mt-2">
                    <span className="font-medium">Description:</span>
                    <div className="mt-1">{selectedEvent.description}</div>
                  </div>
                )}

                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                    Close
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setDeleteConfirmOpen(true)}
                    className="flex items-center gap-2"
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Event
                  </Button>
                </div>
              </div>
            </DialogHeader>
          </DialogContent>
        )}
      </Dialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteClick}
              className="bg-destructive text-destructive-foreground"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

