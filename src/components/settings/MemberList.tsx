import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { sendEmail } from "../../lib/email";
import { getEmailSettings } from "../../lib/reminderService";
import Swal from "sweetalert2";

function MemberList() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");
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
  const handleDeleteConfirmation = async (id) => {
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
  const handleDelete = async (id) => {
    const { error } = await supabase
      .from("invited_users")
      .delete()
      .eq("id", id);
  
    if (error) {
      showError("Erreur lors de la suppression du membre:\n"+ error);
    } else {
      fetchMembers(); // Rafraîchir la liste
    }
  };
  useEffect(() => {
    const fetchUserInfo = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id);
      setUserEmail(user?.email);
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
 
  
  useEffect(() => {
    if (userId) fetchMembers();
  }, [userId]);

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviting(true);
 

    if (!isValidEmail(email)) {
      showError("Adresse email invalide.");
      setInviting(false);
      return;
    }

    // Vérifie s'il est déjà invité
    const { data: existing } = await supabase
      .from("invited_users")
      .select("*")
      .eq("invited_email", email)
      .eq("invited_by", userId);

    if (existing.length > 0) {
      showError("Cet email a déjà été invité.");
      setInviting(false);
      return;
    }

    // Insertion dans la base de données
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

    // Envoi de l'email
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
              <a href="https://lomig.onirtech.com/login" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                 Rejoindre maintenant
              </a>
            </div>
            <p>Ou copiez ce lien dans votre navigateur :</p>
            <p><a href="https://lomig.onirtech.com/login" style="color: #2563eb;">https://lomig.onirtech.com/login</a></p>
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
      setEmail(""); // Réinitialise le champ
      fetchMembers(); // Rafraîchit la liste
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
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
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
                    className="text-red-600 hover:underline"
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
