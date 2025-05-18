import { useEffect } from 'react';
import { supabase } from './supabase';
const useEnsureEmailSettings = () => {
  useEffect(() => {
    const ensureEmailSettings = async () => {
        const {
            data: { session },
          } = await supabase.auth.getSession();
          const user = session?.user;
          const userId=user?.id
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
            provider_type: 'reset_defaults',
            smtp_username: 'no-reply@payment-flow.fr',
            smtp_password: 'donthavetosaveit',
            smtp_server: 'my.smtpserver.com',
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
