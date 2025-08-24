import { motion, useInView } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import {
  BarChart2,
  Mail,
  Target,
  TrendingUp,
  X,
  CheckCircle,
  ChevronRight,
} from "lucide-react";
import ContactModal from "../pages/ContactModal";

// Animation variants (déplacés hors du composant)
const fadeInScale = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6 },
  },
};
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};
const fadeInLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.42, 0, 0.58, 1] as [number, number, number, number] },
  },
};

const Footer = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
    setIsMobileMenuOpen(false);
  };

  const navigate = useNavigate();
  const calendlyRef = useRef<any>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showContact, setShowContact] = useState(false);

  const showContactModalRef = useRef(showContactModal);
  const isMobileMenuOpenRef = useRef(isMobileMenuOpen);

  useEffect(() => {
    showContactModalRef.current = showContactModal;
  }, [showContactModal]);

  useEffect(() => {
    isMobileMenuOpenRef.current = isMobileMenuOpen;
  }, [isMobileMenuOpen]);

  // Add ESC key handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        // Close contact modal first if open
        if (showContactModalRef.current) {
          setShowContactModal(false);
        }
        // Then close mobile menu if open
        else if (isMobileMenuOpenRef.current) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.42, 0, 0.58, 1] as [number, number, number, number] },
    },
  };


  const handleNavToSection = (id: string) => {
    if (window.location.pathname === "/") {
      scrollToSection(id);
    } else {
      navigate(`/#${id}`);
    }
  };

  // --- Détection extensions/suspicious scripts ---
  const [extensionAlert, setExtensionAlert] = useState<string|null>(null);
  useEffect(() => {
    // Liste de patterns connus pour scripts d'extensions courantes (adblock, capture, etc)
    const suspiciousPatterns = [
      'chrome-extension://',
      'adblock',
      'web-capture',
      'cookie-banner',
      'Switch-',
      'polyfill.js',
      'feature.js',
      'lib/web-capture-bootstrap.js',
    ];
    // Liste tous les scripts présents
    const scripts = Array.from(document.getElementsByTagName('script'));
    const found = scripts.find(script => {
      const src = script.src || '';
      return suspiciousPatterns.some(pattern => src.includes(pattern));
    });
    if (found) {
      setExtensionAlert('Attention : Des extensions ou scripts tiers sont détectés sur cette page. Cela peut entraîner des bugs ou une surconsommation mémoire. Essayez de désactiver vos extensions ou d\'utiliser la navigation privée.');
    }
  }, []);

  // --- Reset cache/localStorage ---
  const handleResetCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  return (
    <motion.footer
      className="bg-gray-50 border-t border-gray-200 py-12"
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }} // Trigger only when fully in view
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8"
          variants={fadeInLeft}
        >
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-semibold text-gray-900">
                PaymentFlow
              </span>
            </div>
            <p className="text-gray-500 text-sm">
              La solution de gestion des relances qui optimise votre trésorerie.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Produit</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => handleNavToSection("features")}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Fonctionnalités
                </button>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-gray-500 hover:text-gray-700"
                  onClick={e => {
                    e.preventDefault();
                    navigate('/pricing');
                    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                  }}
                >
                  Tarifs
                </Link>
              </li>
              <li>
                <button
                  onClick={() => navigate('/temoignages')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Témoignages
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Ressources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => navigate('/blog')}
                >
                  Blog
                </button>
              </li>
              <li>
                <button
  className="text-gray-500 hover:text-gray-700"
  onClick={() => navigate('/help')}
>
  Guides
</button>
              </li>
              <li>
                <button className="text-gray-500 hover:text-gray-700" onClick={() => navigate('/help')}>
  Support
</button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Légal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => navigate('/privacy')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Politique de confidentialité
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/conditions-utilisation')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Conditions d'utilisation
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/mentions-legales')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Mentions légales
                </button>
              </li>
              <li>
                <button
                  onClick={() => setShowContactModal(true)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Contactez-nous
                </button>
              </li>
            </ul>
          </div>
        </motion.div>
        {showContactModal && (
          <ContactModal onClose={() => setShowContactModal(false)} />
        )}
        <motion.div
          className="pt-8 border-t border-gray-200 text-center text-sm text-gray-500"
          variants={fadeInLeft}
        >
          <p>2024 PaymentFlow. Tous droits réservés.</p>
          {/* Bouton reset cache/localStorage */}
          <button
            className="mt-4 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
            onClick={handleResetCache}
          >
            Réinitialiser le cache / localStorage
          </button>
          {/* Alerte extensions/suspicious scripts */}
          {extensionAlert && (
            <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded border border-yellow-300">
              {extensionAlert}
            </div>
          )}
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;
