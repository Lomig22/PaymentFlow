import React from "react";
import { Mail, Smartphone, FileText } from "lucide-react";

export default function RelanceInfographie() {
  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto my-8">
      <div className="flex items-center w-full justify-between relative">
        <div className="flex flex-col items-center">
          <FileText className="h-8 w-8 text-gray-400 mb-1" />
          <div className="text-xs text-gray-500">Facture échue</div>
        </div>
        <div className="flex-1 h-2 flex items-center">
          <div className="w-full h-1 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-600 animate-pulse rounded" />
        </div>
        <div className="flex flex-col items-center">
          <Mail className="h-8 w-8 text-blue-500 mb-1" />
          <div className="text-xs text-blue-600">Relance 1 : email doux</div>
        </div>
        <div className="flex-1 h-2 flex items-center">
          <div className="w-full h-1 bg-gradient-to-r from-blue-300 via-blue-500 to-blue-700 animate-pulse rounded" />
        </div>
        <div className="flex flex-col items-center">
          <Smartphone className="h-8 w-8 text-red-500 mb-1" />
          <div className="text-xs text-red-600">Relance 2 : SMS ferme</div>
        </div>
        <div className="flex-1 h-2 flex items-center">
          <div className="w-full h-1 bg-gradient-to-r from-blue-400 via-blue-600 to-blue-800 animate-pulse rounded" />
        </div>
        <div className="flex flex-col items-center">
          <Mail className="h-8 w-8 text-purple-600 mb-1" />
          <div className="text-xs text-purple-600">Relance finale : email + PJ</div>
        </div>
      </div>
    </div>
  );
}
