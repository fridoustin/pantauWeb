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
  created_at: string | null;
  start_time: string | null;
  updated_at: string | null;
  duration: string | null;
  status: string | null;
  before_url: string | null;
  after_url: string | null;
  note: string | null;
}

const statusMapping = {
  selesai: 'Selesai',
  dalam_pengerjaan: 'Dalam Pengerjaan',
  belum_mulai: 'Belum Mulai',
  terkendala: 'Terkendala',
};

function getStatusLabel(statusValue: string | null): string {
  if (!statusValue) return '-';
  return statusMapping[statusValue as keyof typeof statusMapping] || statusValue;
}

function formatDateTime(datetimeStr: string | null) {
  if (!datetimeStr) return '-';
  const dateObj = new Date(datetimeStr);
  if (isNaN(dateObj.getTime())) return '-';

  const optionsDate: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };
  const dateFormatted = dateObj.toLocaleDateString('id-ID', optionsDate);

  const optionsTime: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };
  const timeFormatted = dateObj.toLocaleTimeString('en-GB', optionsTime);

  return (
    <>
      {dateFormatted}
      <br />
      {timeFormatted}
    </>
  );
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

export default function ReportTable() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [dateFilter, setDateFilter] = useState<Date | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch('/api/reports');
        const data = await res.json();
        if (data.reports) setReports(data.reports);
      } catch (err) {
        console.error('Gagal fetch laporan:', err);
      }
    };
    fetchReports();
  }, []);

  const statusOptions = [
    { label: 'All Status', value: 'All Status' },
    { label: 'Selesai', value: 'selesai' },
    { label: 'Dalam Pengerjaan', value: 'dalam_pengerjaan' },
    { label: 'Belum Mulai', value: 'belum_mulai' },
    { label: 'Terkendala', value: 'terkendala' },
  ];

  const filteredReports = reports.filter((r) => {
    const matchesStatus =
      statusFilter === 'All Status' || r.status === statusFilter;

    const matchesDate =
      !dateFilter ||
      (r.created_at &&
        new Date(r.created_at).toDateString() === dateFilter.toDateString());

    return matchesStatus && matchesDate;
  });

  const exportToCSV = () => {
    const headers = [
      'WO Title',
      'Technician',
      'Created At',
      'Start',
      'End',
      'Duration',
      'Status',
      'Before Photo',
      'After Photo',
      'Note',
    ];
    const rows = filteredReports.map((r) => [
      r.title,
      r.technician,
      r.created_at ?? '-',
      r.start_time ?? '-',
      r.updated_at ?? '-',
      calculateDuration(r.start_time, r.updated_at),
      getStatusLabel(r.status),
      r.before_url || '-',
      r.after_url || '-',
      r.note || '-',
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers, ...rows].map((e) => e.join(',')).join('\n');
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
      <div className="flex justify-between mb-4 flex-wrap gap-2">
        <button
          onClick={() => router.push('/work-order')}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm"
        >
          Back to Work Orders
        </button>

        
      </div>

      {/* Filter: calendar + status */}
      <div className="flex gap-4 items-center mb-4 flex-wrap">
        <select
          className="border rounded px-4 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'justify-start text-left font-normal bg-white dark:bg-gray-900',
                !dateFilter && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFilter ? format(dateFilter, 'MMMM do, yyyy') : <span>Pilih tanggal</span>}
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

        <button
          onClick={() => setShowConfirm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm ml-auto"
        >
          Export CSV
        </button>

        
      </div>

      {/* Confirm popup */}
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

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-300 dark:border-gray-700 overflow-x-auto">
        <table className="min-w-full text-sm text-left border-collapse">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
            <tr>
              <th className="p-4 border">WO Title</th>
              <th className="p-4 border">Technician</th>
              <th className="p-4 border">Created At</th>
              <th className="p-4 border">Start</th>
              <th className="p-4 border">End</th>
              <th className="p-4 border">Duration</th>
              <th className="p-4 border">Status</th>
              <th className="p-4 border">Before</th>
              <th className="p-4 border">After</th>
              <th className="p-4 border">Note</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report, i) => (
              <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <td className="p-4 border">{report.title}</td>
                <td className="p-4 border">{report.technician}</td>
                <td className="p-4 border whitespace-pre-line">{formatDateTime(report.created_at)}</td>
                <td className="p-4 border whitespace-pre-line">{formatDateTime(report.start_time)}</td>
                <td className="p-4 border whitespace-pre-line">{formatDateTime(report.updated_at)}</td>
                <td className="p-4 border">{calculateDuration(report.start_time, report.updated_at)}</td>
                <td className="p-4 border">{getStatusLabel(report.status)}</td>
                <td className="p-4 border">
                  {report.before_url ? (
                    <img src={report.before_url} alt="Before" className="w-28 rounded shadow" />
                  ) : (
                    '-'
                  )}
                </td>
                <td className="p-4 border">
                  {report.after_url ? (
                    <img src={report.after_url} alt="After" className="w-28 rounded shadow" />
                  ) : (
                    '-'
                  )}
                </td>
                <td className="p-4 border">{report.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
