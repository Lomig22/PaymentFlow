/*
  # Ajout des paramètres de relance aux clients

  1. Nouvelles colonnes
    - Templates de relance
      - reminder_template_1: template première relance
      - reminder_template_2: template deuxième relance
      - reminder_template_3: template troisième relance
      - reminder_template_final: template relance finale

  2. Valeurs par défaut
    - Templates vides par défaut
*/

-- Ajout des colonnes de template de relance
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS reminder_template_1 text,
  ADD COLUMN IF NOT EXISTS reminder_template_2 text,
  ADD COLUMN IF NOT EXISTS reminder_template_3 text,
  ADD COLUMN IF NOT EXISTS reminder_template_final text;

-- Mise à jour des politiques RLS existantes pour inclure les nouveaux champs
DROP POLICY IF EXISTS "Users can update their own clients" ON clients;
CREATE POLICY "Users can update their own clients"
ON clients FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Index pour optimiser les requêtes sur les délais de relance
CREATE INDEX IF NOT EXISTS idx_clients_reminder_delays 
ON clients (reminder_delay_1, reminder_delay_2, reminder_delay_3, reminder_delay_final);