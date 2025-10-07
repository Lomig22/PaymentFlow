import Head from "next/head";
import {
  BarChart2,
  Mail,
  Target,
  CheckCircle,
} from "lucide-react";

import Link from "next/link";
import Footer from "../../../components/Footer";

import { LandingModal } from "./LandingModal";
import { AnimatedLandingSection } from "./AnimatedLandingSection";
import { StorylaneDemo } from "./StoryLaneDemo";
import UseCaseServer from "./UseCaseServer";
import { Calendly } from "./Calendly";
import { Testimonials } from "./Testimonials";
import { ConfirmCalendarButton } from "./ConfirmCalendarButton";

export default function LandingPage() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Head>
          <title>Logiciel de recouvrement | Payment Flow</title>
          <meta name="description" content="Solution SaaS de relance client automatisée : améliorez votre trésorerie, réduisez votre DSO et optimisez votre relation client avec Payment Flow." />
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href="https://www.payment-flow.fr/" />
        </Head>
        {/* Hero Section */}
        <main>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <AnimatedLandingSection
              leftColumn={
                <div className="text-center md:text-left">
                  <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
                    Logiciel de recouvrement :
                  </h1>
                  <h2 className="text-4xl sm:text-5xl font-bold text-blue-600 mb-6">
                    Automatisez vos relances clients
                  </h2>
                  <div className="text-xl text-gray-600 mb-8 space-y-4">
                    <p className="flex items-center gap-2">
                      <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                      Accélérez vos encaissements de plus de 40 %
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                      Gagnez 75 % de temps sur la gestion des relances
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                      Gardez vos impayés sous contrôle, en dessous de 1 %
                    </p>
                  </div>
                  <Link href="/signup">
                    <button className="bg-blue-600 text-white px-8 py-4 rounded-md text-lg font-medium hover:bg-blue-700 transition-colors">
                      Essayer gratuitement
                    </button>
                  </Link>
                  {/* Social Proof: 5 stars + text */}
                  <div className="mt-6" />
                  <div className="flex flex-col items-start mt-4">
                    <div className="flex flex-row gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="#FFD700"
                          className="w-6 h-6"
                          aria-label="star"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.286 3.97c.3.921-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.785.57-1.84-.197-1.54-1.118l1.286-3.97a1 1 0 00-.364-1.118L2.05 9.397c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.97z" />
                        </svg>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 text-left">
                      Noté&nbsp;<span className="font-semibold" style={{ color: '#2563eb' }}>4,93/5</span>&nbsp;sur Capterra, Trustpilot, GetApp, Appvizer & Google
                    </div>
                  </div>
                </div>}
              rightColumn={
                <>
                  <img
                    src="/images/landing-page.png"
                    alt="Aperçu outil Payment Flow"
                    style={{
                      maxWidth: '680px',
                      width: '100%',
                      borderRadius: '1.5rem',
                      objectFit: 'contain',
                      display: 'block',
                      boxShadow: 'none'
                    }}
                    className="mx-auto"
                  />
                </>
              }
              target={
                <>
                  <div
                    className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-6 
                    transition-transform duration-300 ease-in-out 
                    group-hover:-translate-y-2 group-hover:shadow-md"
                  >
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Ciblage précis</h3>
                  <p className="text-gray-600">
                    Identifiez les meilleurs moments pour relancer vos créanciers.
                  </p>
                </>
              }
              email={
                <>
                  <div
                    className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-6 
      transition-transform duration-300 ease-in-out 
      group-hover:-translate-y-2 group-hover:shadow-md"
                  >
                    <Mail className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">
                    Personnalisation avancée
                  </h3>
                  <p className="text-gray-600">
                    Créez des séquences de relance personnalisées et automatisées.
                  </p>
                </>
              }
              chart={
                <>
                  <div
                    className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-6 
      transition-transform duration-300 ease-in-out 
      group-hover:-translate-y-2 group-hover:shadow-md"
                  >
                    <BarChart2 className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">
                    Analyses détaillées
                  </h3>
                  <p className="text-gray-600">
                    Suivez vos performances et optimisez vos campagnes de relance.
                  </p>
                </>
              }
            >

            </AnimatedLandingSection>

            <StorylaneDemo>
              <h2 className="text-2xl font-bold text-center mb-8">Découvrez PaymentFlow en action</h2>
            </StorylaneDemo>

            {/* Use Cases */}
            <UseCaseServer />


            {/* Section Tarifs supprimée. Voir la page dédiée. */}
            <div className="flex justify-center my-20">
              <button
                className="bg-blue-600 text-white px-8 py-4 rounded-md text-lg font-medium hover:bg-blue-700 transition-colors shadow-lg"
              >
                <Link
                  href={"/pricing"}>
                  Voir les tarifs
                </Link>

              </button>
            </div>

            {/* Testimonials */}
            <Testimonials />

          </div>
          <div
            className="calendly-container"
            style={{
              marginTop: "2rem",
              padding: 0,
              height: "100vh",
              maxHeight: "700px",
            }}
          >
            <Calendly />
          </div>
          <ConfirmCalendarButton />
        </main>


        {/* Footer */}
        <Footer />

        <LandingModal></LandingModal>
      </div>
    </>
  );
}
