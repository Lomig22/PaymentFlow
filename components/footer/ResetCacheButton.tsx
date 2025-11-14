'use client';

export function ResetCacheButton() {


    // --- Reset cache/localStorage ---
    const handleResetCache = () => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.reload();
    };

    return <button
        className="mt-4 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
        onClick={handleResetCache}
    >
        Réinitialiser le cache / localStorage
    </button>
}