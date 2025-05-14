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
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "finish":
        return "text-green-600 dark:text-green-400";
      case "process":
        return "text-yellow-600 dark:text-yellow-400";
      case "trouble":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-300";
    }
  };
  return (
    <div className=" w-[270px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow hover:shadow-lg transition-all">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{data.title}</h3>
      <p className={`text-sm font-medium ${getStatusColor(data.status)}`}>{data.status}</p>
      <button
        onClick={() => onViewDetail(data)}
        className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
      >
        View Detail
      </button>
    </div>
  );
}
