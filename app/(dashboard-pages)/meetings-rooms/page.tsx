"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const meetingRooms = [
    "Success Meeting Room",
    "Hard Work Meeting Room",
    "Loyalty Meeting Room",
    "Fighting Meeting Room",
    "Auditorium",
    "Gym",
    "Holding Room/Library",
    "Basket Ball/Futsal Court",
];

export default function MeetingRoomBooking() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [description, setDescription] = useState("");

    function addEvent() {
        if (!selectedRoom || !startTime || !endTime || !description) {
            toast.error("Please fill all fields.");
            return;
        }

        toast.success(`Event added in ${selectedRoom}!`);
        setIsDialogOpen(false);
        setSelectedRoom("");
        setStartTime("");
        setEndTime("");
        setDescription("");
    }

    return (
        <div className="p-6">
            {/* <Button onClick={() => setIsDialogOpen(true)}>+ Add Event</Button> */}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogTitle>Add Event</DialogTitle>
                    <div className="space-y-3">
                        <Label>Meeting Room</Label>
                        <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a meeting room" />
                            </SelectTrigger>
                            <SelectContent>
                                {meetingRooms.map((room, index) => (
                                    <SelectItem key={index} value={room}>{room}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Label>Start Time</Label>
                        <Input
                            type="datetime-local"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            placeholder="Select start date and time"
                        />

                        <Label>End Time</Label>
                        <Input
                            type="datetime-local"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            placeholder="Select end date and time"
                        />

                        <Label>Description</Label>
                        <Input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter event details"
                        />

                        <Button className="mt-4 w-full" onClick={addEvent}>Confirm</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
