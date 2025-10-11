import { FormEventHandler, useState } from "react";
import { ExternalPayment } from "./PaymentSync";
import { startOfToday } from "date-fns";
import { supabase } from "../../lib/supabase";

function localToUTC(datetimeLocal: string): string {
    const date = new Date(datetimeLocal);
    return date.toISOString(); // converts from local to UTC
}

function utcToLocal(datetimeUTC: string): string {
    const date = new Date(datetimeUTC);
    const tzOffset = date.getTimezoneOffset() * 60000;
    const local = new Date(date.getTime() - tzOffset);
    return local.toISOString().slice(0, 16);
}

export default function ExternalPaymentForm({ payment, mode, onSubmit }: { payment: ExternalPayment, mode: "update", onSubmit: () => void } | { payment: null, mode: "create", onSubmit: () => void }) {
    //soumission

    const handleSubmit: FormEventHandler = async (e) => {
        e.preventDefault();
        const utcDate = localToUTC(formData.payment_date);
        if (payment) {
            // Update
            const { error } = await supabase
                .from("external_payments")
                .update({
                    invoice_number: formData.invoice_number,
                    amount: formData.amount,
                    payment_date: utcDate,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", payment.id);
            if (error) console.error(error);
        } else {
            // Create
            const { error } = await supabase.from("external_payments").insert({
                invoice_number: formData.invoice_number,
                amount: formData.amount,
                payment_date: utcDate,
            });
            if (error) console.error(error);
        }
        onSubmit();
    };



    const [formData, setFormData] = useState<Omit<ExternalPayment, "id">>({
        amount: payment?.amount ?? 0,
        invoice_number: payment?.invoice_number ?? "",
        // convert UTC timestamptz to local datetime string for input
        payment_date: payment
            ? utcToLocal(payment.payment_date)
            : startOfToday().toISOString().slice(0, 16),
    });
    return <form onSubmit={handleSubmit} className="space-y-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
            Numéro de facture
        </label>
        <input
            type="text"
            required
            value={formData.invoice_number}
            onChange={(e) =>
                setFormData({ ...formData, invoice_number: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <label className="block text-sm font-medium text-gray-700 mb-2">
            Montant
        </label>
        <input
            type="number"
            required
            value={formData.amount}
            onChange={(e) =>
                setFormData({ ...formData, amount: Number(e.target.value) })
            }
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <label className="block text-sm font-medium text-gray-700 mb-2">
            Date de paiement
        </label>
        <input
            type="datetime-local"
            required
            value={formData.payment_date}
            onChange={(e) =>
                setFormData({ ...formData, payment_date: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <button className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white font-medium shadow-md
                   hover:bg-blue-700 transition-all duration-300 ease-in-out
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75">{mode === "create" ? "Créer" : "Modifier"}</button>



    </form>
}