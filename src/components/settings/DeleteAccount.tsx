import { useState } from "react";
import { supabase } from '../../lib/supabase';
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";


const DeleteAccount = () => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleDelete = async () => {
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
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Supprimer votre compte</h2>
      <p className="mb-2">Cette action est irréversible. Entrez votre mot de passe pour confirmer.</p>

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
        className="bg-red-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Suppression en cours..." : "Supprimer mon compte"}
      </button>
    </div>
  );
};

export default DeleteAccount;
