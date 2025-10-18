import React, { useState, useEffect } from 'react';
import { AlertCircle, Save } from 'lucide-react';
import { useSupabase } from '../../app/providers/supabase-provider';

export default function NotificationSettings({ onDirtyChange }: { onDirtyChange?: (dirty: boolean) => void }) {
  const supabase = useSupabase();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    email_notifications: true,
    reminder_notifications: true,
    payment_notifications: true,
    daily_summary: false,
    weekly_summary: true
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const initialRef = React.useRef<typeof formData | null>(null);
  const showError = (message: string) => {
    setError(message);
    setTimeout(() => {
      setError(null);
    }, 3000);
  }
  const showSuccess = () => {
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  }
  useEffect(() => {
    loadNotificationSettings();
  }, []);

  // Met à jour l'état dirty quand le formulaire change
  useEffect(() => {
    if (!initialRef.current) return;
    try {
      setHasUnsavedChanges(
        JSON.stringify(initialRef.current) !== JSON.stringify(formData)
      );
    } catch { }
  }, [formData]);

  // Informe le parent Settings
  useEffect(() => {
    onDirtyChange?.(hasUnsavedChanges);
  }, [hasUnsavedChanges, onDirtyChange]);

  // Avertissement en fermeture/reload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Gestion de la touche Echap
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Si la modale est ouverte, la fermer
        const modal = document.querySelector('[role="dialog"]');
        if (modal) {
          modal.dispatchEvent(new Event('close'));
        }
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const loadNotificationSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setFormData(data);
        initialRef.current = {
          email_notifications: !!data.email_notifications,
          reminder_notifications: !!data.reminder_notifications,
          payment_notifications: !!data.payment_notifications,
          daily_summary: !!data.daily_summary,
          weekly_summary: !!data.weekly_summary,
        };
        setHasUnsavedChanges(false);
      } else {
        // Aucun enregistrement existant: snapshot sur les valeurs par défaut
        initialRef.current = { ...formData };
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
      showError('Impossible de charger les paramètres de notification');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: user.id,
          ...formData
        });

      if (error) throw error;
      showSuccess();
      // Snapshot après sauvegarde
      initialRef.current = { ...formData };
      setHasUnsavedChanges(false);
      onDirtyChange?.(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      showError('Impossible de sauvegarder les paramètres');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold mb-6">Paramètres de notification</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-700">
          Paramètres sauvegardés avec succès
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Notifications par email</h3>
              <p className="text-sm text-gray-500">Recevoir les notifications par email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.email_notifications}
                onChange={(e) => setFormData({ ...formData, email_notifications: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Notifications de relance</h3>
              <p className="text-sm text-gray-500">Être notifié des relances automatiques</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.reminder_notifications}
                onChange={(e) => setFormData({ ...formData, reminder_notifications: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Notifications de paiement</h3>
              <p className="text-sm text-gray-500">Être notifié des paiements reçus</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.payment_notifications}
                onChange={(e) => setFormData({ ...formData, payment_notifications: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Résumé quotidien</h3>
              <p className="text-sm text-gray-500">Recevoir un résumé quotidien des activités</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.daily_summary}
                onChange={(e) => setFormData({ ...formData, daily_summary: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Résumé hebdomadaire</h3>
              <p className="text-sm text-gray-500">Recevoir un résumé hebdomadaire des activités</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.weekly_summary}
                onChange={(e) => setFormData({ ...formData, weekly_summary: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white font-medium shadow-md
                   hover:bg-blue-700 transition-all duration-300 ease-in-out
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
          >
            <Save className="h-5 w-5 mr-2" />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
}