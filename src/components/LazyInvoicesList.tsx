import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface Invoice {
  id: string;
  amount: number;
  client: string;
}

const PAGE_SIZE = 20;

export default function LazyInvoicesList() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase
      .from("invoices")
      .select("id, amount, client")
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
      .then(({ data, error }) => {
        if (!error && data) {
          setInvoices((prev) => [...prev, ...data]);
          setHasMore(data.length === PAGE_SIZE);
        } else {
          setHasMore(false);
        }
        setLoading(false);
      });
  }, [page]);

  return (
    <div>
      <h2>Liste paginée des factures</h2>
      <ul>
        {invoices.map((inv) => (
          <li key={inv.id}>
            {inv.client} — {inv.amount} €
          </li>
        ))}
      </ul>
      {hasMore && (
        <button disabled={loading} onClick={() => setPage((p) => p + 1)}>
          {loading ? "Chargement..." : "Charger plus"}
        </button>
      )}
    </div>
  );
}
