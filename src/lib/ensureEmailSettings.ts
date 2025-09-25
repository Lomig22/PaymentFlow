import { useEffect } from 'react';
import { supabase } from './supabase';
const useEnsureEmailSettings = () => {
  useEffect(() => {
    const ensureEmailSettings = async () => {
        // Vérifie l'utilisateur côté serveur pour éviter d'agir avec une session invalide
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id ?? null;
      if (!userId) return;

      // Vérifie si une configuration existe déjà
      const { data, error: fetchError } = await supabase
        .from('email_settings')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Erreur de récupération:', fetchError);
        return;
      }

      if (!data) {
        // Insère uniquement si aucune configuration n’existe
        const { error: insertError } = await supabase
          .from('email_settings')
          .insert({
            user_id: userId,
            provider_type: 'platform',
            smtp_username: '',
            smtp_password: '',
            smtp_server: '',
            smtp_port: 587,
            smtp_encryption: 'tls',
            email_signature: '',
            updated_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error('Erreur d’insertion:', insertError);
        }
      }
    };

    ensureEmailSettings();
  }, []);
};

export default useEnsureEmailSettings;
