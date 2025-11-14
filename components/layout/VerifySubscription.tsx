export function VerifySubscription() {
    return <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
            <svg
                className="animate-spin h-10 w-10 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                />
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                />
            </svg>
            <h2 className="text-xl font-semibold text-gray-700 animate-pulse">
                Vérification de votre compte...
            </h2>
            <p className="text-gray-500 text-sm">
                Merci de patienter un instant
            </p>
        </div>
    </div>
}