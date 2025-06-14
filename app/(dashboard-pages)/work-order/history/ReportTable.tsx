'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface Report {
  title: string;
  technician: string;
  status: string;
  created_at: string | null;
  start_time: string | null;
  updated_at: string | null;
  before_url: string | null;
  after_url: string | null;
}

export default function ReportTable() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<Date | null>(null);

  const statusMapping: Record<string, string> = {
    belum_mulai: 'Belum Mulai',
    dalam_pengerjaan: 'Dalam Pengerjaan',
    selesai: 'Selesai',
    terkendala: 'Terkendala',
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch('/api/reports');
        const data = await res.json();
        if (data.reports) {
          const mappedReports = data.reports.map((r: Report) => ({
            ...r,
            status: statusMapping[r.status] || r.status,
          }));
          setReports(mappedReports);
        }
      } catch (err) {
        console.error('Gagal fetch laporan:', err);
      }
    };

    fetchReports();
  }, []);

  const filteredReports = reports.filter(r => {
    const matchStatus = !statusFilter || r.status === statusMapping[statusFilter] || r.status === statusFilter;
    const matchDate = !dateFilter || (
      (r.created_at && isSameDay(new Date(r.created_at), dateFilter)) ||
      (r.start_time && isSameDay(new Date(r.start_time), dateFilter)) ||
      (r.updated_at && isSameDay(new Date(r.updated_at), dateFilter))
    );
    return matchStatus && matchDate;
  });

  function isSameDay(a: Date, b: Date) {
    return (
      a.getDate() === b.getDate() &&
      a.getMonth() === b.getMonth() &&
      a.getFullYear() === b.getFullYear()
    );
  }

  function formatDateTime(datetimeStr: string | null) {
    if (!datetimeStr) return '-';
    const dateObj = new Date(datetimeStr);
    if (isNaN(dateObj.getTime())) return '-';

    const optionsDate: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const optionsTime: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: false };

    return `${dateObj.toLocaleDateString('id-ID', optionsDate)} ${dateObj.toLocaleTimeString('en-GB', optionsTime)}`;
  }

  function calculateDuration(start: string | null, end: string | null) {
    if (!start || !end) return '-';
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return '-';

    const diffMs = endDate.getTime() - startDate.getTime();
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;

    let result = '';
    if (days > 0) result += `${days} hari `;
    if (hours > 0) result += `${hours} jam `;
    if (minutes > 0 || (!days && !hours)) result += `${minutes} menit`;

    return result.trim();
  }

  const exportToCSV = () => {
    const headers = [
      'WO Title', 'Technician', 'Status',
      'Created At', 'Start', 'End', 'Duration',
      'Before Photo', 'After Photo'
    ];

    const rows = filteredReports.map(r => [
      r.title,
      r.technician,
      r.status,
      formatDateTime(r.created_at),
      formatDateTime(r.start_time),
      formatDateTime(r.updated_at),
      calculateDuration(r.start_time, r.updated_at),
      r.before_url || '-',
      r.after_url || '-'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers, ...rows].map(e => e.map(v => `"${v}"`).join(',')).join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'work_order_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirm = () => {
    exportToCSV();
    setShowConfirm(false);
  };

  return (
    <div className="w-full px-6 py-6 relative">
      <div className="flex flex-wrap gap-2 items-center justify-between mb-4">
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => router.push('/work-order')}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm"
          >
            Back to Work Orders
          </button>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal bg-white dark:bg-gray-900",
                  !dateFilter && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFilter ? format(dateFilter, "MMMM do, yyyy") : <span>Pilih tanggal</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border rounded bg-white dark:bg-gray-900">
              <Calendar
                mode="single"
                selected={dateFilter ?? undefined}
                onSelect={(date) => setDateFilter(date ?? null)}
                initialFocus
                className="border-0 rounded"
              />
            </PopoverContent>
          </Popover>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-2 py-2 text-sm bg-white dark:bg-gray-900"
          >
            <option value="">Semua Status</option>
            <option value="selesai">Selesai</option>
            <option value="dalam_pengerjaan">Dalam Pengerjaan</option>
            <option value="belum_mulai">Belum Mulai</option>
            <option value="terkendala">Terkendala</option>
          </select>
        </div>

        <button
          onClick={() => setShowConfirm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
        >
          Export CSV
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              Konfirmasi Export
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              Apakah Anda yakin ingin mengekspor data ke dalam format CSV?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Batal
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Ya
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-300 dark:border-gray-700 overflow-x-auto">
        <table className="min-w-full text-sm text-left border-collapse">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
            <tr>
              <th className="p-4 border">WO Title</th>
              <th className="p-4 border">Technician</th>
              <th className="p-4 border">Status</th>
              <th className="p-4 border">Created At</th>
              <th className="p-4 border">Start</th>
              <th className="p-4 border">End</th>
              <th className="p-4 border">Duration</th>
              <th className="p-4 border">Before</th>
              <th className="p-4 border">After</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length > 0 ? (
              filteredReports.map((report, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="p-4 border">{report.title}</td>
                  <td className="p-4 border">{report.technician}</td>
                  <td className="p-4 border">{report.status}</td>
                  <td className="p-4 border">{formatDateTime(report.created_at)}</td>
                  <td className="p-4 border">{formatDateTime(report.start_time)}</td>
                  <td className="p-4 border">{formatDateTime(report.updated_at)}</td>
                  <td className="p-4 border">{calculateDuration(report.start_time, report.updated_at)}</td>
                  <td className="p-4 border">
                    {report.before_url ? (
                      <img src={report.before_url} alt="Before" className="w-28 rounded shadow" />
                    ) : '-'}
                  </td>
                  <td className="p-4 border">
                    {report.after_url ? (
                      <img src={report.after_url} alt="After" className="w-28 rounded shadow" />
                    ) : '-'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="text-center p-4 text-gray-500">Tidak ada data ditemukan</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
