import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Users } from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import ClientDetailModal from "../clients/ClientDetailModal";

const OverdueInvoices = () => {
  const [topDebtors, setTopDebtors] = useState<{ id: string; name: string; code: string; amount: number }[]>([]);
  type Debtor = { id: string; name: string; code: string; amount: number } | null;
const [selectedDebtor, setSelectedDebtor] = useState<Debtor>(null);
  const [isOpen, setIsOpen] = useState(false);
  type ClientDetails = { id?: string; [key: string]: any } | null;
const [clientDetails, setClientDetails] = useState<ClientDetails>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Handler pour chaque débiteur
  const handleDebtorClick = async (clientId: string) => {
  try {
    console.log('Client id cliqué:', clientId);
    console.log('Recherche du client par id:', clientId);
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("id", clientId)
      .single();

    if (error) {
      console.error('Erreur Supabase:', error);
      setClientDetails(null);
      setModalOpen(true);
      return;
    }
    if (data) {
      console.log('Client trouvé pour la modale:', data);
      setClientDetails(data);
      setModalOpen(true);
    } else {
      console.warn('Aucun client trouvé pour cet id:', clientId);
      setClientDetails(null);
      setModalOpen(true);
    }
  } catch (err) {
    console.error('Exception lors du chargement du client:', err);
    setClientDetails(null);
    setModalOpen(true);
  }
};

  const [loading, setLoading] = useState<boolean>(true);
  const openModal = (debtor: { id: string; name: string; code: string; amount: number }) => {
    setSelectedDebtor(debtor);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedDebtor(null);
  };

  useEffect(() => {
    const fetchOverdues = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Utilisateur non authentifié");

      const userEmail = user.email;

      // 1. Récupère les IDs des utilisateurs qui ont invité l'utilisateur actuel
      const { data: invitedByData, error: invitedByError } = await supabase
        .from("invited_users")
        .select("invited_by")
        .eq("invited_email", userEmail);

      if (invitedByError) throw invitedByError;

      const invitedByIds = invitedByData.map((entry) => entry.invited_by);

      // 2. Inclure l'utilisateur actuel dans les IDs à filtrer
      const allOwnerIds = [user.id, ...invitedByIds];

      const { data, error } = await supabase
        .from("receivables")
        .select(
          `
          amount,
          paid_amount,
          client_id,
          clients(id, company_name, client_code)
        `
        )
        .in("owner_id", allOwnerIds);

      if (error) {
        console.error("Erreur lors du chargement:", error);
        return;
      }

      const aggregated: Record<string, { id: string; name: string; code: string; amount: number }> = {};

      for (const rec of data) {
        // Log structure for debugging
        console.log('Receivable record:', rec);
        // rec.clients est l'objet joint, rec.client_id est le champ FK
        // rec.clients est l'objet joint (doit être un objet, pas un tableau)
        const clientArr = rec.clients as { id: string; company_name: string; client_code: string }[];
const client = Array.isArray(clientArr) ? clientArr[0] : clientArr;
        if (!client || !client.id) continue;
        const key = client.client_code;
        if (!key) continue;

        const due = rec.amount - rec.paid_amount;

        if (!aggregated[key]) {
          aggregated[key] = {
            id: client.id, // id unique du client
            name: client.company_name,
            code: client.client_code,
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

      setTopDebtors(sorted as { id: string; name: string; code: string; amount: number }[]);
      setLoading(false);
    };

    fetchOverdues();
  }, []);

  return (
    <div className="rounded-2xl p-6 max-h-[350px] overflow-y-auto">
      <div className="flex items-center space-x-2 mb-4">
        <div className="bg-blue-100 p-3 rounded-lg">
          <Users className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="text-[20px] font-bold text-black mb-4 mt-4">
          Principaux débiteurs
        </h2>
      </div>

      {loading ? (
        <div
          className="flex justify-center align-center items-center"
          style={{ height: "100px" }}
        >
          <span className="animate-spin border-t-4 border-blue-600 rounded-full h-8 w-8"></span>
          <p className="text-gray-600 ml-3 font-semibold">
            Chargement des données...
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {topDebtors.map((debtor, i) => (
            <li key={debtor.id}>
              <button
                onClick={() => {
                  console.log('Client id cliqué:', debtor.id);
                  handleDebtorClick(debtor.id);
                }}
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
      )}
      {modalOpen && (
        clientDetails && clientDetails.id ? (
          <ClientDetailModal
            client={clientDetails}
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
          />
        ) : (
          <Dialog open={modalOpen} onClose={() => setModalOpen(false)} className="fixed inset-0 z-50">
            <div className="min-h-screen flex items-center justify-center px-4">
              <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
              <div className="relative z-50 bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
                <h2 className="text-xl font-bold text-red-600 mb-4">Erreur lors du chargement du client</h2>
                <p className="text-gray-700 mb-6">Impossible d'afficher les détails du client. Veuillez réessayer ou contacter le support.</p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md shadow transition-colors" onClick={() => setModalOpen(false)}>Fermer</button>
              </div>
            </div>
          </Dialog>
        )
      )}

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
