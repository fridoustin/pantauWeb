import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { differenceInHours, addHours, formatISO } from "date-fns";

// GET: Ambil semua booking
export async function GET() {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("meeting_room_booking")
    .select(`
      booking_id,
      title,
      start_time,
      end_time,
      event_type,
      description,
      meeting_room ( room_id, name )
    `);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Transform data untuk disamakan dengan format ScheduleEvent di UI
  const events = data.map((item: any) => {
    const startDate = new Date(item.start_time);
    const endDate = new Date(item.end_time);
    const duration = differenceInHours(endDate, startDate);
    return {
      id: item.booking_id,
      title: item.title,
      date: formatISO(startDate),
      startTime: startDate.getHours(),
      duration,
      type: item.event_type.charAt(0).toUpperCase() + item.event_type.slice(1),
      location: item.meeting_room?.name,
      description: item.description,
    };
  });

  return NextResponse.json({ events });
}

// POST: Tambah booking baru
export async function POST(request: Request) {
  const supabase = await createServerClient();
  const body = await request.json();
  const { title, date, startTime, duration, type, location, description } =
    body;
  
  const eventDate = new Date(date);
  
  const localEventDate = new Date(
    eventDate.getFullYear(),
    eventDate.getMonth(),
    eventDate.getDate(),
    startTime,
    0,
    0,
    0
  );
  
  const start_time = formatISO(localEventDate);
  
  const endTimeDate = addHours(localEventDate, duration);
  const end_time = formatISO(endTimeDate);

  // Cari room_id berdasarkan nama ruangan
  const { data: roomData, error: roomError } = await supabase
    .from("meeting_room")
    .select("room_id")
    .eq("name", location)
    .single();

  if (roomError || !roomData) {
    return NextResponse.json(
      { error: "Room not found" },
      { status: 400 }
    );
  }
  const room_id = roomData.room_id;

  // Ambil admin_id
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const admin_id = user.id;

  // Lakukan insert ke tabel meeting_room_booking
  const { data, error } = await supabase
    .from("meeting_room_booking")
    .insert([
      {
        admin_id,
        title,
        start_time,
        end_time,
        event_type: type.toLowerCase(),
        room_id,
        description,
      },
    ])
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ event: data[0] });
}

// PUT: Update booking berdasarkan booking_id
export async function PUT(request: Request) {
  const supabase = await createServerClient();
  const { searchParams } = new URL(request.url);
  const booking_id = searchParams.get("booking_id");

  if (!booking_id) {
    return NextResponse.json(
      { error: "Missing booking_id" },
      { status: 400 }
    );
  }

  const body = await request.json();
  const { title, date, startTime, duration, type, location, description } = body;
  
  const eventDate = new Date(date);
  
  const localEventDate = new Date(
    eventDate.getFullYear(),
    eventDate.getMonth(),
    eventDate.getDate(),
    startTime,
    0,
    0,
    0
  );
  
  const start_time = formatISO(localEventDate);
  
  const endTimeDate = addHours(localEventDate, duration);
  const end_time = formatISO(endTimeDate);

  // Cari room_id berdasarkan nama ruangan
  const { data: roomData, error: roomError } = await supabase
    .from("meeting_room")
    .select("room_id")
    .eq("name", location)
    .single();

  if (roomError || !roomData) {
    return NextResponse.json(
      { error: "Room not found" },
      { status: 400 }
    );
  }
  const room_id = roomData.room_id;

  // Update booking
  const { data, error } = await supabase
    .from("meeting_room_booking")
    .update({
      title,
      start_time,
      end_time,
      event_type: type.toLowerCase(),
      room_id,
      description,
    })
    .eq("booking_id", booking_id)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ event: data[0] });
}

// DELETE: Hapus booking berdasarkan booking_id
export async function DELETE(request: Request) {
  const supabase = await createServerClient();
  const { searchParams } = new URL(request.url);
  const booking_id = searchParams.get("booking_id");

  if (!booking_id) {
    return NextResponse.json(
      { error: "Missing booking_id" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("meeting_room_booking")
    .delete()
    .eq("booking_id", booking_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}