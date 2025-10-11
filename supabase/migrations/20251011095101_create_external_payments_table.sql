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
