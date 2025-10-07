import * as motion from "motion/react-client";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  BarChart2,
  Mail,
  Target,
  TrendingUp,
  X,
  CheckCircle,
  ChevronRight,
} from "lucide-react";
import ContactModal from "../pages/landing/ContactModal";
import { FooterContactModal } from "./footer/FooterContactModal";
import { ExtensionAlert } from "./footer/ExtensionAlert";
import { ResetCacheButton } from "./footer/ResetCacheButton";

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
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Link href={"#features"}>
                    Fonctionnalités
                  </Link>
                </button>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-500 hover:text-gray-700">
                  Tarifs
                </Link>
              </li>
              <li>
                <Link
                  href={'/temoignages'}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Témoignages
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Ressources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  className="text-gray-500 hover:text-gray-700"
                  href={'/blog'}
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  className="text-gray-500 hover:text-gray-700"
                  href={'/help'}
                >
                  Guides
                </Link>
              </li>
              <li>
                <Link className="text-gray-500 hover:text-gray-700" href={'/help'}>
                  Support
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Légal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={'/privacy'}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link
                  href={'/conditions-utilisation'}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link
                  href={'/mentions-legales'}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Mentions légales
                </Link>
              </li>
              <FooterContactModal></FooterContactModal>
            </ul>
          </div>
        </motion.div>

        <motion.div
          className="pt-8 border-t border-gray-200 text-center text-sm text-gray-500"
          variants={fadeInLeft}
        >
          <p>2024 PaymentFlow. Tous droits réservés.</p>
          {/* Bouton reset cache/localStorage */}
          <ResetCacheButton />
          <ExtensionAlert></ExtensionAlert>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;
