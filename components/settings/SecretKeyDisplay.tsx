import { useState, useEffect } from "react";
import { Check } from "lucide-react"; // Ou tout autre icône SVG/Lib que tu utilises

export default function SecretKeyDisplay({ secretKey }: { secretKey: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(secretKey);
    setCopied(true);
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  return (
    <div className="mt-2 border rounded p-2 bg-gray-50">
        Clé secrète :
      <div className="flex items-center justify-between space-x-4">
        <div className="text-sm text-gray-700">
          
          <span className="font-mono">{secretKey}</span>
        </div>
  
        <div className="flex items-center space-x-2">
          {copied && <Check className="text-green-600 w-4 h-4" />}
          <button
            onClick={handleCopy}
            className={`px-2 py-1 rounded text-sm transition-colors ${
              copied
                ? "bg-green-200 text-green-800"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {copied ? "Clé copiée" : "Copier la clé"}
          </button>
        </div>
      </div>
    </div>
  );
  
}
