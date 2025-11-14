create table if not exists facturation_settings(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now(),
    entreprise text,
    adresse text,
    siret text,
    owner_id uuid
);

ALTER TABLE facturation_settings ADD CONSTRAINT facturation_settings_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id);

ALTER TABLE facturation_settings ADD CONSTRAINT facturation_settings_owner_id_key UNIQUE (owner_id);

