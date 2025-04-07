import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/utils/supabase/server";

// GET: Ambil semua room
export async function GET() {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("meeting_room")
    .select("room_id, name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ rooms: data });
}
