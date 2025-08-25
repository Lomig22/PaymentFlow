import React, { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { InlineWidget } from "react-calendly";
import { useLocation, useNavigate } from "react-router-dom";
import ContactModal from "../pages/ContactModal";

import {
  BarChart2,
  Mail,
  Target,
  TrendingUp,
  X,
  CheckCircle,
  ChevronRight,
} from "lucide-react";
import { sendContactForm } from "../lib/contactService";
import { supabase } from "../lib/supabase";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { User } from "@supabase/supabase-js";
import { Link } from "react-router-dom";
import { Menu } from '@headlessui/react';
import Footer from "../components/Footer";
import { Helmet } from "react-helmet";
import PricingPage from "./PricingPage";
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

// Composant pour insérer l'iframe Storylane et charger le script dynamiquement
function StorylaneDemoEmbed() {
  React.useEffect(() => {
    // Vérifie si le script existe déjà pour éviter de le charger plusieurs fois
    if (!document.querySelector('script[src="https://js.storylane.io/js/v2/storylane.js"]')) {
      const script = document.createElement('script');
      script.src = "https://js.storylane.io/js/v2/storylane.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="sl-embed" style={{ position: 'relative', paddingBottom: 'calc(50.42% + 25px)', width: '100%', height: 0, transform: 'scale(1)' }}>
      <iframe
        loading="lazy"
        className="sl-demo"
        src="https://app.storylane.io/demo/otrw27xywyf3?embed=inline"
        name="sl-embed"
        allow="fullscreen"
        allowFullScreen
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: '1px solid rgba(63,95,172,0.35)',
          boxShadow: '0px 0px 18px rgba(26, 19, 72, 0.15)',
          borderRadius: '10px',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  // ... (autres hooks et logique)

  // ...
  // Fonction pour ouvrir le popup Calendly de façon robuste
  const openCalendlyPopup = () => {
    const calendlyUrl = "https://calendly.com/paymentfloww/30min?locale=fr";
    // Si Calendly est déjà chargé
    if ((window as any).Calendly && typeof (window as any).Calendly.initPopupWidget === "function") {
      (window as any).Calendly.initPopupWidget({ url: calendlyUrl });
      return;
    }
    // Sinon, charger dynamiquement le script puis ouvrir le popup
    const existingScript = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = "https://assets.calendly.com/assets/external/widget.js";
      script.async = true;
      script.onload = () => {
        if ((window as any).Calendly && typeof (window as any).Calendly.initPopupWidget === "function") {
          (window as any).Calendly.initPopupWidget({ url: calendlyUrl });
        } else {
          alert("Erreur : Impossible de charger Calendly.");
        }
      };
      script.onerror = () => {
        alert("Erreur de chargement du widget Calendly.");
      };
      document.body.appendChild(script);
    } else {
      // Si le script existe mais Calendly pas encore prêt, attendre qu'il soit chargé
      existingScript.addEventListener('load', () => {
        if ((window as any).Calendly && typeof (window as any).Calendly.initPopupWidget === "function") {
          (window as any).Calendly.initPopupWidget({ url: calendlyUrl });
        } else {
          alert("Erreur : Impossible de charger Calendly.");
        }
      });
      existingScript.addEventListener('error', () => {
        alert("Erreur de chargement du widget Calendly.");
      });
    }
  };
  const navigate = useNavigate();
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showLegalNotice, setShowLegalNotice] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [defaultSubject, setDefaultSubject] = useState("");
  const [contactFormData, setContactFormData] = useState({
    name: "",
    email: "",
    subject: defaultSubject || "",
    message: "",
    privacy: false,
  });

  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const section = document.getElementById(id);
      if (section) {
        // Wait for DOM to render
        setTimeout(() => {
          section.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [location]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitting(true);
    setContactError(null);

    try {
      const success = await sendContactForm({
        name: contactFormData.name,
        email: contactFormData.email,
        subject: contactFormData.subject,
        message: contactFormData.message,
      });

      if (success) {
        setContactSubmitted(true);
        // Réinitialiser le formulaire
        setContactFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
          privacy: false,
        });
      } else {
        setContactError(
          "Une erreur est survenue lors de l'envoi du message. Veuillez réessayer plus tard."
        );
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du formulaire:", error);
      setContactError(
        "Une erreur est survenue lors de l'envoi du message. Veuillez réessayer plus tard."
      );
    } finally {
      setContactSubmitting(false);
    }
  };

  const handleStripePayment = async (plan: string) => {
    try {
      // Get current user from Supabase
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert("Veuillez vous connecter pour continuer");
        return;
      }

      // Check for existing subscription
      const { data: existingSubscriptions, error: subscriptionError } =
        await supabase
          .from("subscriptions")
          .select("id")
          .eq("user_id", user.id);

      if (subscriptionError) {
        console.error("Error checking subscriptions:", subscriptionError);
        alert(
          "Une erreur est survenue lors de la vérification de l'abonnement"
        );
        return;
      }

      if (existingSubscriptions && existingSubscriptions.length > 0) {
        alert("Vous avez déjà un abonnement actif.");
        return;
      }

      // Add new subscription to Supabase
      const { error: insertError } = await supabase
        .from("subscriptions")
        .insert([
          {
            user_id: user.id,
            status: "active",
          },
        ]);

      if (insertError) {
        console.error("Error creating subscription:", insertError);
        alert("Erreur lors de la création de l'abonnement");
        return;
      }

      // Proceed to Stripe payment
      let stripeUrl = "";
      switch (plan) {
        case "basic":
          stripeUrl = `https://buy.stripe.com/test_dR66s9cgGcRgcQU3cc?prefilled_email=${encodeURIComponent(
            user.email ?? ""
          )}`;
          break;
        case "pro":
          stripeUrl = `https://buy.stripe.com/test_dR66s9cgGcRgcQU3cc?prefilled_email=${encodeURIComponent(
            user.email ?? ""
          )}`;
          break;
        case "enterprise":
          stripeUrl = `https://buy.stripe.com/test_dR66s9cgGcRgcQU3cc?prefilled_email=${encodeURIComponent(
            user.email ?? ""
          )}`;
          break;
        default:
          return;
      }

      window.open(stripeUrl, "_blank");
    } catch (error) {
      console.error("Erreur de paiement:", error);
      alert("Une erreur est survenue. Veuillez réessayer.");
    }
  };
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const useCasesRef = useRef(null);
  const testimonialsRef = useRef(null);

  // Check when sections are in view
  const heroInView = useInView(heroRef, { once: true, margin: "-100px" });
  const featuresInView = useInView(featuresRef, { once: true, amount: 0.25 });
  const useCasesInView = useInView(useCasesRef, { once: true, amount: 0.1 });
  const testimonialsInView = useInView(testimonialsRef, {
    once: true,
    amount: 0.1,
  });

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

  // Add this helper function to calculate prices
  const getPrice = (monthlyPrice: number) => {
    if (billingInterval === "yearly") {
      const yearlyPrice = monthlyPrice * 12;
      const discountedPrice = yearlyPrice * 0.9;
      return {
        displayedPrice: Math.round(discountedPrice),
        originalPrice: Math.round(yearlyPrice),
      };
    }

    return { displayedPrice: monthlyPrice, originalPrice: null };
  };

  const handleChoosePlan = (plan: string, interval: "monthly" | "yearly") => {
    localStorage.setItem("selectedPlan", plan);
    localStorage.setItem("selectedInterval", interval);
    navigate("/signup");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Helmet>
        <title>Logiciel de recouvrement | Payment Flow</title>
        <meta name="description" content="Solution SaaS de relance client automatisée : améliorez votre trésorerie, réduisez votre DSO et optimisez votre relation client avec Payment Flow." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.payment-flow.fr/" />
      </Helmet>
      <main>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                margin: window.innerWidth < 768 ? "-20px" : "-100px",
                amount: window.innerWidth < 768 ? 0.1 : 0.25,
              }}
              variants={fadeInUp}
              className="grid md:grid-cols-2 gap-8 items-center"
            >
            {/* Left Column - Text Content */}
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
              <Link to="/signup">
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
            </div>
            {/* Right Column - Image */}
            <div>
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
            </div>
          </motion.div>
          {/* Features */}
          <motion.div
            id="features"
            className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12"
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              margin: window.innerWidth < 768 ? "-20px" : "-100px",
              amount: window.innerWidth < 768 ? 0.1 : 0.25,
            }}
            variants={staggerContainer}
          >
            {/* Add group class to each feature card */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="text-center group"
            >
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
            </motion.div>

            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="text-center group"
            >
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
            </motion.div>

            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="text-center group"
            >
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
            </motion.div>
          </motion.div>

          {/* Intégration de la démo Storylane */}
          <motion.div
            className="mt-16"
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.2
            }}
            variants={fadeInUp}
          >
            <h2 className="text-2xl font-bold text-center mb-8">Découvrez PaymentFlow en action</h2>
            <div className="max-w-4xl mx-auto">
              <StorylaneDemoEmbed />
            </div>
          </motion.div>

          {/* Use Cases */}
          <motion.div
  className="mt-32"
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.3 }}
>
  {/* Section desktop uniquement */}
