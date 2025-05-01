import { motion, useInView } from "framer-motion";
import { useNavigate } from "react-router-dom";
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
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showLegalNotice, setShowLegalNotice] = useState(false);
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
      transition: { duration: 0.6, ease: "easeOut" },
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

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  // New fadeInLeft animation variant
  const fadeInLeft = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const handleNavToSection = (id: string) => {
    if (window.location.pathname === "/") {
      scrollToSection(id);
    } else {
      navigate(`/#${id}`);
    }
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
                <button
                  onClick={() => handleNavToSection("pricing")}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Tarifs
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavToSection("testimonials")}
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
                <button className="text-gray-500 hover:text-gray-700">
                  Blog
                </button>
              </li>
              <li>
                <button className="text-gray-500 hover:text-gray-700">
                  Guides
                </button>
              </li>
              <li>
                <button className="text-gray-500 hover:text-gray-700">
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
                  onClick={() => setShowPrivacyPolicy(true)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Politique de confidentialité
                </button>
              </li>
              <li>
                <button
                  onClick={() => setShowTerms(true)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Conditions d'utilisation
                </button>
              </li>
              <li>
                <button
                  onClick={() => setShowLegalNotice(true)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Mentions légales
                </button>
              </li>
              <li>
                <button
                  onClick={() => setShowContact(true)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Contactez-nous
                </button>
              </li>
            </ul>
          </div>
        </motion.div>

        <motion.div
          className="pt-8 border-t border-gray-200 text-center text-sm text-gray-500"
          variants={fadeInLeft}
        >
          <p>© 2024 PaymentFlow. Tous droits réservés.</p>
        </motion.div>
      </div>
      {/* Modal Privacy Policy */}
      {showPrivacyPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Politique de confidentialité</h2>
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
                Nous collectons des informations lorsque vous vous inscrivez sur notre site, lorsque vous vous connectez à votre compte, faites un achat, participez à un concours, et/ou lorsque vous vous déconnectez. Les informations collectées incluent votre nom, votre adresse e-mail, numéro de téléphone, et/ou carte de crédit.
              </p>
              <p>
                En outre, nous recevons et enregistrons automatiquement des informations à partir de votre ordinateur et navigateur, y compris votre adresse IP, vos logiciels et votre matériel, et la page que vous demandez.
              </p>
              
              <h3>2. Utilisation des informations</h3>
              <p>
                Toutes les informations que nous recueillons auprès de vous peuvent être utilisées pour :
              </p>
              <ul>
                <li>Personnaliser votre expérience et répondre à vos besoins individuels</li>
                <li>Fournir un contenu publicitaire personnalisé</li>
                <li>Améliorer notre site Web</li>
                <li>Améliorer le service client et vos besoins de prise en charge</li>
                <li>Vous contacter par e-mail</li>
                <li>Administrer un concours, une promotion, ou une enquête</li>
              </ul>
              
              <h3>3. Confidentialité du commerce en ligne</h3>
              <p>
                Nous sommes les seuls propriétaires des informations recueillies sur ce site. Vos informations personnelles ne seront pas vendues, échangées, transférées, ou données à une autre société pour n'importe quelle raison, sans votre consentement, en dehors de ce qui est nécessaire pour répondre à une demande et/ou une transaction.
              </p>
              
              <h3>4. Divulgation à des tiers</h3>
              <p>
                Nous ne vendons, n'échangeons et ne transférons pas vos informations personnelles identifiables à des tiers. Cela ne comprend pas les tierces parties de confiance qui nous aident à exploiter notre site Web ou à mener nos affaires, tant que ces parties conviennent de garder ces informations confidentielles.
              </p>
              
              <h3>5. Protection des informations</h3>
              <p>
                Nous mettons en œuvre une variété de mesures de sécurité pour préserver la sécurité de vos informations personnelles. Nous utilisons un cryptage à la pointe de la technologie pour protéger les informations sensibles transmises en ligne. Nous protégeons également vos informations hors ligne.
              </p>
              
              <h3>6. Consentement</h3>
              <p>
                En utilisant notre site, vous consentez à notre politique de confidentialité.
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
              <h2 className="text-2xl font-bold text-gray-900">Conditions d'utilisation</h2>
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
                En accédant à ce site web, vous acceptez d'être lié par ces conditions d'utilisation, toutes les lois et réglementations applicables, et vous acceptez que vous êtes responsable du respect des lois locales applicables. Si vous n'acceptez pas l'une de ces conditions, il vous est interdit d'utiliser ou d'accéder à ce site.
              </p>
              
              <h3>2. Licence d'utilisation</h3>
              <p>
                L'autorisation est accordée de télécharger temporairement une copie des documents (informations ou logiciels) sur le site web de PaymentFlow pour un visionnage transitoire personnel et non commercial uniquement. Il s'agit de l'octroi d'une licence, et non d'un transfert de titre, et sous cette licence, vous ne pouvez pas :
              </p>
              <ul>
                <li>modifier ou copier les documents;</li>
                <li>utiliser les documents à des fins commerciales ou pour une présentation publique;</li>
                <li>tenter de décompiler ou de désosser tout logiciel contenu sur le site web de PaymentFlow;</li>
                <li>supprimer tout droit d'auteur ou autres notations de propriété des documents; ou</li>
                <li>transférer les documents à une autre personne ou "miroir" les documents sur un autre serveur.</li>
              </ul>
              
              <h3>3. Avis de non-responsabilité</h3>
              <p>
                Les documents sur le site web de PaymentFlow sont fournis "tels quels". PaymentFlow ne donne aucune garantie, expresse ou implicite, et décline et annule par la présente toutes les autres garanties, y compris, sans limitation, les garanties implicites ou les conditions de qualité marchande, d'adéquation à un usage particulier, ou de non-violation de la propriété intellectuelle ou autre violation des droits.
              </p>
              
              <h3>4. Limitations</h3>
              <p>
                En aucun cas, PaymentFlow ou ses fournisseurs ne seront responsables de tout dommage (y compris, sans limitation, les dommages pour perte de données ou de profit, ou en raison d'une interruption d'activité) découlant de l'utilisation ou de l'incapacité d'utiliser les matériaux sur le site web de PaymentFlow, même si PaymentFlow ou un représentant autorisé de PaymentFlow a été informé oralement ou par écrit de la possibilité de tels dommages.
              </p>
              
              <h3>5. Révisions et errata</h3>
              <p>
                Les documents apparaissant sur le site web de PaymentFlow peuvent inclure des erreurs techniques, typographiques ou photographiques. PaymentFlow ne garantit pas que l'un des documents sur son site web est exact, complet ou à jour. PaymentFlow peut apporter des modifications aux documents contenus sur son site web à tout moment sans préavis.
              </p>
              
              <h3>6. Liens</h3>
              <p>
                PaymentFlow n'a pas examiné tous les sites liés à son site web et n'est pas responsable du contenu de ces sites liés. L'inclusion de tout lien n'implique pas l'approbation par PaymentFlow du site. L'utilisation de tout site web lié est aux risques et périls de l'utilisateur.
              </p>
              
              <h3>7. Modifications des conditions d'utilisation</h3>
              <p>
                PaymentFlow peut réviser ces conditions d'utilisation de son site web à tout moment sans préavis. En utilisant ce site web, vous acceptez d'être lié par la version alors en vigueur de ces conditions d'utilisation.
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
              <h2 className="text-2xl font-bold text-gray-900">Mentions légales</h2>
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
                L'ensemble du contenu du site PaymentFlow, incluant, de façon non limitative, les graphismes, images, textes, vidéos, animations, sons, logos, gifs et icônes ainsi que leur mise en forme sont la propriété exclusive de PaymentFlow SAS à l'exception des marques, logos ou contenus appartenant à d'autres sociétés partenaires ou auteurs.
              </p>
              <p>
                Toute reproduction, distribution, modification, adaptation, retransmission ou publication, même partielle, de ces différents éléments est strictement interdite sans l'accord exprès par écrit de PaymentFlow SAS.
              </p>
              
              <h3>Protection des données personnelles</h3>
              <p>
                Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition aux données personnelles vous concernant.
              </p>
              <p>
                Pour exercer ces droits, vous pouvez nous contacter à l'adresse email suivante : dpo@paymentflow.com ou par courrier à l'adresse du siège social indiquée ci-dessus.
              </p>
              
              <h3>Cookies</h3>
              <p>
                Notre site utilise des cookies pour améliorer l'expérience utilisateur. En naviguant sur notre site, vous acceptez l'utilisation de cookies conformément à notre politique de confidentialité.
              </p>
              
              <h3>Loi applicable et juridiction</h3>
              <p>
                Les présentes mentions légales sont régies par le droit français. En cas de litige, les tribunaux français seront seuls compétents.
              </p>
              
              <h3>Contact</h3>
              <p>
                Pour toute question relative aux présentes mentions légales ou pour toute demande concernant le site, vous pouvez nous contacter à l'adresse suivante : legal@paymentflow.com
              </p>
            </div>
          </div>
        </div> )}      
        {showContact && <ContactModal onClose={() => setShowContact(false)} />}
        </motion.footer>
    

  
)};

export default Footer;
