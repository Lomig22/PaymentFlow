import React from "react";

export default function PersonnalisationTestimonial() {
  return (
    <div className="flex flex-col md:flex-row items-center gap-6 bg-blue-50 rounded-xl p-6 shadow-md max-w-2xl mx-auto my-8 border border-blue-100">
      <img
        src="/images/ouestelio.png"
        alt="Jean L."
        className="w-20 h-20 rounded-full object-cover border-4 border-blue-200 shadow"
      />
      <div className="flex-1">
        <blockquote className="text-lg italic text-gray-700 mb-2">
          “Grâce aux profils de relance personnalisés de Payment Flow, j’ai réduit mes délais de paiement de 18 à 7 jours !”
        </blockquote>
        <div className="font-bold text-blue-700">Jean L., dirigeant PME industrielle</div>
      </div>
    </div>
  );
}
