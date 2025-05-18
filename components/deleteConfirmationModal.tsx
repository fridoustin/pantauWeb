// components/ui/delete-confirmation-modal.tsx
'use client';

import * as Dialog from '@radix-ui/react-dialog';

export const DeleteConfirmationModal = ({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg focus:outline-none">
          <div className="space-y-4">
            <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
              Hapus Work Order
            </Dialog.Title>
            
            <Dialog.Description className="text-gray-600 dark:text-gray-400">
              Apakah anda yakin ingin menghapus work order ini? Aksi ini tidak dapat dibatalkan.
            </Dialog.Description>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onOpenChange(false);
                }}
                className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};