import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Client } from "../../types/database";
import { X, Upload, FileUp } from "lucide-react";

interface ReceivableFormProps {
  onClose: () => void;
  onReceivableAdded: (receivable: any) => void;
  preselectedClient?: Client;
}

export default function ReceivableForm({
  onClose,
  onReceivableAdded,
  preselectedClient,
}: ReceivableFormProps) {
  const navigate = useNavigate();
  const location = useLocation();
  // Parse query params for client_name and client_email
  const queryParams = React.useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      client_name: params.get("client_name") || "",
      client_email: params.get("client_email") || "",
    };
  }, [location.search]);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isNewClient, setIsNewClient] = useState(false);
  const [clientEmails, setClientEmails] = useState<string[]>(
    preselectedClient?.email ? preselectedClient.email.split(",") : []
  );
  // Patch email UX moderne : bouton pour ajouter un nouvel email
  const [selectedEmail, setSelectedEmail] = useState("");
  const [showNewEmailInput, setShowNewEmailInput] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    client_id: preselectedClient?.id || "",
    invoice_number: "",
    amount: "",
    paid_amount: "",
    document_date: "",
    due_date: "",
    installment_number: "",
    status: "pending",
    invoice_pdf_url: "",
    notes: "",
    email: preselectedClient?.email?.split(",")[0] || queryParams.client_email || "",
  });
  const [newClientData, setNewClientData] = useState({
    company_name: preselectedClient?.company_name || queryParams.client_name || "",
    email: preselectedClient?.email || queryParams.client_email || "",
    phone: "",
    address: "",
    postal_code: "",
    city: "",
    country: "France",
    needs_reminder: true,
    client_code: "", //Jet client_code
  });

  // Effet pour mettre à jour les champs si queryParams changent et pas de client sélectionné
  useEffect(() => {
    if (!preselectedClient) {
      setFormData((prev) => ({
        ...prev,
        email: queryParams.client_email || "",
      }));
      setNewClientData((prev) => ({
        ...prev,
        company_name: queryParams.client_name || "",
        email: queryParams.client_email || "",
      }));
    }
  }, [queryParams.client_name, queryParams.client_email, preselectedClient]);
  const showError = (message: string) => {
    setError(message);
    setTimeout(() => {
      setError(null);
    }, 3000);
  };

  useEffect(() => {
    if (!preselectedClient) {
      fetchClients();
    } else {
      setClients([preselectedClient]);
    }
  }, [preselectedClient]);

  // Pré-sélection automatique du client et de l’email depuis les query params
  useEffect(() => {
    if (!preselectedClient && clients.length > 0 && (queryParams.client_name || queryParams.client_email)) {
      // Trouver le client par nom ou email (tolérance sur le nom)
      const foundClient = clients.find(
        c => (queryParams.client_name && c.company_name?.toLowerCase().trim() === queryParams.client_name.toLowerCase().trim()) ||
             (queryParams.client_email && c.email?.split(',').map(e => e.trim()).includes(queryParams.client_email))
      );
      if (foundClient) {
        setFormData((prev) => ({
          ...prev,
          client_id: foundClient.id,
          email: queryParams.client_email || foundClient.email?.split(',')[0] || "",
        }));
        setClientEmails(foundClient.email?.split(',').map(e => e.trim()) || []);
      }
    }
  }, [clients, preselectedClient, queryParams.client_name, queryParams.client_email]);

  const fetchClients = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non authentifié");

      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("owner_id", user.id)
        .order("company_name");

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des clients:", error);
      showError("Impossible de charger la liste des clients");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Utilisateur non authentifié");
      }

      let clientId = formData.client_id;

      // Upload the PDF file
      let invoicePath = "";
      if (uploadedFile) {
        const { error: uploadError } = await supabase.storage
          .from("invoices")
          .upload(`${user.id}/${uploadedFile.name}`, uploadedFile, {
            upsert: true,
          });

        if (uploadError) {
          throw uploadError;
        }
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        invoicePath = `${supabaseUrl}/storage/v1/object/public/invoices/${user.id}/${uploadedFile.name}`;
      }
      // Si c'est un nouveau client, le créer d'abord
      if (isNewClient) {
        const { data: newClient, error: clientError } = await supabase
          .from("clients")
          .insert([
            {
              ...newClientData,
              owner_id: user.id,
            },
          ])
          .select()
          .single();

        if (clientError) throw clientError;
        clientId = newClient.id;
        // Mettre à jour l'email dans formData avec l'email du nouveau client
        formData.email = newClientData.email;
      } else {
        // Mettre à jour le client existant pour activer les relances
        await supabase
          .from("clients")
          .update({ needs_reminder: true })
          .eq("id", clientId);
      }

      // Vérifier si la date d'échéance est dépassée
      const dueDate = new Date(formData.due_date);
      const today = new Date();
      const isOverdue = dueDate < today;
      // Étape 1 : Calculer la somme actuelle des receivables
      const { data: totalData, error: totalError } = await supabase
        .from("receivables")
        .select("amount")
        .eq("owner_id", user.id);

      if (totalError) {
        console.error("Erreur lors du calcul du total :", totalError);
        return;
      }

      // Étape 2 : Additionner les montants
      const currentTotal = totalData.reduce(
        (sum, item) => sum + (item.amount ? parseFloat(item.amount) : 0),
        0
      );

      // Étape 3 : Ajouter le nouveau montant
      const newAmount = parseFloat(formData.amount);
      const updatedTotalAmount = currentTotal + newAmount;

      console.log("Total après ajout du nouveau receivable :", updatedTotalAmount);
      const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('user_id', user.id)
      .limit(1)
      .single();
  
    if (subscriptionError || !subscription) {
      showError("Impossible de récupérer le type d'abonnement.");
      return;
    }
  
    // 2. Définir les limites selon les plans
    const planLimits = {
      free: 25000,
      basic: 50000,
      pro: 200000,
      company: Infinity,
    };
    const userPlan = subscription.plan;
