import { CheckCircle, Mail, Smartphone, UserCog, Users } from "lucide-react";
import React from "react";

import PersonnalisationSectorCards from "../components/PersonnalisationSectorCards";
import RelanceProfileSlider from "../components/RelanceProfileSlider";
import RelanceInfographie from "../components/RelanceInfographie";
import PersonnalisationTestimonial from "../components/PersonnalisationTestimonial";
import PersonnalisationDemoGif from "../components/PersonnalisationDemoGif";
import PersonnalisationIconsRow from "../components/PersonnalisationIconsRow";
import Footer from "../components/Footer";

import { useNavigate } from "react-router-dom";

export default function Personnalisation() {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Fond dynamique animé */}
      <div className="absolute inset-0 -z-10 animate-gradient-x bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 opacity-80">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-200 via-blue-100 to-transparent blur-2xl opacity-60 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-1/2 h-40 bg-gradient-to-tr from-blue-100 via-blue-200 to-transparent blur-2xl opacity-50 animate-pulse" />
      </div>

      {/* Bloc Intro */}
      <section className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700 mb-2 text-center">Vos relances, votre style.</h1>
        <h2 className="text-lg md:text-xl text-gray-700 font-medium mb-6 text-center">Adaptez le ton, le timing et les canaux de relance à chaque type de client. <br className="hidden md:block"/>Sans coder, sans stress.</h2>
      </section>

      {/* Bloc 3 cas concrets */}
      <PersonnalisationSectorCards />

      {/* Bloc Slider profils types */}
      <div className="my-12">
        <h3 className="text-xl font-bold text-center text-blue-700 mb-4">Profils types personnalisables</h3>
        <RelanceProfileSlider />
      </div>

      {/* Infographie animée */}
      <div className="my-10">
        <h3 className="text-xl font-bold text-center text-blue-700 mb-4">Scénario de relance type</h3>
        <RelanceInfographie />
      </div>

      {/* Témoignage client */}
      <PersonnalisationTestimonial />

      {/* Démo animée ou GIF */}
      <PersonnalisationDemoGif />

      {/* Zone icônes illustratives */}
      <PersonnalisationIconsRow />

      {/* Micro-copy UX */}
      <div className="flex flex-wrap justify-center gap-4 text-center text-sm text-blue-700 font-semibold mt-4 mb-8">
        <span className="bg-blue-50 px-3 py-1 rounded-full">Personnalisez sans coder</span>
        <span className="bg-blue-50 px-3 py-1 rounded-full">Modifiez à tout moment</span>
        <span className="bg-blue-50 px-3 py-1 rounded-full">Adaptez la relance à chaque situation</span>
      </div>

      {/* CTA contextuel */}
      <div className="flex justify-center my-8">
        <button
          className="flex items-center gap-2 px-6 py-4 bg-blue-700 text-white rounded-xl shadow-lg text-lg font-bold hover:bg-blue-800 transition-colors animate-bounce"
          onClick={() => navigate('/signup')}
        >
          <span role="img" aria-label="tableau">🎛️</span>
          Essayez votre premier profil de relance gratuitement
        </button>
      </div>

      {/* Ancien contenu conservé */}
      <section className="bg-white py-16 px-4 sm:px-8 lg:px-24 rounded-xl shadow-md max-w-4xl mx-auto mt-10 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700 mb-4 text-center">
          Personnalisez Payment Flow à votre image
        </h1>
        <p className="text-lg text-gray-700 mb-3 text-center">
          Que vous soyez artisan breton, PME innovante ou entreprise du BTP,
          Payment Flow s’adapte à <span className="font-semibold text-blue-700">vos besoins</span>.
          Configurez chaque étape de vos relances en toute simplicité.
        </p>
        <p className="text-gray-600 text-center mb-8">
          Délais, messages, canaux, ton : tout est personnalisable en quelques clics, sans aucune compétence technique.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="flex items-start space-x-4">
            <UserCog className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="font-bold text-gray-900">Délais & profils de relance</h3>
              <p className="text-gray-600 text-sm">
                Créez des profils adaptés à chaque segment client (TPE, PME, grands comptes, etc.) et ajustez les délais selon vos process internes.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <Mail className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="font-bold text-gray-900">Messages types & ton</h3>
              <p className="text-gray-600 text-sm">
                Modifiez les modèles d’email et SMS, choisissez un ton formel, courtois ou ferme, selon votre image et votre clientèle.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <Smartphone className="h-8 w-8 text-purple-600" />
            <div>
              <h3 className="font-bold text-gray-900">Canaux de communication</h3>
              <p className="text-gray-600 text-sm">
                Activez ou désactivez l’email, le SMS ou les deux, pour chaque profil ou chaque étape de relance.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <Users className="h-8 w-8 text-yellow-600" />
            <div>
              <h3 className="font-bold text-gray-900">Gestion multi-utilisateurs</h3>
              <p className="text-gray-600 text-sm">
                Attribuez des rôles, des accès et des préférences par utilisateur, pour une gestion sur-mesure de vos équipes.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center text-blue-700 font-medium text-lg mt-6">
          Passez à l’étape suivante : découvrez comment automatiser vos relances en toute sérénité.
        </div>
      </section>
      <div style={{height: '0.5cm'}} />
      <Footer />
    </div>
  );
}