<div className="hidden md:block">
  <h2 className="text-3xl md:text-4xl font-extrabold text-center text-neutral-900 mb-10 tracking-tight">
    Découvrez comment Payment Flow peut vous aider !
  </h2>
  <div className="flex flex-col items-center">
    <div className="relative w-full max-w-[950px] mx-auto">
      {/* Flèches Swiper custom hors cadre */}
      <div className="absolute -left-10 top-1/2 z-10 hidden md:block">
        <div className="swiper-button-prev custom-swiper-arrow left-0 text-blue-600 hover:text-blue-800 transition-colors" />
      </div>
      <div className="absolute -right-10 top-1/2 z-10 hidden md:block">
        <div className="swiper-button-next custom-swiper-arrow right-0 text-blue-600 hover:text-blue-800 transition-colors" />
      </div>
      <div className="bg-white rounded-2xl shadow-xl border border-blue-100 px-0 md:px-4 py-8 md:py-10 flex flex-col md:flex-row items-stretch gap-0 md:gap-8">
        <Swiper
          modules={[Navigation, Pagination]}
          navigation={{
            prevEl: '.swiper-button-prev',
            nextEl: '.swiper-button-next',
          }}
          pagination={{ clickable: true }}
          spaceBetween={0}
          slidesPerView={1}
          className="flex-1"
          style={{ minWidth: 0 }}
        >
          <SwiperSlide>
            <div className="w-full flex flex-col">
              <h3 className="text-2xl md:text-3xl font-bold mb-6 text-blue-700 text-center">
                Automatisez vos relances et gagnez du temps
              </h3>
              <div className="flex flex-col md:flex-row items-center md:items-stretch">
                {/* Zone texte à gauche */}
                <div className="w-full md:w-1/3 flex flex-col justify-center px-6 md:pl-8 md:pr-6 py-4">
                  <p className="text-gray-700 mb-6 text-base md:text-lg">
                    Payment Flow vous permet de centraliser toutes vos créances, d’automatiser vos relances et de suivre vos paiements en temps réel. Gagnez en sérénité et concentrez-vous sur l’essentiel : votre activité.
                  </p>
                  {/* Avis testeuse */}
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg shadow-sm flex flex-col gap-2">
                    <span className="italic text-blue-900 text-sm md:text-base">“J’ai testé Payment Flow pendant 1 mois et j’ai réduit mes impayés de moitié, sans stress. L’outil est intuitif et le support au top !”</span>
                    <span className="font-semibold text-blue-700">— Claire, testeuse PME</span>
                  </div>
                  {/* Call-to-action */}
                  <button
                    className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition-all text-lg w-fit"
                    onClick={() => navigate('/signup')}
                  >
                    Essayez gratuitement Payment Flow
                  </button>
                </div>
                {/* Image à droite */}
                <div className="w-full md:w-2/3 flex items-center justify-center p-2 md:p-4">
                  <img
                    src="/images/1.png"
                    alt="Présentation Payment Flow 1"
                    className="w-full object-contain rounded-xl"
                    style={{ maxHeight: 540, background: '#fff' }}
                  />
                </div>
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="w-full flex flex-col">
              <h3 className="text-2xl md:text-3xl font-bold mb-6 text-blue-700 text-center">
                Visualisez l’impact de vos actions
              </h3>
              <div className="flex flex-col md:flex-row items-center md:items-stretch">
                {/* Zone texte à gauche */}
                <div className="w-full md:w-1/3 flex flex-col justify-center px-6 md:pl-8 md:pr-6 py-4">
                  <p className="text-gray-700 mb-6 text-base md:text-lg">
                    Suivez l’évolution de votre DSO, analysez vos résultats et partagez des rapports clairs à vos équipes ou partenaires. Payment Flow, c’est la maîtrise de votre trésorerie en un coup d’œil.
                  </p>
                  {/* Avis testeuse */}
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg shadow-sm flex flex-col gap-2">
                    <span className="italic text-blue-900 text-sm md:text-base">“La visualisation des résultats est super claire, et j’ai enfin une vue d’ensemble sur mes paiements. Je recommande à tous les entrepreneurs !”</span>
                    <span className="font-semibold text-blue-700">— Sophie, testeuse TPE</span>
                  </div>
                  {/* Call-to-action */}
                  <button
                    className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition-all text-lg w-fit"
                    onClick={() => navigate('/signup')}
                  >
                    Essayez gratuitement Payment Flow
                  </button>
                </div>
                {/* Image à droite */}
                <div className="w-full md:w-2/3 flex items-center justify-center p-2 md:p-4">
                  <img
                    src="/images/2.png"
                    alt="Présentation Payment Flow 2"
                    className="w-full object-contain rounded-xl"
                    style={{ maxHeight: 540, background: '#fff' }}
                  />
                </div>
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="w-full flex flex-col items-center justify-center min-h-[350px] py-8">
              <h3 className="text-2xl md:text-3xl font-bold mb-6 text-blue-700 text-center">
                Essayez Payment Flow gratuitement pendant 30 jours !
              </h3>
              <div className="flex flex-col md:flex-row items-center md:items-stretch w-full max-w-3xl mx-auto">
                {/* Zone texte à gauche */}
                <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-4 items-center md:items-start">
                  <p className="text-gray-700 mb-6 text-base md:text-lg text-center md:text-left">
                    Profitez de toutes les fonctionnalités de Payment Flow sans engagement et sans carte bancaire. Testez la gestion automatisée de vos créances, le reporting en temps réel et l’accompagnement personnalisé : 0 risque, 100% efficacité.
                  </p>
                  <ul className="mb-6 text-blue-700 text-sm md:text-base flex flex-col gap-1">
                    <li className="flex items-center gap-2"><span className="inline-block w-4 h-4"><svg xmlns='http://www.w3.org/2000/svg' className='text-blue-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' /></svg></span>30 jours d’accès complet</li>
                    <li className="flex items-center gap-2"><span className="inline-block w-4 h-4"><svg xmlns='http://www.w3.org/2000/svg' className='text-blue-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' /></svg></span>Sans carte bancaire</li>
                    <li className="flex items-center gap-2"><span className="inline-block w-4 h-4"><svg xmlns='http://www.w3.org/2000/svg' className='text-blue-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' /></svg></span>Sans engagement</li>
                  </ul>
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition-all text-lg w-fit"
                    onClick={() => navigate('/signup') }
                  >
                    Commencer mon essai gratuit
                  </button>
                </div>
                {/* Logos clients et avis certifiés */}
                <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 gap-8">
                  <div className="flex flex-row items-center justify-center gap-8 mb-4">
                    <div className="flex flex-col items-center">
                      <img src="/images/image-de-marque.webp" alt="Logo Image de Marque" className="h-16 w-auto mb-2 rounded shadow-md bg-white p-2" />
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded shadow text-xs md:text-sm max-w-[180px]">
                        <span className="italic">“Grâce à Payment Flow, nous avons récupéré 98% de nos créances en 2 mois !”</span>
                        <br />— Julie, Dir. admin. Image de Marque
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <img src="/images/ouestelio.png" alt="Logo Ouestelio" className="h-16 w-auto mb-2 rounded shadow-md bg-white p-2" />
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded shadow text-xs md:text-sm max-w-[180px]">
                        <span className="italic">“La relance automatique a transformé notre trésorerie, c’est bluffant.”</span>
                        <br />— Marc, Gérant Ouestelio
                      </div>
                    </div>
                  </div>
                  {/* (Arrow removed to preserve layout; spacing retained) */}
                  <div className="w-full flex justify-center mt-4"></div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      {/* Pagination Swiper en-dessous */}
      <div className="flex justify-center mt-6">
        <div className="swiper-pagination" />
      </div>
    </div>
  </div>
