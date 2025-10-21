import React, { useState } from 'react'
import axios from 'axios'

export default function PaymentButton({ invoiceId, amount, currency = 'EUR' }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handlePay = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await axios.post('/api/payments/create', { invoiceId, amount, currency })
      setResult(data)
    } catch (e) {
      setError(e?.response?.data?.error || e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handlePay}
        disabled={loading}
        className={`px-3 py-1.5 rounded-md text-white ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        {loading ? 'Traitement…' : 'Payer via Sage'}
      </button>
      {error && <span className="text-sm text-red-600">{error}</span>}
      {result && <span className="text-sm text-green-700">Paiement initié</span>}
    </div>
  )
}
