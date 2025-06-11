import React, { useState, useRef, useEffect } from "react";
import { motion, useInView, Variants } from "framer-motion";
import { InlineWidget } from "react-calendly";
import { useLocation, useNavigate } from "react-router-dom";

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
// Import required Swiper modules
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import ContactModal from "../pages/ContactModal";

import {
  Target,
  Mail,
  BarChart2,
  CheckCircle,
  X,
} from "lucide-react";
import { sendContactForm } from "../lib/contactService";

import { User } from "@supabase/supabase-js";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import workflowImage from "../assets/images/workflow.jpg";
import FeatureDropdown from "../components/FeatureDropdown";
interface LandingPageProps {
  onGetStarted?: () => void;
  user?: User;
}

export default function LandingPage({ onGetStarted = () => {} }: LandingPageProps) {
  const navigate = useNavigate();
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showLegalNotice, setShowLegalNotice] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
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

  // Chargement du script Storylane
  useEffect(() => {
    const scriptId = 'storylane-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://js.storylane.io/js/v2/storylane.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

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

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const fadeInRight: Variants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const fadeInScale: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6 },
    },
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const fadeInLeft: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
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
            className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
          >
            <div className="text-left">
              <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                <span className="text-gray-900">Automatisez vos</span><br />
                <span className="text-blue-600">relances clients.</span>
              </h1>
              <div className="space-y-6 mb-8">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="text-left">
                    <p className="font-semibold">Divisez par 3 le temps entre émission de facture et encaissement.</p>
                    <p className="text-gray-600">Grâce à des relances automatiques et ciblées selon le profil payeur.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="text-left">
                    <p className="font-semibold">Boostez votre trésorerie de +20% dès le premier mois.</p>
                    <p className="text-gray-600">Suivi en temps réel de vos encours et reporting intelligent.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="text-left">
                    <p className="font-semibold">Zéro stress, zéro oubli : chaque client est relancé au bon moment.</p>
                    <p className="text-gray-600">Workflow de relance personnalisé + sécurité des données renforcée.</p>
                  </div>
                </div>
              </div>
              <Link to="/signup">
                <button className="bg-blue-600 text-white px-8 py-4 rounded-md text-lg font-medium hover:bg-blue-700 transition-colors">
                  Essayer gratuitement
                </button>
              </Link>
            </div>
            <div className="relative flex justify-center items-center p-4 -mr-32 scale-110">
              <div className="relative w-full max-w-5xl">
                <img
                  src={workflowImage}
                  alt="Workflow de relance automatisé"
                  className="w-full h-auto rounded-2xl transition-transform hover:scale-102 object-contain"
                  style={{ imageRendering: 'crisp-edges' }}
                />
              </div>
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
                Identifiez les meilleurs moments pour relancer vos prospects
                B2B.
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

          {/* Dashboard Demo */}
          <motion.div
            className="mt-32"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <h2 className="text-3xl font-bold text-center mb-12">
              Découvrez notre tableau de bord intuitif
            </h2>
            <motion.div
              variants={fadeInUp}
              className="max-w-6xl mx-auto"
            >
              <div>
                <div
                  className="sl-embed"
                  style={{
                    position: 'relative',
                    paddingBottom: 'calc(50.42% + 25px)',
                    width: '100%',
                    height: 0,
                    transform: 'scale(1)',
                  }}
                >
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
                    title="Démonstration Dashboard PaymentFlow"
                  ></iframe>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Use Cases */}
          <motion.div
            className="mt-32"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <h2 className="text-3xl font-bold text-center mb-16">
              Comment PaymentFlow peut vous aider
            </h2>

            <div className="space-y-24">
              {/* Section 1 - Réduisez votre encours */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <motion.div variants={fadeInLeft} className="order-2 md:order-1">
                  <img
                    src="/images/1.jpg"
                    alt="Réduisez votre encours client"
                    className="w-full rounded-lg shadow-lg"
                    loading="eager"
                  />
                </motion.div>
                <motion.div variants={fadeInRight} className="order-1 md:order-2">
                  <h3 className="text-2xl font-bold mb-4">
                    Réduisez votre encours client d'au moins 40%
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                      <span>Modèle d'email personnalisable</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                      <span>Séquence de relance multi-étapes</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                      <span>Plannification intelligente des envois</span>
                    </li>
                  </ul>
                </motion.div>
              </div>

              {/* Section 2 - Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <motion.div variants={fadeInLeft} className="space-y-6">
                  <h3 className="text-2xl font-bold mb-4">
                    Un tableau de bord complet pour piloter vos créances
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                      <span>Tableau de bord centralisé pour toutes vos créances</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                      <span>Alertes automatiques pour les retards de paiements</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                      <span>Suivi détaillé de l'historique des relances</span>
                    </li>
                  </ul>
                </motion.div>
                <motion.div variants={fadeInRight}>
                  <img
                    src="/images/2.jpg"
                    alt="Tableau de bord PaymentFlow"
                    className="w-full rounded-lg shadow-lg"
                    loading="eager"
                  />
                </motion.div>
              </div>


            </div>
          </motion.div>

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
              <div className="swiper-button-prev testimonial-prev left-0 text-blue-600 hover:text-blue-800 transition-colors"></div>
              <div className="swiper-button-next testimonial-next right-0 text-blue-600 hover:text-blue-800 transition-colors"></div>

              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                navigation={{
                  prevEl: ".testimonial-prev",
                  nextEl: ".testimonial-next",
                }}
                pagination={{
                  clickable: true,
                  dynamicBullets: true,
                }}
                spaceBetween={30}
                slidesPerView={1}
                loop={true}
                autoplay={{
                  delay: 5000,
                  disableOnInteraction: false,
                }}
                breakpoints={{
                  640: { slidesPerView: 1 },
                  768: { slidesPerView: 2 },
                  1024: { slidesPerView: 3 },
                }}
                style={{ padding: "0 40px" }}
              >
                {[
                  {
                    name: "Sophie Martin",
                    role: "Directrice Financière, TechStart",
                    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
                    text: `"PaymentFlow a transformé notre processus de recouvrement. Nous avons réduit nos délais de paiement de 45 à 15 jours en moyenne."`
                  },
                  {
                    name: "Thomas Dubois",
                    role: "CEO, Marketing Solutions",
                    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
                    text: `"L'automatisation des relances nous a fait gagner un temps précieux. Notre équipe peut désormais se concentrer sur des tâches à plus forte valeur ajoutée."`
                  },
                  {
                    name: "Émilie Lefèvre",
                    role: "Responsable Comptabilité, GreenRetail",
                    img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
                    text: `"Les rapports détaillés nous permettent d'identifier rapidement les clients à risque et d'adapter notre stratégie de recouvrement en conséquence."`
                  },
                  {
                    name: "Alexandre Moreau",
                    role: "Directeur Administratif, LogiTech",
                    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
                    text: `"L'intégration avec notre système comptable est impeccable. Gain de temps garanti dès le premier mois d'utilisation."`
                  },
                  {
                    name: "Camille Rousseau",
                    role: "Cheffe de projet, StartUp Factory",
                    img: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
                    text: `"La personnalisation des modèles de relance a boosté notre taux de réponse de 30%. Un outil indispensable !"`
                  },
                  {
                    name: "Nicolas Lambert",
                    role: "Responsable CRM, RetailPro",
                    img: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
                    text: `"Le suivi en temps réel des relances nous a permis d'optimiser notre trésorerie comme jamais auparavant."`
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
                          WebkitLineClamp: 3,
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
                .swiper-button-prev,
                .swiper-button-next {
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

                .swiper-button-prev:hover,
                .swiper-button-next:hover {
                  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
                  transform: translateY(-50%) scale(1.05);
                }

                .swiper-button-prev::after,
                .swiper-button-next::after {
                  font-size: 1.5rem;
                  color: currentColor;
                  font-weight: bold;
                }

                .testimonial-prev,
                .testimonial-next {
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

                .swiper-pagination {
                  position: relative;
                  margin-top: 20px;
                }

                .swiper-pagination-bullet {
                  width: 10px;
                  height: 10px;
                  background: #e2e8f0;
                  opacity: 1;
                }

                .swiper-pagination-bullet-active {
                  background: #3b82f6;
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
            onClick={() =>
              (window as any).Calendly.initPopupWidget({
                url: "https://calendly.com/paymentfloww/30min",
              })
            }
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
              <div className="hidden md:flex space-x-8">
                <div className="relative group">
                  <button 
                    onMouseEnter={() => setShowFeatures(true)}
                    onMouseLeave={() => setShowFeatures(false)}
                    onClick={() => scrollToSection('features')} 
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Fonctionnalités
                  </button>
                  <div 
                    className="absolute left-0 z-50"
                    onMouseEnter={() => setShowFeatures(true)}
                    onMouseLeave={() => setShowFeatures(false)}
                  >
                    <FeatureDropdown isOpen={showFeatures} />
                  </div>
                </div>
                <button onClick={() => scrollToSection('testimonials')} className="text-gray-600 hover:text-gray-900">
                  Témoignages
                </button>
                <button onClick={() => scrollToSection('pricing')} className="text-gray-600 hover:text-gray-900">
                  Tarifs
                </button>
                <button onClick={() => setShowContact(true)} className="text-gray-600 hover:text-gray-900">
                  Contact
                </button>
              </div>
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
