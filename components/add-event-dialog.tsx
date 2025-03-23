"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { ScheduleEvent } from "../types/schedule-types"
import { useForm } from "react-hook-form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface AddEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddEvent: (event: ScheduleEvent) => void
  rooms: string[]
  selectedDate: Date
  existingEvents: ScheduleEvent[]
}

export function AddEventDialog({
  open,
  onOpenChange,
  onAddEvent,
  rooms,
  selectedDate,
  existingEvents,
}: AddEventDialogProps) {
  const [conflictError, setConflictError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConflictDialog, setShowConflictDialog] = useState(false)

  const form = useForm({
    defaultValues: {
      title: "",
      date: selectedDate,
      startTime: "9",
      duration: "1",
      type: "Meeting",
      location: rooms[0],
      description: "",
    },
  })

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        title: "",
        date: selectedDate,
        startTime: "9",
        duration: "1",
        type: "Meeting",
        location: rooms[0],
        description: "",
      })
      setConflictError(null)
      setIsSubmitting(false)
      setShowConflictDialog(false)
    }
  }, [open, form, selectedDate, rooms])

  // Check for scheduling conflicts
  const checkForConflicts = (formData: any) => {
    const startTime = Number.parseInt(formData.startTime)
    const duration = Number.parseInt(formData.duration)
    const endTime = startTime + duration
    const room = formData.location
    const date = formData.date

    // Filter events for the selected date and room
    const eventsOnSameDay = existingEvents.filter((event) => {
      const eventDate = new Date(event.date)
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear() &&
        event.location === room
      )
    })

    // Check for time conflicts
    for (const event of eventsOnSameDay) {
      const eventStart = event.startTime
      const eventEnd = event.startTime + event.duration

      // Check if the new event overlaps with an existing event
      const hasOverlap =
        (startTime >= eventStart && startTime < eventEnd) || // New event starts during existing event
        (endTime > eventStart && endTime <= eventEnd) || // New event ends during existing event
        (startTime <= eventStart && endTime >= eventEnd) // New event completely covers existing event

      if (hasOverlap) {
        const conflictStart = formatTime(event.startTime)
        const conflictEnd = formatTime(event.startTime + event.duration)

        return `Room "${room}" is already booked for "${event.title}" from ${conflictStart} to ${conflictEnd}`
      }
    }

    return null
  }

  // Helper function to format time
  const formatTime = (hour: number) => {
    return `${hour.toString().padStart(2, "0")}:00`
  }

  const handleSubmit = form.handleSubmit(async (data) => {
    // Check for conflicts
    const conflict = checkForConflicts(data)

    if (conflict) {
      setConflictError(conflict)
      setShowConflictDialog(true)
      return
    }

    setIsSubmitting(true)

    const newEvent: ScheduleEvent = {
      id: Date.now().toString(), // Generate a unique ID
      title: data.title,
      date: data.date.toISOString(),
      startTime: Number.parseInt(data.startTime),
      duration: Number.parseInt(data.duration),
      type: data.type,
      location: data.location,
      description: data.description,
    }

    try {
      await onAddEvent(newEvent)
      form.reset()
    } catch (error) {
      console.error("Failed to add event:", error)
      setConflictError("An error occurred while adding the event. Please try again.")
      setShowConflictDialog(true)
    } finally {
      setIsSubmitting(false)
    }
  })

  // Generate time options for 24-hour format
  const timeOptions = Array.from({ length: 24 }, (_, i) => i)

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isSubmitting && onOpenChange(isOpen)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Event</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Event title" {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full h-10 px-3 py-2 flex items-center justify-between"
                            >
                              <div className="flex items-center">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              </div>
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select event type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Meeting">Meeting</SelectItem>
                          <SelectItem value="Appointment">Appointment</SelectItem>
                          <SelectItem value="Task">Task</SelectItem>
                          <SelectItem value="Break">Break</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select start time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeOptions.map((hour) => (
                            <SelectItem key={hour} value={hour.toString()}>
                              {hour.toString().padStart(2, "0")}:00
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (hours)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[200px] overflow-y-auto">
                          {Array.from({ length: 24 }, (_, i) => i + 1).map((duration) => (
                            <SelectItem key={duration} value={duration.toString()}>
                              {duration} {duration === 1 ? "hour" : "hours"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select room" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {rooms.map((room) => (
                          <SelectItem key={room} value={room}>
                            {room}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Event description (optional)" className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit">Add Event</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Conflict Alert Dialog */}
      <AlertDialog open={showConflictDialog} onOpenChange={setShowConflictDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Scheduling Conflict</AlertDialogTitle>
            <AlertDialogDescription>{conflictError}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setShowConflictDialog(false)
                // Reset the conflict error when the dialog is closed
                setConflictError(null)
              }}
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

