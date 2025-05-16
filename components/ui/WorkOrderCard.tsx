// WorkOrderCard.tsx
'use client';

import Link from "next/link";



interface WorkOrderCardProps {
  data: {
    id: string;
    title: string;
    status: string;
  };
}

export default function WorkOrderCard({ data }: WorkOrderCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'selesai':
        return 'text-green-600 dark:text-green-400';
      case 'dalam pengerjaan':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'terkendala':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-300';
    }
  };

  return (
    <div className="w-[270px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow hover:shadow-lg transition-all">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
        {data.title}
      </h3>
      <p className={`text-sm font-medium ${getStatusColor(data.status)}`}>
        {data.status}
      </p>
      <Link
        href={`/work-order/${data.id}`}
        className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline inline-block"
      >
        View Detail
      </Link>
    </div>
  );
}