</div>
</div>

{/* Section mobile/tablette uniquement */}
<div className="block md:hidden">
  <h2 className="text-2xl font-extrabold text-center text-neutral-900 mb-6 tracking-tight px-2">
    Découvrez comment Payment Flow peut vous aider !
  </h2>
  <div className="flex flex-col items-center">
    <div className="w-full max-w-md mx-auto">
      <div className="relative bg-white rounded-xl shadow-lg border border-blue-100 px-2 py-4 mt-8">
        <Swiper
          modules={[Navigation, Pagination]}
          pagination={{ clickable: true }}
          spaceBetween={0}
          slidesPerView={1}
          className="w-full"
        >
          {/* Slide 1 */}
          <SwiperSlide>
            <div className="flex flex-col items-center">
              <h3 className="text-xl font-bold mb-4 text-blue-700 text-center">Automatisez vos relances et gagnez du temps</h3>
              <img
                src="/images/1.png"
                alt="Présentation Payment Flow 1"
                className="w-full max-w-xs object-contain rounded-xl mb-4"
                style={{ background: '#fff' }}
              />
              <p className="text-gray-700 mb-4 text-base text-center px-2">
                Payment Flow vous permet de centraliser toutes vos créances, d’automatiser vos relances et de suivre vos paiements en temps réel. Gagnez en sérénité et concentrez-vous sur l’essentiel : votre activité.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-lg shadow-sm flex flex-col gap-2 mb-4">
                <span className="italic text-blue-900 text-sm">“J’ai testé Payment Flow pendant 1 mois et j’ai réduit mes impayés de moitié, sans stress. L’outil est intuitif et le support au top !”</span>
                <span className="font-semibold text-blue-700">— Claire, testeuse PME</span>
              </div>
              <button
                className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition-all text-base w-fit"
                onClick={() => navigate('/signup')}
              >
                Essayez gratuitement Payment Flow
              </button>
            </div>
          </SwiperSlide>
          {/* Slide 2 */}
          <SwiperSlide>
            <div className="flex flex-col items-center">
              <h3 className="text-xl font-bold mb-4 text-blue-700 text-center">Visualisez l’impact de vos actions</h3>
              <img
                src="/images/2.png"
                alt="Présentation Payment Flow 2"
                className="w-full max-w-xs object-contain rounded-xl mb-4"
                style={{ background: '#fff' }}
              />
              <p className="text-gray-700 mb-4 text-base text-center px-2">
                Suivez l’évolution de votre DSO, analysez vos résultats et partagez des rapports clairs à vos équipes ou partenaires. Payment Flow, c’est la maîtrise de votre trésorerie en un coup d’œil.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-lg shadow-sm flex flex-col gap-2 mb-4">
                <span className="italic text-blue-900 text-sm">“La visualisation des résultats est super claire, et j’ai enfin une vue d’ensemble sur mes paiements. Je recommande à tous les entrepreneurs !”</span>
                <span className="font-semibold text-blue-700">— Sophie, testeuse TPE</span>
              </div>
              <button
                className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition-all text-base w-fit"
                onClick={() => navigate('/signup')}
              >
                Essayez gratuitement Payment Flow
              </button>
            </div>
          </SwiperSlide>
          {/* Slide 3 */}
          <SwiperSlide>
            <div className="flex flex-col items-center">
              <h3 className="text-xl font-bold mb-4 text-blue-700 text-center">Essayez Payment Flow gratuitement pendant 30 jours !</h3>
              <ul className="mb-4 text-blue-700 text-sm flex flex-col gap-1 px-2">
                <li className="flex items-center gap-2"><span className="inline-block w-4 h-4"><svg xmlns='http://www.w3.org/2000/svg' className='text-blue-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' /></svg></span>30 jours d’accès complet</li>
                <li className="flex items-center gap-2"><span className="inline-block w-4 h-4"><svg xmlns='http://www.w3.org/2000/svg' className='text-blue-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' /></svg></span>Sans carte bancaire</li>
                <li className="flex items-center gap-2"><span className="inline-block w-4 h-4"><svg xmlns='http://www.w3.org/2000/svg' className='text-blue-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' /></svg></span>Sans engagement</li>
              </ul>
              {/* Logos clients et avis certifiés */}
              <div className="flex flex-col items-center gap-4 w-full">
                <div className="flex flex-col items-center">
                  <img src="/images/image-de-marque.webp" alt="Logo Image de Marque" className="h-16 w-auto mb-2 rounded shadow-md bg-white p-2" />
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded shadow text-xs max-w-[180px]">
                    <span className="italic">“Grâce à Payment Flow, nous avons récupéré 98% de nos créances en 2 mois !”</span>
                    <br />— Julie, Dir. admin. Image de Marque
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <img src="/images/ouestelio.png" alt="Logo Ouestelio" className="h-16 w-auto mb-2 rounded shadow-md bg-white p-2" />
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded shadow text-xs max-w-[180px]">
                    <span className="italic">“La relance automatique a transformé notre trésorerie, c’est bluffant.”</span>
                    <br />— Marc, Gérant Ouestelio
                  </div>
                </div>
              </div>
              <button
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition-all text-base w-fit mb-4"
                onClick={() => navigate('/signup') }
              >
                Commencer mon essai gratuit
              </button>
              {/* Pagination Swiper mobile - Slide 3 */}
              <div className="flex justify-center mt-6">
                <div />
              </div>
              {/* Pagination Swiper mobile - Slide 3 */}
              <div className="flex justify-center mt-6">
                <div className="swiper-pagination" />
              </div>
            </div>
          </SwiperSlide>
        </Swiper>

      </div>

    </div>
  </div>
