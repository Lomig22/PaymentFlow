import { useState } from "react";
import { supabase } from '../../lib/supabase';
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAbonnement } from "../context/AbonnementContext";


const DeleteAccount = () => {
  const { checkAbonnement } = useAbonnement();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleClick = () => {
    if (!checkAbonnement()) return;
    console.log("Action autorisée !");
    return true;
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.stopPropagation();
    const allowed = handleClick();
    if (!allowed) return;
    setLoading(true);
    setErrorMsg("");

    const user = (await supabase.auth.getUser()).data.user;

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: user?.email,
      password,
    });

    if (loginError) {
      setErrorMsg("Mot de passe incorrect.");
      setLoading(false);
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const access_token = sessionData?.session?.access_token;

    if (!access_token) {
      setErrorMsg("Utilisateur non authentifié.");
      setLoading(false);
      return;
    }

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/clever-service`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify({ user_id: user?.id }),
    });

    const result = await response.json();

    if (!response.ok) {
      setErrorMsg(result.error || "Erreur lors de la suppression du compte.");
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();
    navigate("/account-deleted");
  };

  return (
    <div className="p-4 max-w-md">
      <h2 className="text-xl font-bold mb-4">Supprimer votre compte</h2>
      <p className="mb-2">
        Cette action est irréversible. Entrez votre mot de passe pour confirmer.
      </p>

      <div className="relative mb-4">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2 top-2 text-sm text-gray-600"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      {errorMsg && <p className="text-red-600 mb-2">{errorMsg}</p>}
      <button
        onClick={handleDelete}
        disabled={loading}
        className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-white font-medium shadow-md
                   hover:bg-red-700 transition-all duration-300 ease-in-out
                   focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
      >
        {loading ? "Suppression en cours..." : "Supprimer mon compte"}
      </button>
    </div>
  );
};

export default DeleteAccount;
