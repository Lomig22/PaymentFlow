"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface VerifyMFAFormProps {
    factorId: string,
    challengeId: string
}

export default function VerifyMFAForm({ factorId, challengeId }: VerifyMFAFormProps) {
    const [code, setCode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const res = await fetch("/api/mfa/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, factorId, challengeId }),
        });

        const result = await res.json();

        if (result.success) {
            router.replace("/dashboard");
        } else {
            setError(result.error || "Code incorrect");
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <form
                onSubmit={handleSubmit}
                className="bg-white rounded-xl shadow-md p-6 max-w-md w-full space-y-4"
            >
                <h2 className="text-xl font-bold text-center">Validation à deux facteurs</h2>
                <p className="text-sm text-gray-600 text-center">
                    Entrez le code généré par votre application d’authentification.
                </p>
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Code à 6 chiffres"
                    className="border border-gray-300 rounded px-4 py-2 w-full text-center font-mono text-lg"
                    maxLength={6}
                />
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <button
                    type="submit"
                    disabled={loading || code.length !== 6}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full disabled:opacity-50"
                >
                    {loading ? "Vérification..." : "Valider"}
                </button>
            </form>
        </div>
    );
}
