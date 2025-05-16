'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Report {
  title: string;
  technician: string;
  created_at: string | null;
  start_time: string | null;
  end_time: string | null;
  duration: string | null;
  before_url: string | null;
  after_url: string | null;
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
  // Gunakan en-GB agar pemisah jam adalah ":" bukan "."
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

  const exportToCSV = () => {
    const headers = [
      'WO Title',
      'Technician',
      'Created At',
      'Start',
      'End',
      'Duration',
      'Before Photo',
      'After Photo',
    ];

    const rows = reports.map((r) => [
      r.title,
      r.technician,
      typeof r.created_at === 'string' ? r.created_at.replace(/<br\s*\/?>/gi, ' ') : '-',
      typeof r.start_time === 'string' ? r.start_time.replace(/<br\s*\/?>/gi, ' ') : '-',
      typeof r.end_time === 'string' ? r.end_time.replace(/<br\s*\/?>/gi, ' ') : '-',
      calculateDuration(r.start_time, r.end_time),
      r.before_url || '-',
      r.after_url || '-',
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
      <div className="flex justify-between mb-4">
        <button
          onClick={() => router.push("/work-order")}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm"
        >
          Back to Work Orders
        </button>
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
              <th className="p-4 border">Created At</th>
              <th className="p-4 border">Start</th>
              <th className="p-4 border">End</th>
              <th className="p-4 border">Duration</th>
              <th className="p-4 border">Before</th>
              <th className="p-4 border">After</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report, i) => (
              <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <td className="p-4 border">{report.title}</td>
                <td className="p-4 border">{report.technician}</td>
                <td className="p-4 border whitespace-pre-line">{formatDateTime(report.created_at)}</td>
                <td className="p-4 border whitespace-pre-line">{formatDateTime(report.start_time)}</td>
                <td className="p-4 border whitespace-pre-line">{formatDateTime(report.end_time)}</td>
                <td className="p-4 border">
                  {calculateDuration(report.start_time, report.end_time)}
                </td>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
