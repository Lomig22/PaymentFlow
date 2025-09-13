import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { sendEmail } from "../../lib/email";
import { getEmailSettings } from "../../lib/reminderService";
import { useAbonnement } from "../context/AbonnementContext";
import Swal from "sweetalert2";

function MemberList() {
  const { checkAbonnement } = useAbonnement();
  type Member = {
  id: string;
  invited_email: string;
  created_at: string;
};
const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const handleClick = () => {
    if (!checkAbonnement()) return;
   // console.log("Action autorisée !");
    return true;
  };
  const [success, setSuccess] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);




  const showError = (message: string) => {
    setError(message);
    setTimeout(() => {
      setError(null);
    }, 3000);
  };
  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => {
      setSuccess(null);
    }, 3000);
  };
  const handleDeleteConfirmation = async (id: string) => {
    // Confirmation avant la suppression
    const result = await Swal.fire({
      title: "Es-tu sûr ?",
      text: "Cette action retirera ce membre de la liste des utilisateurs invités!",
      showCancelButton: true,
      buttonsStyling: false,
      customClass: {
        confirmButton:
          "bg-red-600 text-white px-4 py-2 rounded mr-2 hover:bg-red-700",
        cancelButton:
          "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700",
      },
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    });

    if (result.isConfirmed) {
      await handleDelete(id);
      Swal.fire({
        title: "Supprimé !",
        text: "Les clients sélectionnés ont été supprimés.",
        icon: "success",
        buttonsStyling: false,
        customClass: {
          confirmButton:
            "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700",
          icon: "text-blue-500",
        },
        confirmButtonText: "OK",
      });
    }
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id ?? "");
      setUserEmail(user?.email ?? "");
    };
    fetchUserInfo();
  }, []);

  const fetchMembers = async () => {

    const { data, error } = await supabase
      .from("invited_users")
      .select("id, invited_email, created_at")
      .eq("invited_by", userId);

    if (error) {
      console.error("Erreur lors du chargement des membres :", error);
    } else {
      setMembers(data);
    }

    setLoading(false);
  };
  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("invited_users")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erreur lors de la suppression :", error);
    } else {
      fetchMembers(); // Rafraîchir la liste
    }
  };

  useEffect(() => {
    if (userId) fetchMembers();
  }, [userId]);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const allowed = handleClick();
    if (!allowed) return;
    setInviting(true);
  
    if (!isValidEmail(email)) {
      showError("Adresse email invalide.");
      setInviting(false);
      return;
    }
  
    // 1. Récupérer le plan d’abonnement
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('user_id', userId)
      .limit(1)
      .single();
  
    if (subscriptionError || !subscription) {
      showError("Impossible de récupérer le type d'abonnement.");
      setInviting(false);
      return;
    }
  
    // 2. Définir les limites selon les plans
    const planLimits = {
      free: 0,
      basic: 1,
      pro: 3,
      company: 10,
    };
  
    const userPlan: keyof typeof planLimits = (subscription?.plan as keyof typeof planLimits) || "free";
    const maxInvites = planLimits[userPlan] ?? 0;
  
    // 3. Compter les utilisateurs déjà invités
    const { data: invitedList, error: countError } = await supabase
      .from("invited_users")
      .select("*", { count: "exact", head: false })
      .eq("invited_by", userId);
  
    if (countError) {
      showError("Erreur lors du comptage des utilisateurs invités.");
      setInviting(false);
      return;
    }
  
    if (invitedList.length >= maxInvites) {
      showError(`Limite atteinte : votre plan "${userPlan}" permet d'inviter jusqu'à ${maxInvites} utilisateur(s).`);
      setInviting(false);
      return;
    }
  
    // 4. Vérifier si l’utilisateur est déjà invité
    const { data: existing } = await supabase
      .from("invited_users")
      .select("*")
      .eq("invited_email", email)
      .eq("invited_by", userId);
  
    if (existing && existing.length > 0) {
      showError("Cet email a déjà été invité.");
      setInviting(false);
      return;
    }
  
    // 5. Insertion dans la base de données
    const { error: insertError } = await supabase
      .from("invited_users")
      .insert([
        { invited_email: email, invited_by: userId }
      ]);
  
    if (insertError) {
      showError("Erreur lors de l'invitation.");
      setInviting(false);
      return;
    }
  
    // 6. Envoi de l’email
    const emailSettings = await getEmailSettings(userId);
    if (!emailSettings) {
      showError("Paramètres d’email introuvables.");
      setInviting(false);
      return;
    }
  
    const emailSent = await sendEmail(
      emailSettings,
      email || "",
      "Invitation à un espace de travail payment-flow",
            `
        <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <div style="background-color: #2563eb; color: #ffffff; padding: 16px 24px;">
              <h2 style="margin: 0; font-size: 20px;">Invitation à rejoindre Payment-Flow</h2>
            </div>
            <div style="padding: 24px; color: #111827; font-size: 16px;">
              <p>Bonjour,</p>
              <p>Vous êtes invités à rejoindre un espace de travail <strong>payment-flow</strong> !</p>
              <p>Pour accepter l'invitation, cliquez sur le bouton ci-dessous :</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://payment-flow.fr/login" 
                   style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                   Rejoindre maintenant
                </a>
              </div>
              <p>Ou copiez ce lien dans votre navigateur :</p>
              <p><a href="https://payment-flow.fr/login" style="color: #2563eb;">https://payment-flow.fr/login</a></p>
              <p style="margin-top: 30px;">Merci,<br>L’équipe Payment-Flow</p>
            </div>
          </div>
        </div>
        `
    );
  
    if (!emailSent) {
      showError("Invitation par email échouée !");
    } else {
      showSuccess("Invitation envoyée avec succès !");
      setEmail("");
      fetchMembers();
    }
  
    setInviting(false);
  };
  

  return (
    <div className="space-y-4">
              {error && <p className="fixed w-full mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center w-[550px]">{error}</p>}
        {success && <p className="fixed top-4 left-1/2 transform -translate-x-1/2 mb-4 p-4 bg-green-50 border border-green-200 rounded-md text-center text-green-700 z-50 w-[550px]">{success}</p>}
      <h2 className="text-lg font-semibold">Gestion des membres</h2>

      <form onSubmit={handleInvite} className="space-y-2">
        <label className="block">
          <span className="text-sm font-medium">Inviter un membre (email)</span>
          <input
            type="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full border border-gray-300 p-2 rounded"
          />
        </label>
        <button
          type="submit"
          disabled={inviting}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white font-medium shadow-md
                   hover:bg-blue-700 transition-all duration-300 ease-in-out
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
        >
          {inviting ? "Invitation en cours..." : "Inviter"}
        </button>

      </form>

      <div>
        <h3 className="text-md font-medium">Membres invités :</h3>
        {loading ? (
          <p>Chargement des membres...</p>
        ) : members.length === 0 ? (
          <p>Aucun membre.</p>
        ) : (<table className="w-full table-auto border border-gray-300 mt-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Email</th>
              <th className="border p-2 text-left">Invité le</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id}>
                <td className="border p-2">{m.invited_email}</td>
                <td className="border p-2">
                  {new Date(m.created_at).toLocaleString("fr-FR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </td>
                <td className="border p-2 text-center">
                  <button
                    onClick={() => handleDeleteConfirmation(m.id)}
                    className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-white font-medium shadow-md
                   hover:bg-red-700 transition-all duration-300 ease-in-out
                   focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        )}
      </div>
    </div>
  );
}

export default MemberList;
