import React, { useState, useEffect } from 'react';
import { Search, Menu, X, LifeBuoy, BookOpen, MessageCircle, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={' bg-white shadow-sm sticky top-0 z-50' }
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2">
          <TrendingUp className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">PaymentFlow</span>
        </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
            <a
              href="#"
              className={`text-gray-600 hover:text-gray-900`}
            >
              Accueil
            </a>
            <a
              href="#faq"
              className={`className="text-gray-600 hover:text-gray-900`}
            >
              FAQ
            </a>
            <a
              href="#contact"
              className="text-gray-600 hover:text-gray-900"
            >
              Contact
            </a>
            <a
              href="#knowledge-base"
              className="text-gray-600 hover:text-gray-900"
            >
              Base de connaissances
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <div className={`relative hidden md:block transition-all ${isScrolled ? 'text-gray-700' : 'text-white'}`}>
              <input
                type="text"
                placeholder="Rechercher de l'aide..."
                className={`pl-10 pr-4 py-2 rounded-full text-sm transition-all focus:outline-none focus:ring-2 ${
                  isScrolled
                    ? 'bg-gray-100 text-gray-800 focus:ring-blue-300'
                    : 'bg-blue-500 text-white placeholder-blue-200 focus:ring-blue-400'
                }`}
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4" />
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden ${isScrolled ? 'text-gray-700' : 'text-white'}`}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-white text-gray-800 shadow-lg rounded-b-lg p-4 animate-fade-in-down">
            <div className="flex items-center mb-4">
              <Search className="h-5 w-5 text-gray-500 mr-2" />
              <input
                type="text"
                placeholder="Rechercher de l'aide..."
                className="w-full p-2 border border-gray-300 rounded text-sm"
              />
            </div>
            <nav className="flex flex-col space-y-3">
              <a href="#" className="px-2 py-1 hover:bg-blue-50 rounded-md flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                <span>Accueil</span>
              </a>
              <a href="#faq" className="px-2 py-1 hover:bg-blue-50 rounded-md flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                <span>FAQ</span>
              </a>
              <a href="#contact" className="px-2 py-1 hover:bg-blue-50 rounded-md flex items-center">
                <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
                <span>Contact</span>
              </a>
              <a href="#knowledge-base" className="px-2 py-1 hover:bg-blue-50 rounded-md flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                <span>Base de connaissances</span>
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;