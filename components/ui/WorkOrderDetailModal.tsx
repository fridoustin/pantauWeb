"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function WorkOrderDetailModal({ open, onClose, workOrder }: {
  open: boolean;
  onClose: () => void;
  workOrder: any;
}) {
  if (!workOrder) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{workOrder.title}</DialogTitle>
          <DialogDescription>Status: {workOrder.status}</DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-2 text-sm text-gray-700">
          <p><strong>Created at:</strong> {workOrder.created_at || "-"}</p>
          <p><strong>Technician:</strong> {workOrder.created_at || "-"}</p>
          <p><strong>Description:</strong> {workOrder.description || "No Description."}</p>
          <p><strong>Start at:</strong> {workOrder.start_time || "-"}</p>
          <p><strong>End at:</strong> {workOrder.end_time || "-"}</p>
          <p><strong>Updated at:</strong> {workOrder.updated_at || "-"}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
