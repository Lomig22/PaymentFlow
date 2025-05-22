// components/ModalAbonnementExpiré.tsx
import React from "react";
import { motion } from "framer-motion";

export default function ModalAbonnementExpiré({ visible, onClose }: { visible: boolean, onClose: () => void }) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white rounded-xl p-6 max-w-sm w-full shadow-lg text-center"
      >
        <h2 className="text-xl font-bold text-red-600 mb-4">Abonnement expiré</h2>
        <p className="mb-6 text-gray-700">Votre abonnement a expiré. Veuillez le renouveler pour continuer à utiliser cette fonctionnalité.</p>
        <button
          onClick={onClose}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Fermer
        </button>
      </motion.div>
    </div>
  );
}
