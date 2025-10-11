import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, Save } from 'lucide-react';
import { useAbonnement } from "../context/AbonnementContext";
import { supabase } from '../../src/lib/supabase/supabase';

export default function ProfileSettings({ onDirtyChange }: { onDirtyChange?: (dirty: boolean) => void }) {
  const { checkAbonnement } = useAbonnement();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    company: '',
    phone: ''
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const initialRef = useRef<{ email: string; name: string; company: string; phone: string } | null>(null);
  const handleClick = () => {
    if (!checkAbonnement()) return;
    console.log("Action autorisée !");
    return true;
  };
  const showError = (message: string) => {
    setError(message);
    setTimeout(() => {
      setError(null);
    }, 3000);
  }

  useEffect(() => {
    loadProfile();
  }, []);

  // Propager l'état dirty vers le parent (Settings)
  useEffect(() => {
    onDirtyChange?.(hasUnsavedChanges);
  }, [hasUnsavedChanges, onDirtyChange]);

  // Avertissement si on quitte la page avec des changements non enregistrés
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

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          email: data.email || '',
          name: data.name || '',
          company: data.company || '',
          phone: data.phone || ''
        });
        initialRef.current = {
          email: data.email || '',
          name: data.name || '',
          company: data.company || '',
          phone: data.phone || ''
        };
        setHasUnsavedChanges(false);
        onDirtyChange?.(false);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      showError('Impossible de charger le profil');
    } finally {
      setLoading(false);
    }
  };

  const computeDirty = (next: { email: string; name: string; company: string; phone: string }) => {
    const init = initialRef.current;
    if (!init) {
      setHasUnsavedChanges(true);
      return;
    }
    const dirty =
      init.email !== next.email ||
      init.name !== next.name ||
      init.company !== next.company ||
      init.phone !== next.phone;
    setHasUnsavedChanges(dirty);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const allowed = handleClick();
    if (!allowed) return;
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...formData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setSuccess(true);
      // Réinitialise l'état dirty après sauvegarde
      initialRef.current = { ...formData };
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      showError('Impossible de sauvegarder le profil');
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
      <h2 className="text-xl font-bold mb-6">Profil utilisateur</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-700">
          Profil sauvegardé avec succès
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => {
              const next = { ...formData, email: e.target.value };
              setFormData(next);
              computeDirty(next);
            }}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom complet
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => {
              const next = { ...formData, name: e.target.value };
              setFormData(next);
              computeDirty(next);
            }}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Entreprise
          </label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => {
              const next = { ...formData, company: e.target.value };
              setFormData(next);
              computeDirty(next);
            }}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Téléphone
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => {
              const next = { ...formData, phone: e.target.value };
              setFormData(next);
              computeDirty(next);
            }}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
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