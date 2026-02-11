'use client';

import { Modal, Button } from '@/components/ui';
import { TrashIcon } from '@/components/ui/icons';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  isLoading?: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Staff Member',
  message = 'Are you sure you want to delete this staff member? This action cannot be undone.',
  isLoading = false,
}: DeleteConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center">
              <TrashIcon className="w-6 h-6 text-error" />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-neutral-700">{message}</p>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-neutral-200">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-error hover:bg-error/90"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}


