import React from "react";

interface UnsavedChangesModalProps {
  open: boolean;
  onStay: () => void;
  onLeave: () => void;
}

const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({ open, onStay, onLeave }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <h2 className="text-lg font-bold mb-4 text-gray-900">Modifications non enregistrées</h2>
        <p className="mb-6 text-gray-700">
          Vous avez des modifications non enregistrées. Voulez-vous vraiment quitter cette page ?<br />
          Vos modifications seront perdues si vous continuez.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
            onClick={onStay}
          >
            Rester
          </button>
          <button
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
            onClick={onLeave}
          >
            Quitter sans enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnsavedChangesModal;
