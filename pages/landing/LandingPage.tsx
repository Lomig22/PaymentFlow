import { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { InlineWidget } from "react-calendly";
import ContactModal from "./ContactModal";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  BarChart2,
  Mail,
  Target,
  X,
  CheckCircle,
  ChevronRight
} from "lucide-react";
import { sendContactForm } from "../../src/lib/contactService";
import { supabase } from "../../src/lib/supabase";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { User } from "@supabase/supabase-js";
import Link from "next/link";
import Footer from "../../src/components/Footer";

interface LandingPageProps {
  onGetStarted: () => void;
  user?: User; // Add this if you want to pass the user as a prop
}

// Animation variants (copied from PricingPage.tsx)
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.42, 0, 0.58, 1] as [number, number, number, number] } },
};

// If you have other animation variants with 'ease: [0.42, 0, 0.58, 1] as [number, number, number, number]', replace them similarly.
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

import dynamic from "next/dynamic";

const StorylaneDemoEmbed = dynamic(() => import("../../components/StorylaneDemoEmbed"), { ssr: false });

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  // ... (autres hooks et logique)

  const router = useRouter();

  const goToSignUp = () => {
    router.push("/signup");
  };
  const [defaultSubject, setDefaultSubject] = useState("");
  const [contactFormData, setContactFormData] = useState({
    name: "",
    email: "",
    subject: defaultSubject || "",
    message: "",
    privacy: false,
  });

  const [viewport, setViewport] = useState<{ once: boolean; margin: string; amount: number }>({
    once: true,
    margin: "-100px", // default for SSR
    amount: 0.25,
  });

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    setViewport({
      once: true,
      margin: isMobile ? "-20px" : "-100px",
      amount: isMobile ? 0.1 : 0.25,
    });
  }, []);

  useEffect(() => {
    if (router.asPath.includes("#")) {
      const id = router.asPath.split("#")[1];
      const section = document.getElementById(id);
      if (section) {
        setTimeout(() => {
          section.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [router.asPath]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const success = await sendContactForm({
        name: contactFormData.name,
        email: contactFormData.email,
        subject: contactFormData.subject,
        message: contactFormData.message,
      });

      if (success) {
        // Réinitialiser le formulaire
        setContactFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
          privacy: false,
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du formulaire:", error);
    } finally {

    }
  };

  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const useCasesRef = useRef(null);
  const testimonialsRef = useRef(null);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.42, 0, 0.58, 1] as [number, number, number, number] },
    },
  };

  const fadeInScale = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6 },
    },
  };

  // If you have other animation variants with 'ease: [0.42, 0, 0.58, 1] as [number, number, number, number]', replace them similarly.
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  // fadeInLeft animation variant (copied from PricingPage.tsx)
  const fadeInLeft = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: [0.42, 0, 0.58, 1] as [number, number, number, number] },
    },
  };


  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">(
    "monthly"
  );

  const handleStripePayment = (email: string) => {
    // Remplacer l'email dans le lien Stripe par l'email de l'utilisateur
    const stripeUrl = `https://buy.stripe.com/test_dR66s9cgGcRgcQU3cc?prefilled_email=${encodeURIComponent(email)}`;
    window.open(stripeUrl, '_blank');
  };

  return (
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
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Optimisez vos relances B2B
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Automatisez et personnalisez vos relances commerciales pour convertir plus de prospects en clients fidèles.
            </p>
            <button
              onClick={onGetStarted}
              className="bg-blue-600 text-white px-8 py-4 rounded-md text-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Essayer gratuitement
            </button>
          </div>

          {/* Features */}
          <div id="features" className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-6">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Ciblage précis</h3>
              <p className="text-gray-600">
                Identifiez les meilleurs moments pour relancer vos prospects B2B.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-6">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Personnalisation avancée</h3>
              <p className="text-gray-600">
                Créez des séquences de relance personnalisées et automatisées.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-6">
                <BarChart2 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Analyses détaillées</h3>
              <p className="text-gray-600">
                Suivez vos performances et optimisez vos campagnes de relance.
              </p>
            </div>
          </div>

          {/* Use Cases */}
          <div className="mt-32">
            <h2 className="text-3xl font-bold text-center mb-16">Comment PaymentFlow peut vous aider</h2>

            <div className="space-y-24">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">Gestion des créances impayées</h3>
                  <p className="text-gray-600 mb-6">
                    Identifiez rapidement les factures en retard et lancez des séquences de relance automatisées pour accélérer vos encaissements.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <ChevronRight className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                      <span>Tableau de bord centralisé pour toutes vos créances</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                      <span>Alertes automatiques pour les retards de paiement</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                      <span>Suivi détaillé de l'historique des relances</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-gray-100 p-6 rounded-lg shadow-inner">
                  <img
                    src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2011&q=80"
                    alt="Gestion des créances"
                    className="rounded-lg shadow-md w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="order-2 md:order-1 bg-gray-100 p-6 rounded-lg shadow-inner">
                  <img
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                    alt="Automatisation des relances"
                    className="rounded-lg shadow-md w-full"
                  />
                </div>
                <div className="order-1 md:order-2">
                  <h3 className="text-2xl font-bold mb-4">Automatisation des relances</h3>
                  <p className="text-gray-600 mb-6">
                    Configurez des modèles de relance personnalisés et laissez PaymentFlow s'occuper de l'envoi au moment optimal.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <ChevronRight className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                      <span>Modèles d'emails personnalisables</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                      <span>Séquences de relance multi-étapes</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                      <span>Planification intelligente des envois</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">Analyse et reporting</h3>
                  <p className="text-gray-600 mb-6">
                    Obtenez des insights précieux sur vos performances de recouvrement et identifiez les opportunités d'amélioration.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <ChevronRight className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                      <span>Tableaux de bord analytiques en temps réel</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                      <span>Rapports détaillés sur les délais de paiement</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                      <span>Identification des clients à risque</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-gray-100 p-6 rounded-lg shadow-inner">
                  <img
                    src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                    alt="Analyse et reporting"
                    className="rounded-lg shadow-md w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div id="pricing" className="mt-32">
            <h2 className="text-3xl font-bold text-center mb-16">Tarifs simples et transparents</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200 hover:border-blue-500 transition-colors">
                <h3 className="text-xl font-bold mb-2">Starter</h3>
                <p className="text-gray-600 mb-6">Pour les petites entreprises</p>
                <p className="text-4xl font-bold mb-6">29€<span className="text-lg font-normal text-gray-500">/mois</span></p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Jusqu'à 50 clients</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>3 modèles de relance</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Rapports mensuels</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Support par email</span>
                  </li>
                </ul>
                <button
                  onClick={() => handleStripePayment('exemple@gmail.com')}
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Souscrire
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-blue-500 transform scale-105 z-10">
                <div className="bg-blue-500 text-white text-xs font-bold uppercase tracking-wider py-1 px-2 rounded-full inline-block mb-2">
                  Populaire
                </div>
                <h3 className="text-xl font-bold mb-2">Professional</h3>
                <p className="text-gray-600 mb-6">Pour les entreprises en croissance</p>
                <p className="text-4xl font-bold mb-6">79€<span className="text-lg font-normal text-gray-500">/mois</span></p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Jusqu'à 200 clients</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>10 modèles de relance</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Rapports hebdomadaires</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Support prioritaire</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Intégration comptable</span>
                  </li>
                </ul>
                <button
                  onClick={() => handleStripePayment('exemple@gmail.com')}
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Souscrire
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200 hover:border-blue-500 transition-colors">
                <h3 className="text-xl font-bold mb-2">Enterprise</h3>
                <p className="text-gray-600 mb-6">Pour les grandes entreprises</p>
                <p className="text-4xl font-bold mb-6">199€<span className="text-lg font-normal text-gray-500">/mois</span></p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Clients illimités</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Modèles illimités</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Rapports personnalisés</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Support dédié 24/7</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>API complète</span>
                  </li>
                </ul>
                <button
                  onClick={() => handleStripePayment('exemple@gmail.com')}
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Contacter les ventes
                </button>
              </div>
            </div>
          </div>

          {/* Testimonials */}
          <div id="testimonials" className="mt-32">
            <h2 className="text-3xl font-bold text-center mb-16">Ce que nos clients disent</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
                <div className="flex items-center mb-6">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
                    alt="Sophie Martin"
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-bold">Sophie Martin</h4>
                    <p className="text-gray-600 text-sm">Directrice Financière, TechStart</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "PaymentFlow a transformé notre processus de recouvrement. Nous avons réduit nos délais de paiement de 45 à 15 jours en moyenne."
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
                <div className="flex items-center mb-6">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
                    alt="Thomas Dubois"
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-bold">Thomas Dubois</h4>
                    <p className="text-gray-600 text-sm">CEO, Marketing Solutions</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "L'automatisation des relances nous a fait gagner un temps précieux. Notre équipe peut désormais se concentrer sur des tâches à plus forte valeur ajoutée."
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
                <div className="flex items-center mb-6">
                  <img
                    src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
                    alt="Émilie Lefèvre"
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-bold">Émilie Lefèvre</h4>
                    <p className="text-gray-600 text-sm">Responsable Comptabilité, GreenRetail</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "Les rapports détaillés nous permettent d'identifier rapidement les clients à risque et d'adapter notre stratégie de recouvrement en conséquence."
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Modal Privacy Policy */}
      {(
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Politique de confidentialité
              </h2>
              <button
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="prose prose-blue max-w-none">
              <h3>1. Collecte des informations</h3>
              <p>
                Nous collectons des informations lorsque vous vous inscrivez sur
                notre site, lorsque vous vous connectez à votre compte, faites
                un achat, participez à un concours, et/ou lorsque vous vous
                déconnectez. Les informations collectées incluent votre nom,
                votre adresse e-mail, numéro de téléphone, et/ou carte de
                crédit.
              </p>
              <p>
                En outre, nous recevons et enregistrons automatiquement des
                informations à partir de votre ordinateur et navigateur, y
                compris votre adresse IP, vos logiciels et votre matériel, et la
                page que vous demandez.
              </p>

              <h3>2. Utilisation des informations</h3>
              <p>
                Toutes les informations que nous recueillons auprès de vous
                peuvent être utilisées pour :
              </p>
              <ul>
                <li>
                  Personnaliser votre expérience et répondre à vos besoins
                  individuels
                </li>
                <li>Fournir un contenu publicitaire personnalisé</li>
                <li>Améliorer notre site Web</li>
                <li>
                  Améliorer le service client et vos besoins de prise en charge
                </li>
                <li>Vous contacter par e-mail</li>
                <li>Administrer un concours, une promotion, ou une enquête</li>
              </ul>

              <h3>3. Confidentialité du commerce en ligne</h3>
              <p>
                Nous sommes les seuls propriétaires des informations recueillies
                sur ce site. Vos informations personnelles ne seront pas
                vendues, échangées, transférées, ou données à une autre société
                pour n'importe quelle raison, sans votre consentement, en dehors
                de ce qui est nécessaire pour répondre à une demande et/ou une
                transaction.
              </p>

              <h3>4. Divulgation à des tiers</h3>
              <p>
                Nous ne vendons, n'échangeons et ne transférons pas vos
                informations personnelles identifiables à des tiers. Cela ne
                comprend pas les tierces parties de confiance qui nous aident à
                exploiter notre site Web ou à mener nos affaires, tant que ces
                parties conviennent de garder ces informations confidentielles.
              </p>

              <h3>5. Protection des informations</h3>
              <p>
                Nous mettons en œuvre une variété de mesures de sécurité pour
                préserver la sécurité de vos informations personnelles. Nous
                utilisons un cryptage à la pointe de la technologie pour
                protéger les informations sensibles transmises en ligne. Nous
                protégeons également vos informations hors ligne.
              </p>

              <h3>6. Consentement</h3>
              <p>
                En utilisant notre site, vous consentez à notre politique de
                confidentialité.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Terms */}
      {(
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Conditions d'utilisation
              </h2>
              <button
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="prose prose-blue max-w-none">
              <h3>1. Conditions</h3>
              <p>
                En accédant à ce site web, vous acceptez d'être lié par ces
                conditions d'utilisation, toutes les lois et réglementations
                applicables, et vous acceptez que vous êtes responsable du
                respect des lois locales applicables. Si vous n'acceptez pas
                l'une de ces conditions, il vous est interdit d'utiliser ou
                d'accéder à ce site.
              </p>

              <h3>2. Licence d'utilisation</h3>
              <p>
                L'autorisation est accordée de télécharger temporairement une
                copie des documents (informations ou logiciels) sur le site web
                de PaymentFlow pour un visionnage transitoire personnel et non
                commercial uniquement. Il s'agit de l'octroi d'une licence, et
                non d'un transfert de titre, et sous cette licence, vous ne
                pouvez pas :
              </p>
              <ul>
                <li>modifier ou copier les documents;</li>
                <li>
                  utiliser les documents à des fins commerciales ou pour une
                  présentation publique;
                </li>
                <li>
                  tenter de décompiler ou de désosser tout logiciel contenu sur
                  le site web de PaymentFlow;
                </li>
                <li>
                  supprimer tout droit d'auteur ou autres notations de propriété
                  des documents; ou
                </li>
                <li>
                  transférer les documents à une autre personne ou "miroir" les
                  documents sur un autre serveur.
                </li>
              </ul>

              <h3>3. Avis de non-responsabilité</h3>
              <p>
                Les documents sur le site web de PaymentFlow sont fournis "tels
                quels". PaymentFlow ne donne aucune garantie, expresse ou
                implicite, et décline et annule par la présente toutes les
                autres garanties, y compris, sans limitation, les garanties
                implicites ou les conditions de qualité marchande, d'adéquation
                à un usage particulier, ou de non-violation de la propriété
                intellectuelle ou autre violation des droits.
              </p>

              <h3>4. Limitations</h3>
              <p>
                En aucun cas, PaymentFlow ou ses fournisseurs ne seront
                responsables de tout dommage (y compris, sans limitation, les
                dommages pour perte de données ou de profit, ou en raison d'une
                interruption d'activité) découlant de l'utilisation ou de
                l'incapacité d'utiliser les matériaux sur le site web de
                PaymentFlow, même si PaymentFlow ou un représentant autorisé de
                PaymentFlow a été informé oralement ou par écrit de la
                possibilité de tels dommages.
              </p>

              <h3>5. Révisions et errata</h3>
              <p>
                Les documents apparaissant sur le site web de PaymentFlow
                peuvent inclure des erreurs techniques, typographiques ou
                photographiques. PaymentFlow ne garantit pas que l'un des
                documents sur son site web est exact, complet ou à jour.
                PaymentFlow peut apporter des modifications aux documents
                contenus sur son site web à tout moment sans préavis.
              </p>

              <h3>6. Liens</h3>
              <p>
                PaymentFlow n'a pas examiné tous les sites liés à son site web
                et n'est pas responsable du contenu de ces sites liés.
                L'inclusion de tout lien n'implique pas l'approbation par
                PaymentFlow du site. L'utilisation de tout site web lié est aux
                risques et périls de l'utilisateur.
              </p>

              <h3>7. Modifications des conditions d'utilisation</h3>
              <p>
                PaymentFlow peut réviser ces conditions d'utilisation de son
                site web à tout moment sans préavis. En utilisant ce site web,
                vous acceptez d'être lié par la version alors en vigueur de ces
                conditions d'utilisation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Legal Notice */}
      {(
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Mentions légales
              </h2>
              <button
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="prose prose-blue max-w-none">
              <h3>Propriété intellectuelle</h3>
              <p>
                L'ensemble du contenu du site PaymentFlow, incluant, de façon
                non limitative, les graphismes, images, textes, vidéos,
                animations, sons, logos, gifs et icônes ainsi que leur mise en
                forme sont la propriété exclusive de PaymentFlow SAS à
                l'exception des marques, logos ou contenus appartenant à
                d'autres sociétés partenaires ou auteurs.
              </p>
              <p>
                Toute reproduction, distribution, modification, adaptation,
                retransmission ou publication, même partielle, de ces différents
                éléments est strictement interdite sans l'accord exprès par
                écrit de PaymentFlow SAS.
              </p>

              <h3>Protection des données personnelles</h3>
              <p>
                Conformément au Règlement Général sur la Protection des Données
                (RGPD) et à la loi Informatique et Libertés, vous disposez d'un
                droit d'accès, de rectification, de suppression et d'opposition
                aux données personnelles vous concernant.
              </p>
              <p>
                Pour exercer ces droits, vous pouvez nous contacter à l'adresse
                email suivante : dpo@paymentflow.com ou par courrier à l'adresse
                du siège social indiquée ci-dessus.
              </p>

              <h3>Cookies</h3>
              <p>
                Notre site utilise des cookies pour améliorer l'expérience
                utilisateur. En naviguant sur notre site, vous acceptez
                l'utilisation de cookies conformément à notre politique de
                confidentialité.
              </p>

              <h3>Loi applicable et juridiction</h3>
              <p>
                Les présentes mentions légales sont régies par le droit
                français. En cas de litige, les tribunaux français seront seuls
                compétents.
              </p>

              <h3>Contact</h3>
              <p>
                Pour toute question relative aux présentes mentions légales ou
                pour toute demande concernant le site, vous pouvez nous
                contacter à l'adresse suivante : legal@paymentflow.com
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
