'use client';

import { useState } from 'react';
import { useRouter } from "next/navigation";

// Tipe data report
interface Report {
  id: number;
  work_order_id: number;
  note: string;
  created_at: string;
  before_photo_url: string;
  after_photo_url: string;
  technician: string;
}

export default function ReportTable() {
  const [reports] = useState<Report[]>([
    {
      id: 1,
      work_order_id: 909,
      technician: 'Mamank Garox',
      note: 'Perbaikan AC selesai',
      created_at: '2025-04-24T10:30:00Z',
      before_photo_url: 'https://via.placeholder.com/100x60?text=Before1',
      after_photo_url: 'https://via.placeholder.com/100x60?text=After1',
    },
    {
      id: 2,
      work_order_id: 902,
      technician: 'Mamank Garox',
      note: 'Lampu mati diganti',
      created_at: '2025-04-24T12:45:00Z',
      before_photo_url: 'https://via.placeholder.com/100x60?text=Before2',
      after_photo_url: 'https://via.placeholder.com/100x60?text=After2',
    },
    {
      id: 3,
      work_order_id: 903,
      technician: 'Mamank Garox',
      note: 'Kabel jaringan diperbaiki',
      created_at: '2025-04-25T08:15:00Z',
      before_photo_url: 'https://via.placeholder.com/100x60?text=Before3',
      after_photo_url: 'https://via.placeholder.com/100x60?text=After3',
    },
  ]);

  const router = useRouter();

  const [showConfirm, setShowConfirm] = useState(false);

  const exportToCSV = () => {
    const headers = [
      'ID',
      'Work Order ID',
      'Technician',
      'Note',
      'Created At',
      'Before Photo URL',
      'After Photo URL',
    ];

    const rows = reports.map((r) => [
      r.id,
      r.work_order_id,
      r.technician,
      r.note,
      new Date(r.created_at).toLocaleString('id-ID'),
      r.before_photo_url,
      r.after_photo_url,
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
      {/* Tombol Kembali (Back Button) */}
      <div className="flex justify-between mb-4">
        <button
          onClick={() => router.push("/work-order")}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm"
        >
          Back to Work Orders
        </button>

        {/* Tombol Export */}
        <button
          onClick={() => setShowConfirm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
        >
          Export CSV
        </button>
      </div>
      {/* Modal Konfirmasi */}
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

      {/* Tabel */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-300 dark:border-gray-700 overflow-x-auto">
        <table className="min-w-full text-sm text-left border-collapse">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
            <tr>
              <th className="p-4 border">ID</th>
              <th className="p-4 border">WO ID</th>
              <th className="p-4 border">Technician</th>
              <th className="p-4 border">Note</th>
              <th className="p-4 border">Created At</th>
              <th className="p-4 border">Before</th>
              <th className="p-4 border">After</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <td className="p-4 border">{report.id}</td>
                <td className="p-4 border">{report.work_order_id}</td>
                <td className="p-4 border">{report.technician}</td>
                <td className="p-4 border">{report.note}</td>
                <td className="p-4 border">{new Date(report.created_at).toLocaleString('id-ID')}</td>
                <td className="p-4 border">
                  <img src={report.before_photo_url} alt="Before" className="w-28 rounded shadow" />
                </td>
                <td className="p-4 border">
                  <img src={report.after_photo_url} alt="After" className="w-28 rounded shadow" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
