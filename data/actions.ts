"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import type { ScheduleEvent } from "../types/schedule-types"
import {
  scheduleData,
  addEvent as addToScheduleData,
  deleteEvent as deleteFromScheduleData,
} from "../data/schedule-data"

//ini masih pake cookie tolong ganttin pake database kalo dah siap
const COOKIE_NAME = "schedule-events"

// Get all events
export async function getEvents(): Promise<ScheduleEvent[]> {
  const cookieStore = await cookies()
  const storedEvents = cookieStore.get(COOKIE_NAME)?.value

  if (!storedEvents) {
    // Return data from schedule-data if no events are stored in cookies
    return [...scheduleData]
  }

  try {
    return JSON.parse(storedEvents) as ScheduleEvent[]
  } catch (error) {
    console.error("Failed to parse stored events:", error)
    return [...scheduleData]
  }
}

// Add a new event
export async function addEvent(event: ScheduleEvent): Promise<{ success: boolean; message?: string }> {
  try {
    const events = await getEvents()

    // Check for conflicts
    const conflict = checkForConflicts(event, events)
    if (conflict) {
      return {
        success: false,
        message: conflict,
      }
    }

    // Add the new event
    const updatedEvents = [...events, event]

    // Add to schedule data
    addToScheduleData(event)

    // Save the updated events
    const cookieStore = await cookies()
    cookieStore.set({
      name: COOKIE_NAME,
      value: JSON.stringify(updatedEvents),
      // Set an expiration date far in the future
      expires: Date.now() + 1000 * 60 * 60 * 24 * 365, // 1 year
      path: "/",
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Failed to add event:", error)
    return {
      success: false,
      message: "Failed to add event. Please try again.",
    }
  }
}

// Delete an event
export async function deleteEvent(eventId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const events = await getEvents()
    const updatedEvents = events.filter((event) => event.id !== eventId)

    // Delete from schedule data
    deleteFromScheduleData(eventId)

    // Save the updated events
    const cookieStore = await cookies()
    cookieStore.set({
      name: COOKIE_NAME,
      value: JSON.stringify(updatedEvents),
      expires: Date.now() + 1000 * 60 * 60 * 24 * 365, // 1 year
      path: "/",
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete event:", error)
    return {
      success: false,
      message: "Failed to delete event. Please try again.",
    }
  }
}

// Check for scheduling conflicts
function checkForConflicts(newEvent: ScheduleEvent, existingEvents: ScheduleEvent[]): string | null {
  const startTime = newEvent.startTime
  const duration = newEvent.duration
  const endTime = startTime + duration
  const room = newEvent.location
  const date = new Date(newEvent.date)

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
  const conflict = eventsOnSameDay.find((event) => {
    const eventStart = event.startTime
    const eventEnd = event.startTime + event.duration

    // Check if the new event overlaps with an existing event
    return (
      (startTime >= eventStart && startTime < eventEnd) || // New event starts during existing event
      (endTime > eventStart && endTime <= eventEnd) || // New event ends during existing event
      (startTime <= eventStart && endTime >= eventEnd) // New event completely covers existing event
    )
  })

  if (conflict) {
    const conflictStart = conflict.startTime.toString().padStart(2, "0")
    const conflictEnd = (conflict.startTime + conflict.duration).toString().padStart(2, "0")

    return `Room is already booked for "${conflict.title}" from ${conflictStart}:00 to ${conflictEnd}:00`
  }

  return null
}

