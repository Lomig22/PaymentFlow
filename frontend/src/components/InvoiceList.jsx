import React, { useEffect, useState } from 'react'
import axios from 'axios'
import PaymentButton from './PaymentButton'

export default function InvoiceList() {
  const [invoices, setInvoices] = useState([])
  const [relances, setRelances] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [invRes, relRes] = await Promise.all([
          axios.get('/api/payments/pending'),
          axios.get('/api/payments/relances'),
        ])
        setInvoices(invRes.data || [])
        setRelances(relRes.data || [])
      } catch (e) {
        setError(e?.response?.data?.error || e.message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) return <div className="p-6">Chargement…</div>
  if (error) return <div className="p-6 text-red-600">Erreur: {String(error)}</div>

  return (
    <div className="p-6 w-full max-w-3xl">
      <h2 className="text-xl font-semibold mb-4">Factures en attente</h2>
      {invoices.length === 0 && (
        <p className="mb-6">Aucune facture en attente.</p>
      )}
      {invoices.map((inv) => (
        <div key={inv.id} className="border p-3 mb-2 rounded-lg flex justify-between items-center bg-white">
          <div>
            <p className="font-medium">{inv.customer_name}</p>
            <p className="text-sm text-gray-600">Montant : {inv.amount} {inv.currency || 'EUR'} — Échéance : {inv.due_date || '-'}</p>
          </div>
          <PaymentButton invoiceId={inv.id} amount={inv.amount} currency={inv.currency || 'EUR'} />
        </div>
      ))}

      <h2 className="text-xl font-semibold mt-6 mb-4">Relances à effectuer</h2>
      {relances.length === 0 && <p>Aucune relance à envoyer 🎉</p>}
      {relances.map((r) => (
        <div key={r.id} className="border p-3 mb-2 rounded-lg bg-yellow-50">
          <p className="font-medium">{r.customer_name}</p>
          <p className="text-sm text-yellow-700">Échéance dépassée — Facture #{r.id}</p>
        </div>
      ))}
    </div>
  )
}
