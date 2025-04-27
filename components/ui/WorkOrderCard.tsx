"use client";

import { Button } from "@/components/ui/button";

interface WorkOrderCardProps {
  data: {
    id: string;
    title: string;
    status: string;
  };
  onViewDetail: (data: any) => void;
}

export default function WorkOrderCard({ data, onViewDetail }: WorkOrderCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow hover:shadow-lg transition-all">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{data.title}</h3>
      <p className="text-sm text-gray-700 dark:text-gray-300">Status: {data.status}</p>
      <button
        onClick={() => onViewDetail(data)}
        className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
      >
        View Detail
      </button>
    </div>
  );
}
