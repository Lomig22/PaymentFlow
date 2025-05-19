import React from 'react';
import { Facebook, Twitter, Linkedin, Youtube, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-xl font-bold mb-4">Payment-Flow</h3>
            <p className="text-gray-400 mb-4">
              Simplification de la gestion de trésorerie et des comptes clients pour les entreprises de toutes tailles.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Centre d'aide</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Communauté</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Tutoriels</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Webinaires</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Entreprise</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">À propos</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Carrières</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Presse</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Légal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Conditions</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Confidentialité</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Cookies</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Licences</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Payment-Flow. Tous droits réservés.
          </p>
          
          <div className="mt-4 md:mt-0">
            <a 
              href="#" 
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors text-sm"
            >
              <Mail className="h-4 w-4 mr-2" />
              S'abonner à notre newsletter
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;