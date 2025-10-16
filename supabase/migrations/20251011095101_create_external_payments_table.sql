-- Table des paiements
CREATE TABLE IF NOT EXISTS external_payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number text NOT NULL,
    amount decimal(10,2) NOT NULL,
    payment_date timestamptz NOT NULL,
    synched boolean default false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Policies pour receivables
CREATE POLICY "Users can view their external payments"
    ON external_payments FOR SELECT
    TO authenticated
    USING (
        invoice_number IN (
            SELECT invoice_number FROM receivables RIGHT JOIN clients ON receivables.client_id = clients.id WHERE clients.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert receivables for their external payments"
    ON external_payments FOR INSERT
    TO authenticated
    WITH CHECK (
        invoice_number IN (
            SELECT invoice_number FROM receivables RIGHT JOIN clients ON receivables.client_id = clients.id WHERE clients.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their external payments"
    ON external_payments FOR UPDATE
    TO authenticated
    USING (
        invoice_number IN (
            SELECT invoice_number FROM receivables RIGHT JOIN clients ON receivables.client_id = clients.id WHERE clients.owner_id = auth.uid()
        )
    );

CREATE OR REPLACE FUNCTION increment_receivable_paid_amount(
  p_invoice_number text,
  p_amount numeric
)
RETURNS void AS $$
BEGIN
  UPDATE receivables
  SET paid_amount = paid_amount + p_amount
  WHERE invoice_number = p_invoice_number;
  UPDATE receivables
  SET status ='paid'
  WHERE paid_amount >= amount;
END;
$$ LANGUAGE plpgsql;

alter publication supabase_realtime
add table receivables;

select
  cron.schedule(
    'invoke-function-every-5-minutes',
    '*/5 * * * *', -- every 5 minutes
    $$
    select
      net.http_post(
          url:= (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/sync-external-payments',
          headers:=jsonb_build_object(
            'Content-type', 'application/json',
            'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key')
          ),
          body:=concat('{"time": "', now(), '"}')::jsonb
      ) as request_id;
    $$
  );
