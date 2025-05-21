import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { sendEmail } from "../../lib/email";
import { getEmailSettings } from "../../lib/reminderService";

function MemberList() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const fetchUserInfo = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id);
      setUserEmail(user?.email)
    };
    fetchUserInfo();
  }, []);
  const fetchMembers = async () => {
    setSuccessMessage("");

    const { data, error } = await supabase
      .from("invited_users")
      .select("id, invited_email")
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

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviting(true);
    setErrorMessage("");
    setSuccessMessage("");

    const emailSettings = await getEmailSettings(userId);
    if (!emailSettings) {
      return;
    }
    const emailSent = sendEmail(
      emailSettings,
      userEmail || "",
      "Invitation à un espace de travaille payment-flow",
      "Vous êtes invités à rejoindre un espace de travail payment-flow!\n Connectez-vous ou créez un compte au:\n https://lomig.onirtech.com/login"
    );
    if (!emailSent) {
      alert("invitation par email échouée!");
    }
    setInviting(false);
  };

  return (
    <div className="space-y-4">
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
        {errorMessage && <p className="text-red-600">{errorMessage}</p>}
        {successMessage && <p className="text-green-600">{successMessage}</p>}
      </form>

      <div>
        <h3 className="text-md font-medium">Membres invités :</h3>
        {loading ? (
          <p>Chargement des membres...</p>
        ) : members.length === 0 ? (
          <p>Aucun membre.</p>
        ) : (
          <ul className="list-disc list-inside">
            {members.map((m) => (
              <li key={m.id}>{m.email}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default MemberList;
