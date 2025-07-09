import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TrendingUp, X, BarChart3, Users, FileText, Settings } from "lucide-react";
import AnimatedResourceIcon from "./AnimatedResourceIcon";
import { Menu as HeadlessMenu } from "@headlessui/react";
import { supabase } from "../lib/supabase";
import { User } from "@supabase/supabase-js";
import ContactModal from "../pages/ContactModal";

interface AppHeaderProps {
  onContactClick: () => void;
  user: User | null;
}

export default function AppHeader({ user }: AppHeaderProps) {
  const navigate = useNavigate();
  const calendlyRef = useRef<any>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFeaturesMenuOpen, setIsFeaturesMenuOpen] = useState(false);
  const [isResourcesMenuOpen, setIsResourcesMenuOpen] = useState(false);

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

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      // If there's an error other than a 403, throw it
      if (error && error.status !== 403) {
        throw error;
      }
    } catch (err: any) {
      if (err?.status !== 403) {
        console.error("Error signing out:", err);
      }
    } finally {
      // Clear local storage and navigate to the home page
      localStorage.clear();
      navigate("/");
    }
  };

  const handleNavToSection = (id: string) => {
    if (window.location.pathname === "/") {
      scrollToSection(id);
    } else {
      navigate(`/#${id}`);
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo Link */}
        <Link to="/" className="flex items-center space-x-2">
          <TrendingUp className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">PaymentFlow</span>
        </Link>

        {/* Desktop Navigation (only if user is not logged in) */}
        {!user && (
          <div className="hidden md:flex space-x-8">
            <div 
              className="relative inline-block text-left" 
              onMouseEnter={() => { setIsFeaturesMenuOpen(true); setIsResourcesMenuOpen(false); }}
              onMouseLeave={() => setIsFeaturesMenuOpen(false)}
            >
              <button 
                className="text-gray-600 hover:text-gray-900 inline-flex items-center px-3 py-2 -mx-3 cursor-pointer"
              >
                Fonctionnalités
                <svg 
                  className={`ml-1 h-5 w-5 transform transition-transform duration-200 ${isFeaturesMenuOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isFeaturesMenuOpen && (
                <div className="absolute left-0 top-full">
                  <div className="h-2 w-full" />
                  <div className="w-64 origin-top-left bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="p-1">
                      <button
                        onClick={() => navigate("/reporting-recouvrement")}
                        className="group flex rounded-md items-center w-full px-3 py-2 text-sm text-gray-900 hover:bg-blue-50 transition-colors"
                      >
                        <BarChart3 className="mr-3 h-5 w-5 text-blue-600" />
                        Reporting de recouvrement
                      </button>
                      <button
                        onClick={() => navigate("/crm")}
                        className="group flex rounded-md items-center w-full px-3 py-2 text-sm text-gray-900 hover:bg-blue-50 transition-colors"
                      >
                        <Users className="mr-3 h-5 w-5 text-blue-600" />
                        CRM
                      </button>



                      <button
                        onClick={() => navigate("/simulateur-dso")}
                        className="group flex rounded-md items-center w-full px-3 py-2 text-sm text-gray-900 hover:bg-blue-50 transition-colors"
                      >
                        <FileText className="mr-3 h-5 w-5 text-blue-600" />
                        Outils de créances
                      </button>

                      <button
                        onClick={() => { setIsFeaturesMenuOpen(false); navigate("/personnalisation"); }}
                        className="group flex rounded-md items-center w-full px-3 py-2 text-sm text-gray-900 hover:bg-blue-50 transition-colors"
                      >
                        <Settings className="mr-3 h-5 w-5 text-blue-600" />
                        Personnalisation
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div 
              className="relative inline-block text-left"
              onMouseEnter={() => { setIsResourcesMenuOpen(true); setIsFeaturesMenuOpen(false); }}
              onMouseLeave={() => setIsResourcesMenuOpen(false)}
            >
              <button 
                className="text-gray-600 hover:text-gray-900 inline-flex items-center px-3 py-2 -mx-3 cursor-pointer"
              >
                Ressources
                <svg 
                  className={`ml-1 h-5 w-5 transform transition-transform duration-200 ${isResourcesMenuOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isResourcesMenuOpen && (
                <div className="absolute left-0 top-full z-50">
                  <div className="h-2 w-full" />
                  <div className="w-48 origin-top-left bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="p-1">
                      <button
                        onClick={() => handleNavToSection("testimonials")}
                        className="group flex rounded-md items-center w-full px-3 py-2 text-sm text-gray-900 hover:bg-blue-50 transition-colors gap-2"
                      >
                        <AnimatedResourceIcon type="testimonials" />
                        Témoignages
                      </button>
                      <button
                        onClick={() => navigate("/blog")}
                        className="group flex rounded-md items-center w-full px-3 py-2 text-sm text-gray-900 hover:bg-blue-50 transition-colors gap-2"
                      >
                        <AnimatedResourceIcon type="blog" />
                        Blog
                      </button>
                      <button
                        onClick={() => navigate("/help")}
                        className="group flex rounded-md items-center w-full px-3 py-2 text-sm text-gray-900 hover:bg-blue-50 transition-colors gap-2"
                      >
                        <AnimatedResourceIcon type="guides" />
                        Guides
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <Link
              to="/pricing"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 -mx-3"
            >
              Tarifs
            </Link>


            <button
              onClick={() => setShowContactModal(true)}
              className="text-gray-600 hover:text-gray-900"
            >
              Contact
            </button>
          </div>
        )}

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-2">
          {!user && (
            <>
              <Link
                to="/login"
                className="text-blue-600 px-4 py-2 rounded-md underline hover:bg-blue-50 transition-colors"
              >
                Connexion
              </Link>
              <Link
                to="/signup"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                S'inscrire
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-600 hover:text-gray-900"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <TrendingUp className="h-6 w-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {!user && (
              <>
                <button
                  onClick={() => scrollToSection("features")}
                  className="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                >
                  Fonctionnalités
                </button>
                {/* Mobile Ressources submenu */}
                <div className="relative">
                  <button
                    onClick={() => setIsResourcesMenuOpen(!isResourcesMenuOpen)}
                    className="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md flex items-center justify-between"
                  >
                    Ressources
                    <svg
                      className={`ml-2 h-5 w-5 transform transition-transform duration-200 ${isResourcesMenuOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isResourcesMenuOpen && (
                    <div className="absolute left-0 w-48 mt-2 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                      <button
                        onClick={() => { scrollToSection("testimonials"); setIsResourcesMenuOpen(false); setIsMobileMenuOpen(false); }}
                        className="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md flex items-center gap-2 group"
                      >
                        <AnimatedResourceIcon type="testimonials" />
                        Témoignages
                      </button>
                      <button
                        onClick={() => { navigate("/blog"); setIsResourcesMenuOpen(false); setIsMobileMenuOpen(false); }}
                        className="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md flex items-center gap-2 group"
                      >
                        <AnimatedResourceIcon type="blog" />
                        Blog
                      </button>
                      <button
                        onClick={() => { navigate("/help"); setIsResourcesMenuOpen(false); setIsMobileMenuOpen(false); }}
                        className="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md flex items-center gap-2 group"
                      >
                        <AnimatedResourceIcon type="guides" />
                        Guides
                      </button>
                    </div>
                  )}
                </div>
                <a
                  href="/help"
                  className="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                >
                  Guides
                </a>
                <button
                  onClick={() => setShowContactModal(true)}
                  className="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                >
                  Contact
                </button>
              </>
            )}
            {/* Add Dashboard link here */}
            {user && (
              <button
                onClick={handleSignOut}
                className="block w-full text-left px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
              >
                Déconnexion
              </button>
            )}
            {!user && (
              <>
                <Link
                  to="/login"
                  className="block w-full text-left px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md"
                >
                  Connexion
                </Link>
                <Link
                  to="/signup"
                  className="block w-full text-left px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md"
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Calendly Button - Adjusted for mobile */}
      {showContactModal && (
        <ContactModal onClose={() => setShowContactModal(false)} />
      )}
    </header>
  );
}
