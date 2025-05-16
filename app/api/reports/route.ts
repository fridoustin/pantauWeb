// /app/api/reports/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('workorder')
    .select(`
      title,
      created_at,
      before_url,
      after_url,
      start_time,
      end_time,
      status,
      technician_id(name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Filter hanya status selesai
  const filtered = (data || []).filter((r: any) => r.status === 'selesai');

  const reports = filtered.map((r: any) => {
    const start = new Date(r.start_time);
    const end = new Date(r.end_time);

    let duration = '-';
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      const startMinutes = start.getHours() * 60 + start.getMinutes();
      const endMinutes = end.getHours() * 60 + end.getMinutes();

      const totalMinutes = endMinutes - startMinutes;

      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      const parts = [];
      if (hours > 0) parts.push(`${hours} jam`);
      if (minutes > 0 || hours === 0) parts.push(`${minutes} menit`);

      duration = parts.join(' ');
    }

    return {
      title: r.title ?? '-',
      technician: r.technician_id?.name ?? '-',
      created_at: r.created_at,
      start_time: r.start_time ?? '-',
      end_time: r.end_time ?? '-',
      before_url: r.before_url ?? '',
      after_url: r.after_url ?? '',
      duration,
    };
  });

  return NextResponse.json({ reports });
}
