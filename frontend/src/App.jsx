import React from 'react'
import InvoiceList from './components/InvoiceList'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <h1 className="text-3xl font-bold my-6">💼 Payment Flow × Sage</h1>
      <InvoiceList />
    </div>
  )
}