const maxOverDues = planLimits[userPlan as keyof typeof planLimits] ?? 0;


if (updatedTotalAmount >= maxOverDues) {
	setError(`Limite atteinte : votre plan "${userPlan}" permet de gérer jusqu'à ${maxOverDues} Euro d'encours`)
  return
  //showError(`Limite atteinte : votre plan "${userPlan}" permet de gérer jusqu'à ${maxOverDues} Euro d'encours`);
}


      // Déterminer l'email à utiliser (nouveau champ prioritaire, sinon select)
    const emailToUse = isNewClient
      ? newClientData.email.trim()
      : (newEmail.trim() || selectedEmail.trim());
    if (!emailToUse) {
      showError("Veuillez renseigner une adresse email.");
      setLoading(false);
      return;
    }

    // Si une nouvelle adresse email a été saisie, l'ajouter au client si non déjà présente
    if (newEmail.trim() && clientId) {
      // Récupérer les emails actuels du client
      const { data: clientData, error: clientFetchError } = await supabase
        .from("clients")
        .select("email")
        .eq("id", clientId)
        .single();
      if (!clientFetchError && clientData) {
        const oldEmails = (clientData.email || "").split(",").map((e: string) => e.trim()).filter(Boolean);
        if (!oldEmails.includes(newEmail.trim())) {
          const updatedEmails = [...oldEmails, newEmail.trim()].join(",");
          await supabase
            .from("clients")
            .update({ email: updatedEmails })
            .eq("id", clientId);
        }
      }
    }

    // Ajouter la nouvelle créance
    const { data, error } = await supabase
      .from("receivables")
      .insert([
        {
          ...formData,
          email: emailToUse,
          client_id: clientId,
          amount: parseFloat(formData.amount),
          paid_amount: formData.paid_amount
            ? parseFloat(formData.paid_amount)
            : null,
          document_date: formData.document_date || null,
          installment_number: formData.installment_number || null,
          status: isOverdue ? "late" : "pending",
          owner_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          invoice_pdf_url: invoicePath ? invoicePath : undefined,
          automatic_reminder:false,
        },
      ])
      .select("*, client:clients(*)")
      .single();

      if (error) throw error;

      if (data) {
        onReceivableAdded(data);
        navigate('/receivables');
      }
    } catch (error: any) {
      console.error("Erreur lors de l'ajout de la créance:", error);
      showError("Impossible d'ajouter la créance");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectClient = (clientId: string) => {
    setFormData({ ...formData, client_id: clientId });
    setClientEmails(
      clients.find((client) => client.id === clientId)?.email.split(",") || []
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 overflow-y-scroll">
      <div className="min-h-screen py-8 px-4 flex items-center justify-center">
        <div className="relative bg-white rounded-lg shadow-xl p-8 w-full max-w-xl mx-auto">
            <button
              onClick={() => {
                console.log('Fermeture modal demandée');
                onClose();
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>

          <h2 className="text-2xl font-bold mb-6">Nouvelle créance</h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client *
              </label>
              {!preselectedClient && (
                <div className="flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setIsNewClient(false)}
                    className={`px-3 py-1 rounded-md ${
                      !isNewClient
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    Client existant
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsNewClient(true)}
                    className={`px-3 py-1 rounded-md ${
                      isNewClient
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    Nouveau client
                  </button>
                </div>
              )}

              {!isNewClient ? (
                <div className="flex flex-col space-y-6">
                  <select
                    required
                    value={formData.client_id}
                    onChange={(e) => handleSelectClient(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!!preselectedClient}
                  >
                    <option value="">Sélectionner un client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.company_name}
                      </option>
                    ))}
                  </select>
                  <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Email *
  </label>
  <select
    value={selectedEmail}
    onChange={e => setSelectedEmail(e.target.value)}
    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    disabled={showNewEmailInput}
  >
    <option value="">Sélectionner un email</option>
    {clientEmails.map((email) => (
      <option key={email} value={email}>
        {email}
      </option>
    ))}
  </select>
  {!showNewEmailInput && (
    <button
      type="button"
      className="mt-2 text-blue-600 hover:underline text-sm"
      onClick={() => setShowNewEmailInput(true)}
    >
      + Ajouter une nouvelle adresse email
    </button>
  )}
  {showNewEmailInput && (
    <div className="mt-2 flex gap-2 items-center">
      <input
        type="email"
        placeholder="Nouvelle adresse email"
        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        value={newEmail}
        onChange={e => setNewEmail(e.target.value)}
      />
      <button
        type="button"
        className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200"
        onClick={() => {
          setShowNewEmailInput(false);
          setNewEmail("");
        }}
        title="Annuler"
      >
        Annuler
      </button>
    </div>
  )}
  <p className="text-xs text-gray-500 mt-1">
    L'email renseigné ici sera utilisé pour la créance, même si différent de celui enregistré dans la fiche client.
  </p>
</div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de l'entreprise *
                    </label>
                    <input
                      type="text"
                      required
                      value={newClientData.company_name}
                      onChange={(e) =>
                        setNewClientData({
                          ...newClientData,
                          company_name: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={newClientData.email}
                      onChange={(e) =>
                        setNewClientData({
                          ...newClientData,
                          email: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={newClientData.phone}
                      onChange={(e) =>
                        setNewClientData({
                          ...newClientData,
                          phone: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Code client *
                    </label>
                    <input
                      type="text"
                      required
                      value={newClientData.client_code}
                      onChange={(e) =>
                        setNewClientData({
                          ...newClientData,
                          client_code: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse
                    </label>
                    <input
                      type="text"
                      value={newClientData.address}
                      onChange={(e) =>
                        setNewClientData({
                          ...newClientData,
                          address: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Code postal
                      </label>
                      <input
                        type="text"
                        value={newClientData.postal_code}
                        onChange={(e) =>
                          setNewClientData({
                            ...newClientData,
                            postal_code: e.target.value,
                          })
                        }
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ville
                      </label>
                      <input
                        type="text"
                        value={newClientData.city}
                        onChange={(e) =>
                          setNewClientData({
                            ...newClientData,
                            city: e.target.value,
                          })
                        }
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de facture *
              </label>
              <input
                type="text"
                required
                value={formData.invoice_number}
                onChange={(e) =>
                  setFormData({ ...formData, invoice_number: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant (€) *
              </label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant Réglé (€) *
              </label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                value={formData.paid_amount}
                onChange={(e) =>
                  setFormData({ ...formData, paid_amount: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date pièce
              </label>
              <input
                type="date"
                value={formData.document_date}
                onChange={(e) =>
                  setFormData({ ...formData, document_date: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date d'échéance *
              </label>
              <input
                type="date"
                required
                value={formData.due_date}
                onChange={(e) =>
                  setFormData({ ...formData, due_date: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro échéance
              </label>
              <input
                type="text"
                value={formData.installment_number}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    installment_number: e.target.value,
                  })
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commentaire
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    notes: e.target.value,
                  })
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PDF de la facture
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {uploadedFile ? (
                    <>
                      <FileUp className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 flex gap-2 items-center">
                          <span>{uploadedFile.name}</span>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setUploadedFile(null);
                            }}
                          >
                            <X className="h-6 w-6" />
                          </button>
                        </label>
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                        >
                          <span>Télécharger un fichier</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept=".pdf"
                            onChange={(e) => {
                              // Logique de téléchargement du fichier à implémenter
                              setUploadedFile(e.target.files?.[0] || null);
                            }}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">PDF jusqu'à 10MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/receivables')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
