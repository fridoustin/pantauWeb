// WorkOrderCard.tsx
'use client';

import { useState } from 'react';
import Link from "next/link";
import { Trash2 } from 'lucide-react';
import { DeleteConfirmationModal } from '../deleteConfirmationModal';

interface WorkOrderCardProps {
  data: {
    id: string;
    title: string;
    status: string;
  };
  onDelete: (id: string) => void;
}

export default function WorkOrderCard({ data, onDelete }: WorkOrderCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
    <div className="relative w-[270px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow hover:shadow-lg transition-all">
      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowDeleteModal(true);
        }}
        className="absolute top-2 right-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        aria-label="Delete work order"
      >
        <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300" />
      </button>

      {/* Card Content */}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 pr-6">
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={() => onDelete(data.id)}
      />
    </div>
  );
}