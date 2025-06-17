"use client";

import { useState, useEffect } from "react";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScheduleTable } from "@/components/schedule-table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { AddEventDialog } from "@/components/add-event-dialog";
import { EditEventDialog } from "@/components/edit-event-dialog";
import type { ScheduleEvent } from "@/types/schedule-types";

export default function TableSchedule() {
  const [date, setDate] = useState<Date>(new Date());
  const [eventType, setEventType] = useState<string>("all");
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [rooms, setRooms] = useState<string[]>([]);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<ScheduleEvent | null>(null);

  // Ambil data event dari API
  useEffect(() => {
    fetchEvents();
    fetchRooms();
  }, []);

  const fetchEvents = async () => {
    const res = await fetch("/api/bookings");
    const data = await res.json();
    if (data.events) {
      setEvents(data.events);
    }
  };

  const fetchRooms = async () => {
    const res = await fetch("/api/rooms");
    const data = await res.json();
    if (data.rooms) {
      setRooms(data.rooms.map((room: any) => room.name));
    }
  };

  // Filter events sesuai tanggal dan tipe
  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.date);
    const eventEndDate = new Date(eventDate);
    eventEndDate.setHours(eventEndDate.getHours() + event.duration);

    const eventDay = eventDate.getDate();
    const eventMonth = eventDate.getMonth();
    const eventYear = eventDate.getFullYear();

    const selectedDay = date.getDate();
    const selectedMonth = date.getMonth();
    const selectedYear = date.getFullYear();

    const startsOnSelectedDate =
      eventDay === selectedDay &&
      eventMonth === selectedMonth &&
      eventYear === selectedYear;

    const spansToSelectedDate = () => {
      const eventStart = new Date(eventYear, eventMonth, eventDay).getTime();
      const eventEnd = new Date(eventYear, eventMonth, eventDay);
      eventEnd.setHours(event.startTime + event.duration);
      const selectedDate = new Date(selectedYear, selectedMonth, selectedDay).getTime();
      return selectedDate >= eventStart && selectedDate < eventEnd.getTime();
    };

    const dateMatches = startsOnSelectedDate || spansToSelectedDate();
    const typeMatches =
      eventType === "all" ||
      event.type.toLowerCase() === eventType.toLowerCase();

    return dateMatches && typeMatches;
  });

  const handleAddEvent = async (newEvent: ScheduleEvent) => {
    // Kirim POST ke API
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newEvent),
    });
    const result = await res.json();
    if (result.error) {
      console.error("Error menambahkan event:", result.error);
    } else {
      fetchEvents();
      setIsAddEventOpen(false);
    }
  };

  const handleEditEvent = async (updatedEvent: ScheduleEvent) => {
    // Kirim PUT ke API
    const res = await fetch(`/api/bookings?booking_id=${updatedEvent.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedEvent),
    });
    const result = await res.json();
    if (result.error) {
      console.error("Error mengupdate event:", result.error);
      throw new Error(result.error);
    } else {
      fetchEvents();
      setIsEditEventOpen(false);
      setEventToEdit(null);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    const res = await fetch(`/api/bookings?booking_id=${eventId}`, {
      method: "DELETE",
    });
    const result = await res.json();
    if (result.error) {
      console.error("Error menghapus event:", result.error);
    } else {
      fetchEvents();
    }
  };

  const handleOpenEditDialog = (event: ScheduleEvent) => {
    setEventToEdit(event);
    setIsEditEventOpen(true);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center p-6">
        <h1 className="text-3xl font-bold">Room Schedule</h1>
        <Button
          className="flex items-center gap-2"
          onClick={() => setIsAddEventOpen(true)}
        >
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
                  className={cn(
                    "justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
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

        <ScheduleTable
          rooms={rooms}
          data={filteredEvents}
          onDeleteEvent={handleDeleteEvent}
          onEditEvent={handleOpenEditDialog}
          selectedDate={date}
        />
      </div>

      <AddEventDialog
        open={isAddEventOpen}
        onOpenChange={setIsAddEventOpen}
        onAddEvent={handleAddEvent}
        rooms={rooms}
        selectedDate={date}
        existingEvents={events}
      />

      <EditEventDialog
        open={isEditEventOpen}
        onOpenChange={setIsEditEventOpen}
        onEditEvent={handleEditEvent}
        rooms={rooms}
        existingEvents={events}
        eventToEdit={eventToEdit}
      />
    </div>
  );
}