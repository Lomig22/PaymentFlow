import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Users } from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import ClientDetailModal from "../clients/ClientDetailModal";

const OverdueInvoices = () => {
  const [topDebtors, setTopDebtors] = useState([]);
  const [selectedDebtor, setSelectedDebtor] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [clientDetails, setClientDetails] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = (debtor) => {
    setSelectedDebtor(debtor);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedDebtor(null);
  };

  useEffect(() => {
    const fetchOverdues = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("receivables")
        .select(
          `
          amount,
          paid_amount,
          client:clients(company_name, client_code)
        `
        )
        .eq("owner_id", user?.id);

      if (error) {
        console.error("Erreur lors du chargement:", error);
        return;
      }

      const aggregated = {};

      for (const rec of data) {
        const key = rec.client?.client_code;
        if (!key) continue;

        const due = rec.amount - rec.paid_amount;

        if (!aggregated[key]) {
          aggregated[key] = {
            name: rec.client.company_name,
            code: rec.client.client_code,
            amount: due,
          };
        } else {
          aggregated[key].amount += due;
        }
      }

      const sorted = Object.values(aggregated)
        .filter((d) => d.amount > 0)
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 6);

      setTopDebtors(sorted);
    };

    fetchOverdues();
  }, []);

  const handleDebtorClick = async (clientCode) => {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("client_code", clientCode)
      .single();

    if (!error && data) {
      setClientDetails(data);
      setModalOpen(true);
    }
  };

  return (
    <div className="rounded-2xl p-6 max-h-[350px] overflow-y-auto">
      <div className="flex items-center space-x-2 mb-4">
        <div className="bg-blue-100 p-3 rounded-lg">
          <Users className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">
          Principaux débiteurs
        </h2>
      </div>

      <ul className="divide-y divide-gray-200">
        {topDebtors.map((debtor, i) => (
          <li key={i}>
            <button
              onClick={() => handleDebtorClick(debtor.code)}
              className="flex items-center justify-between w-full px-2 py-3 rounded-md hover:bg-blue-50 transition group"
            >
              <div className="text-sm font-semibold text-gray-800 group-hover:text-blue-600">
                {debtor.name}
              </div>
              <div className="text-sm font-medium text-gray-800 group-hover:text-blue-600">
                {debtor.amount.toLocaleString("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                  minimumFractionDigits: 0,
                })}
                <span className="text-gray-900 ml-4">›</span>
              </div>
            </button>
          </li>
        ))}
      </ul>

      <ClientDetailModal
        client={clientDetails}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      {/* Modal */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all">
                  <Dialog.Title className="text-lg font-medium text-gray-900">
                    Détails du débiteur
                  </Dialog.Title>
                  {selectedDebtor && (
                    <div className="mt-4 space-y-2">
                      <p>
                        <strong>Nom :</strong> {selectedDebtor.name}
                      </p>
                      <p>
                        <strong>Code client :</strong> {selectedDebtor.code}
                      </p>
                      <p>
                        <strong>Montant dû :</strong>{" "}
                        {selectedDebtor.amount.toLocaleString("fr-FR", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </p>
                    </div>
                  )}
                  <div className="mt-6">
                    <button
                      onClick={closeModal}
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Fermer
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default OverdueInvoices;