</div>
</motion.div>


          {/* Section Tarifs supprimée. Voir la page dédiée. */}
          <div className="flex justify-center my-20">
            <button
              className="bg-blue-600 text-white px-8 py-4 rounded-md text-lg font-medium hover:bg-blue-700 transition-colors shadow-lg"
              onClick={() => {
                navigate('/pricing');
                window.scrollTo({ top: 0, behavior: 'auto' });
              }}
            >
              Voir les tarifs
            </button>
          </div>

          {/* Testimonials */}
          <motion.div
            id="testimonials"
            className="mt-32 relative"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 1 }}
            style={{ marginBottom: 0, paddingBottom: 0 }}
          >
            <motion.h2
              className="text-3xl font-bold text-center mb-16"
              variants={fadeInLeft}
            >
              Ce que nos clients disent
            </motion.h2>

            <div className="px-4 relative mb-10">
              {/* Navigation arrows */}
              <div className="swiper-button-prev testimonial-prev left-0 text-blue-600 hover:text-blue-800 transition-colors"></div>
              <div className="swiper-button-next testimonial-next right-0 text-blue-600 hover:text-blue-800 transition-colors"></div>

              <Swiper
                modules={[Navigation, Pagination]}
                navigation={{
                  prevEl: ".testimonial-prev",
                  nextEl: ".testimonial-next",
                }}
                spaceBetween={30}
                pagination={{
                  clickable: true,
                }}
                slidesPerView={1}
                breakpoints={{
                  640: { slidesPerView: 1 },
                  768: { slidesPerView: 2 },
                  1024: { slidesPerView: 3 },
                }}
                style={{ padding: "0 40px" }} // Add padding for arrow spacing
              >
                {[
                  {
                    name: "Sophie Martin",
                    role: "Directrice Financière, TechStart",
                    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
                    text: `"PaymentFlow a transformé notre processus de recouvrement. Nous avons réduit nos délais de paiement de 45 à 15 jours en moyenne."`,
                  },
                  {
                    name: "Thomas Dubois",
                    role: "CEO, Marketing Solutions",
                    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
                    text: `"L'automatisation des relances nous a fait gagner un temps précieux. Notre équipe peut désormais se concentrer sur des tâches à plus forte valeur ajoutée."`,
                  },
                  {
                    name: "Émilie Lefèvre",
                    role: "Responsable Comptabilité, GreenRetail",
                    img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
                    text: `"Les rapports détaillés nous permettent d'identifier rapidement les clients à risque et d'adapter notre stratégie de recouvrement en conséquence."`,
                  },
                  {
                    name: "Alexandre Moreau",
                    role: "Directeur Administratif, LogiTech",
                    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
                    text: `"L'intégration avec notre système comptable est impeccable. Gain de temps garanti dès le premier mois d'utilisation."`,
                  },
                  {
                    name: "Camille Rousseau",
                    role: "Cheffe de projet, StartUp Factory",
                    img: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
                    text: `"La personnalisation des modèles de relance a boosté notre taux de réponse de 30%. Un outil indispensable !"`,
                  },
                  {
                    name: "Nicolas Lambert",
                    role: "Responsable CRM, RetailPro",
                    img: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
                    text: `"Le suivi en temps réel des relances nous a permis d'optimiser notre trésorerie comme jamais auparavant."`,
                  },
                ].map((testimonial, index) => (
                  <SwiperSlide key={index}>
                    <motion.div
                      variants={fadeInLeft}
                      className="bg-white rounded-lg shadow-lg p-8 border border-gray-200 min-h-[250px] mx-4 my-10 flex flex-col"
                    >
                      <div className="flex items-center mb-6">
                        <img
                          src={testimonial.img}
                          alt={testimonial.name}
                          className="w-12 h-12 rounded-full object-cover mr-4"
                        />
                        <div>
                          <h4 className="font-bold">{testimonial.name}</h4>
                          <p className="text-gray-600 text-sm">
                            {testimonial.role}
                          </p>
                        </div>
                      </div>
                      <p
                        className="text-gray-700 italic flex-1"
                        style={{
                          display: "-webkit-box",
                          WebkitBoxOrient: "vertical",
                          WebkitLineClamp: 3, // Adjust the number of lines as needed
                          overflow: "hidden",
                        }}
                      >
                        {testimonial.text}
                      </p>
                    </motion.div>
                  </SwiperSlide>
                ))}
              </Swiper>
              <style>{`
                .testimonial-prev,
                .testimonial-next {
                  position: absolute;
                  top: 50%;
                  transform: translateY(-50%);
                  width: 40px;
                  height: 40px;
                  background: white;
                  border-radius: 50%;
                  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                  z-index: 10;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  cursor: pointer;
                  transition: all 0.3s ease;
                }

                .testimonial-prev:hover,
                .testimonial-next:hover {
                  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
                  transform: translateY(-50%) scale(1.05);
                }

                .testimonial-prev::after,
                .testimonial-next::after {
                  font-size: 1.5rem;
                  color: currentColor;
                  font-weight: bold;
                }

                @media (max-width: 768px) {
                  .testimonial-prev,
                  .testimonial-next {
                    display: none;
                  }
                }
              `}</style>
            </div>
          </motion.div>
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
          <InlineWidget
            url="https://calendly.com/paymentfloww/30min"
            styles={{
              height: "100%",
              width: "100%",
              margin: "0",
              padding: "0",
            }}
          />
        </div>
        <div className="fixed bottom-20 right-4 z-[60] md:bottom-20">
          <button
             onClick={() => {
               const calendlySection = document.querySelector('.calendly-container');
               if (calendlySection) {
                 calendlySection.scrollIntoView({ behavior: 'smooth' });
               } else {
                 window.location.hash = '#calendly';
               }
             }}
             className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition-all text-sm md:text-base md:px-6 md:py-3"
           >
             planifier une réunion
           </button>
        </div>
      </main>

      <Footer />

      {/* Modal Privacy Policy */}
      {showPrivacyPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Politique de confidentialité
              </h2>
              <button
                onClick={() => setShowPrivacyPolicy(false)}
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
      {showTerms && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Conditions d'utilisation
              </h2>
              <button
                onClick={() => setShowTerms(false)}
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
      {showLegalNotice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Mentions légales
              </h2>
              <button
                onClick={() => setShowLegalNotice(false)}
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

      {/* Modal Contact */}
      {showContact && (
        <>
          <ContactModal
            onClose={() => setShowContact(false)}
            defaultSubject={defaultSubject}
          />

          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 hidden">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Contactez-nous
                </h2>
                <button
                  onClick={() => setShowContact(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {contactSubmitted ? (
                <div className="text-center py-8">
                  <div className="bg-green-100 text-green-700 p-4 rounded-md mb-4 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 mr-2" />
                    <span>Votre message a été envoyé avec succès !</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Nous vous répondrons dans les plus brefs délais.
                  </p>
                  <button
                    onClick={() => setShowContact(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  {contactError && (
                    <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
                      {contactError}
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Nom complet
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={contactFormData.name}
                      onChange={(e) =>
                        setContactFormData({
                          ...contactFormData,
                          name: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2  focus:ring-blue-500 focus:border-transparent"
                      placeholder="Votre nom"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={contactFormData.email}
                      onChange={(e) =>
                        setContactFormData({
                          ...contactFormData,
                          email: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="votre@email.com"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Sujet
                    </label>
                    <select
                      id="subject"
                      value={contactFormData.subject}
                      onChange={(e) =>
                        setContactFormData({
                          ...contactFormData,
                          subject: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Sélectionnez un sujet</option>
                      <option value="demo">Demande de démonstration</option>
                      <option value="pricing">Informations tarifaires</option>
                      <option value="support">Support technique</option>
                      <option value="partnership">Partenariat</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      value={contactFormData.message}
                      onChange={(e) =>
                        setContactFormData({
                          ...contactFormData,
                          message: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Comment pouvons-nous vous aider ?"
                      required
                    ></textarea>
                  </div>

                  <div className="flex items-start">
                    <input
                      id="privacy"
                      type="checkbox"
                      checked={contactFormData.privacy}
                      onChange={(e) =>
                        setContactFormData({
                          ...contactFormData,
                          privacy: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                      required
                    />
                    <label
                      htmlFor="privacy"
                      className="ml-2 block text-sm text-gray-500"
                    >
                      J'accepte que mes données soient traitées conformément à
                      la{" "}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowContact(false);
                          setShowPrivacyPolicy(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        politique de confidentialité
                      </button>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={contactSubmitting}
                    className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {contactSubmitting ? "Envoi en cours..." : "Envoyer"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
