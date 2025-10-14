import { useEffect, useState } from "react";
import {
    Button,
    Modal,
    TextInput,
    NumberInput,
    Table,
    Group,
} from "@mantine/core";
import { supabase } from "../../src/lib/supabase/supabase";
import { Pencil, X } from "lucide-react";
import ExternalPaymentForm from "./ExternalPaymentForm";

export type ExternalPayment = {
    id: string;
    invoice_number: string;
    amount: number;
    payment_date: string;
    created_at?: string;
    updated_at?: string;
};


interface FieldProps {
    label: string;
    value: string;
    Icon?: React.ElementType;
    isLink?: boolean;
}

export function PaymentSync() {
    const [payments, setPayments] = useState<ExternalPayment[]>([]);
    const [modalOpened, setModalOpened] = useState(false);
    const [editingPayment, setEditingPayment] = useState<ExternalPayment | null>(null);

    // Load data
    const fetchPayments = async () => {
        const { data, error } = await supabase
            .from("external_payments")
            .select("*")
            .order("created_at", { ascending: false });
        if (error) console.error(error);
        else setPayments(data);
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const openModalForEdit = (payment: ExternalPayment) => {
        setEditingPayment(payment);
        setModalOpened(true);
    };



    return (
        <div>
            <h2 className="text-lg font-semibold">External Payments</h2>
            <button onClick={() => {
                setEditingPayment(null);
                setModalOpened(true);
            }} className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white font-medium shadow-md
                   hover:bg-blue-700 transition-all duration-300 ease-in-out
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75">New External Payment</button>

            <table>
                <thead>
                    <tr>
                        <th>Invoice Number</th>
                        <th>Amount</th>
                        <th>Payment Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {payments.map((p) => (
                        <tr key={p.id}>
                            <td>{p.invoice_number}</td>
                            <td>{p.amount}</td>
                            <td>{new Date(p.payment_date).toLocaleString()}</td>
                            <td>
                                <button className="rounded-md bg-blue-600 px-4 py-2 text-white font-medium shadow-md
                   hover:bg-blue-700" onClick={() => openModalForEdit(p)}>
                                    <Pencil></Pencil>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {modalOpened ? (<div className='fixed inset-0 bg-gray-600 bg-opacity-50 z-50 overflow-y-auto'>
                <div className='min-h-screen py-8 px-4 flex items-center justify-center'>
                    <div className="relative bg-white rounded-lg shadow-xl p-8 w-full max-w-xl mx-auto">
                        <button
                            onClick={() => setModalOpened(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-red-600 transition"
                            aria-label="Fermer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        {editingPayment ?
                            <ExternalPaymentForm
                                mode="update"
                                payment={editingPayment}
                                onSubmit={() => {
                                    setModalOpened(false);
                                    fetchPayments();
                                }} />
                            : <ExternalPaymentForm
                                mode={"create"}
                                payment={null}
                                onSubmit={() => {
                                    setModalOpened(false);
                                    fetchPayments();
                                }} />}
                    </div>
                </div>
            </div>) : <></>}
        </div>
    );
}