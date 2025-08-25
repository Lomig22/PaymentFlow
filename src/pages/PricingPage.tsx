import { Helmet } from "react-helmet";
import { motion, useInView } from "framer-motion";
import { CheckCircle, TrendingUp } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.42, 0, 0.58, 1] as [number, number, number, number] } },
};

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.42, 0, 0.58, 1] as [number, number, number, number] } },
};
type Props = {
  setShowContact: React.Dispatch<React.SetStateAction<boolean>>;
  setDefaultSubject: React.Dispatch<React.SetStateAction<string>>;
};
const PricingPage = ({ setShowContact, setDefaultSubject }: Props) => {
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [selectedPlan, setSelectedPlan] = useState("basic");
  const [message, setMessage] = useState<string | null>(null);
  const location = useLocation();
  const isPricingPage = location.pathname === "/pricing";
  const isSettingsPage = location.pathname === "/settings";

  const navigate = useNavigate();
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  // Price calculation helper
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

  // const handleStripePaymentTemp = async (plan: string) => {
  //   try {
  //     const {
  //       data: { user },
  //       error: userError,
  //     } = await supabase.auth.getUser();

  //     if (userError || !user) {
  //       alert("Veuillez vous connecter pour continuer");
  //       return;
  //     }

  //     // Vérifie si le profil existe déjà
  //     const { data: existingProfile, error: fetchError } = await supabase
  //       .from("profileStripe")
  //       .select("*")
  //       .eq("id", user.id)
  //       .maybeSingle();

  //     if (fetchError) {
  //       console.error("Erreur lors de la récupération du profil:", fetchError);
  //       alert("Erreur lors de la récupération du profil");
  //       return;
  //     }

  //     if (existingProfile && existingProfile.subscription_expiry) {
  //       const expiryDate = new Date(existingProfile.subscription_expiry);
  //       const now = new Date();
  //       if (expiryDate > now) {
  //         alert("Vous avez déjà un abonnement actif.");
  //         return;
  //       }
  //     }

  //     const now = new Date();
  //     const expiry = new Date();
  //     expiry.setMonth(expiry.getMonth() + (plan === "enterprise" ? 12 : 1));

  //     // Enregistre ou met à jour le profilStripe
  //     const { error: upsertError } = await supabase
  //       .from("profileStripe")
  //       .upsert({
  //         id: user.id,
  //         created_at: now.toISOString(),
  //         email: user.email,
  //         formatedEmail: user.email?.toLowerCase().trim(),
  //         subscription_expiry: expiry.toISOString(),
  //         abonnement: plan,
  //       });

  //     if (upsertError) {
  //       console.error("Erreur d'enregistrement de l'abonnement:", upsertError);
  //       alert("Erreur lors de la création de l'abonnement");
  //       return;
  //     }

  //     // Redirection vers Stripe
  //     let stripeUrl = "";
  //     switch (plan) {
  //       case "basic":
  //         stripeUrl = `https://buy.stripe.com/test_dR66s9cgGcRgcQU3cc?prefilled_email=${encodeURIComponent(
  //           user.email ?? ""
  //         )}`;
  //         break;
  //       case "pro":
  //         stripeUrl = `https://buy.stripe.com/test_dR66s9cgGcRgcQU3cc?prefilled_email=${encodeURIComponent(
  //           user.email ?? ""
  //         )}`;
  //         break;
  //       case "enterprise":
  //         stripeUrl = `https://buy.stripe.com/test_dR66s9cgGcRgcQU3cc?prefilled_email=${encodeURIComponent(
  //           user.email ?? ""
  //         )}`;
  //         break;
  //     }

  //     window.open(stripeUrl, "_blank");
  //   } catch (error) {
  //     console.error("Erreur lors du paiement:", error);
  //     alert("Une erreur est survenue. Veuillez réessayer.");
  //   }
  // };

  const priceMap = {
    basic: {
      monthly: import.meta.env.VITE_STRIPE_PRICE_BASIC,
      yearly: import.meta.env.VITE_STRIPE_PRICE_BASIC_ANNUEL,
    },
    pro: {
      monthly: import.meta.env.VITE_STRIPE_PRICE_PRO,
      yearly: import.meta.env.VITE_STRIPE_PRICE_PRO_ANNUEL,
    },
    enterprise: {
      monthly: import.meta.env.VITE_STRIPE_PRICE_ENTREPRISE,
      yearly: import.meta.env.VITE_STRIPE_PRICE_ENTREPRISE_ANNUEL,
    },
  };

  type PlanType = keyof typeof priceMap; // 'basic' | 'pro' | 'enterprise'
  type IntervalType = keyof typeof priceMap[PlanType]; // 'monthly' | 'yearly'

  const handleStripePayment = async (
    plan: PlanType,
    interval: IntervalType
  ) => {
    setMessage(null);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const userEmail = session?.user?.email;
    const userId = session?.user?.id;
    if (!userEmail) {
      navigate("/signup");
      //  setMessage("Utilisateur non connecté.");
      return;
    }

    const { data, error } = await supabase
      .from("subscriptions")
      .select("plan, subscription_expiry")
      .eq("user_id", userId);

    if (error) {
      console.error(error);
      setMessage("Erreur lors de la vérification de l’abonnement.");
      return;
    }

    // Vérifie s’il y a un abonnement actif
    const latest = data
      ?.filter((row) => row.subscription_expiry)
      .sort(
        (a, b) =>
          new Date(b.subscription_expiry).getTime() -
          new Date(a.subscription_expiry).getTime()
      )[0];

    const now = new Date();
    // if (
    //   latest?.subscription_expiry &&
    //   new Date(latest.subscription_expiry) > now
    // ) {
    //   const formatted = new Date(latest.subscription_expiry).toLocaleDateString(
    //     "fr-FR",
    //     {
    //       day: "numeric",
    //       month: "long",
    //       year: "numeric",
    //     }
    //   );
    //   setMessage(`Vous avez déjà un abonnement actif jusqu’au ${formatted}.`);
    //   return;
    // }

    // Vérification de la validité du plan/interval
    if (!priceMap[plan] || !priceMap[plan][interval]) {
      setMessage("Plan ou intervalle invalide.");
      return;
    }

    // Stockage local pour potentielle récupération après le paiement
    localStorage.setItem("selectedPlan", plan);
    localStorage.setItem("selectedInterval", interval);

     // Récupère le token d'accès utilisateur Supabase
    const { data: { session: stripeSession } } = await supabase.auth.getSession();
    const accessToken = stripeSession?.access_token;

    if (!accessToken) {
      setMessage("Utilisateur non authentifié. Veuillez vous connecter.");
      navigate("/signup");
      return;
    }

    if(isSettingsPage){
      localStorage.setItem("navigateAfterPayment", JSON.stringify({
        pathname: "/settings",
        state: { initialSectionId: "billing", initialSubTabId: "subscription" }
      }));
    }
    

    const payload = {
      price_id: priceMap[plan][interval],
      success_url: window.location.origin + "/paiement-abonement",
      cancel_url: window.location.href,
    };

    try {
      const res = await fetch(
        "https://rsomeerndudkhyhpigmn.supabase.co/functions/v1/create-stripe-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();
      console.log("Stripe session result:", result);
      

      if (result?.url) {
        window.location.href = result.url;
      } else {
        setMessage("Erreur lors de la création de la session de paiement.");
        console.error(result);
      }
    } catch (err) {
      setMessage("Une erreur est survenue lors du paiement.");
      console.error(err);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white"
    >
      <Helmet>
  <title>Tarifs | Payment Flow</title>
  <meta name="description" content="Découvrez nos offres et tarifs flexibles pour la gestion de vos paiements professionnels. Sans engagement, essai gratuit 30 jours." />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://www.payment-flow.fr/pricing" />
      </Helmet>
      {/* Main Pricing Content */}
      <main>
      {isPricingPage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-2 pt-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-xl font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
        </div>)}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {message && (
            <div className="mb-4 p-3 rounded-md bg-yellow-50 text-yellow-700 border border-yellow-200">
              {message}
            </div>
          )}

          <motion.div variants={fadeInUp} className="text-center mb-20">
            {isPricingPage && (
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Des tarifs adaptés à chaque entreprise
              </h1>
            )}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setBillingInterval("monthly")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingInterval === "monthly"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Facturation mensuelle
              </button>
              <button
                onClick={() => setBillingInterval("yearly")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingInterval === "yearly"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Facturation annuelle
              </button>
            </div>
            {billingInterval === "yearly" && (
              <p className="mt-4 text-green-600 font-medium">
                Économisez 10% avec l'abonnement annuel !
              </p>
            )}
          </motion.div>

          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {/* Basic Plan */}
            <motion.div
              variants={fadeInScale}
              className="bg-white rounded-lg shadow-lg p-8 border border-gray-200 hover:border-blue-500 transition-colors"
            >
              <h3 className="text-xl font-bold mb-2">Basic</h3>
              <p className="text-gray-600 mb-6">
                Parfait pour les startups et TPE
              </p>
              <div className="mb-6">
                {billingInterval === "yearly" && (
                  <span className="text-lg text-gray-500 line-through mr-2">
                    {getPrice(69).originalPrice}€
                  </span>
                )}
                <span className="text-4xl font-bold">
                  {getPrice(69).displayedPrice}€
                </span>
                <span className="text-lg font-normal text-gray-500">
                  /{billingInterval === "monthly" ? "mois" : "an"}
                  <sup className="text-sm ml-1 font-bold">
                    HT {billingInterval === "monthly" ? "" : "-10%"}
                  </sup>
                </span>
              </div>
              <ul className="space-y-3 mb-8">
                <FeatureItem text="jusqu’à 50 000 Euros d’encours" />
                <FeatureItem text="100 relances / mois" />
                <FeatureItem text="1 seul utilisateur" />
                <FeatureItem text="5 modèles de relances" />
                <FeatureItem text="créances actives illimités" />
                <FeatureItem text="Rapport mensuels" />
                <FeatureItem text="Rapport journaliers et/ou hebdomadaire" />
                <FeatureItem text="Support par email" />
                <FeatureItem text="intégration comptable " />
              </ul>
              <button
                onClick={() => handleStripePayment("basic", billingInterval)}
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Souscrire
              </button>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              variants={fadeInScale}
              className="bg-white rounded-lg shadow-lg p-8 border border-gray-200 hover:border-blue-500 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="bg-blue-500 text-white text-xs font-bold uppercase tracking-wider py-1 px-2 rounded-full inline-block mb-2">
                  Populaire
                </div>
                {/* {billingInterval === "yearly" && (
                  <div className="bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider py-1 px-2 rounded-full">
                    -10%
                  </div>
                )} */}
              </div>
              <h3 className="text-xl font-bold mb-2">Pro</h3>
              <p className="text-gray-600 mb-6">Pour les PME en croissance</p>
              <div className="mb-6">
                {billingInterval === "yearly" && (
                  <span className="text-lg text-gray-500 line-through mr-2">
                    {getPrice(129).originalPrice}€
                  </span>
                )}
                <span className="text-4xl font-bold">
                  {getPrice(129).displayedPrice}€
                </span>
                <span className="text-lg font-normal text-gray-500">
                  /{billingInterval === "monthly" ? "mois" : "an"}
                  <sup className="text-sm ml-1 font-bold">
                    HT {billingInterval === "monthly" ? "" : "-10%"}
                  </sup>
                </span>
              </div>
              <ul className="space-y-3 mb-8">
                <FeatureItem text="jusqu’à 200 000 Euros d’encours" />
                <FeatureItem text="500 relances / mois" />
                <FeatureItem text="3 utilisateurs" />
                <FeatureItem text="5 modèles de relances" />
                <FeatureItem text="créances actives illimités" />
                <FeatureItem text="Rapport mensuels" />
                <FeatureItem text="Rapport journaliers et/ou hebdomadaire" />
                <FeatureItem text="Support prioritaire" />
                <FeatureItem text="intégration comptable" />
              </ul>
              <button
                onClick={() => handleStripePayment("pro", billingInterval)}
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Souscrire
              </button>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div
              variants={fadeInScale}
              className="bg-white rounded-lg shadow-lg p-8 border border-gray-200 hover:border-blue-500 transition-colors"
            >
              <h3 className="text-xl font-bold mb-2">Enterprise</h3>
              <p className="text-gray-600 mb-6">
                Solution sur mesure pour les grandes entreprises
              </p>
              <div className="mb-6">
                <span className="text-4xl font-bold">Sur devis</span>
              </div>
              <ul className="space-y-3 mb-8">
                <FeatureItem text=">1M d’euros d’encours" />
                <FeatureItem text="jusqu’à 10 utilisateurs" />
                <FeatureItem text="5 modèles de relances" />
                <FeatureItem text="créances actives illimités" />
                <FeatureItem text="Rapport mensuels" />
                <FeatureItem text="Rapport journaliers et/ou hebdomadaire" />
                <FeatureItem text="Support prioritaire" />
                <FeatureItem text="intégration comptable" />
                <FeatureItem text="relances illimités" />
                <FeatureItem text="10 utilisateurs" />
              </ul>
              <button
                onClick={() => {
                  setDefaultSubject("pricing");
                  setShowContact(true);
                }}
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Contacter les ventes
              </button>
            </motion.div>
          </motion.div>

          {/* Enterprise Contact Section */}
          {/*          {isPricingPage && (
            <motion.div
              className="mt-20 text-center"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
            >
              <motion.h2
                className="text-3xl font-bold text-gray-900 mb-6"
                variants={fadeInLeft}
              >
                Besoin d'une solution personnalisée ?
              </motion.h2>
              <motion.p
                className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
                variants={fadeInUp}
              >
                Notre équipe peut créer un plan sur mesure adapté aux besoins
                spécifiques de votre entreprise.
              </motion.p>
              <motion.button
                onClick={() =>
                 { alert("truemm")
                  setShowContact(true)}
                }
                className="bg-blue-600 text-white px-8 py-4 rounded-md text-lg font-medium hover:bg-blue-700 transition-colors"
                variants={fadeInScale}
              >
                Contactez notre équipe commerciale
              </motion.button>
            </motion.div>
          )} */}
        </div>
      </main>

      {isPricingPage && (
        <>
          <motion.div
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
          >
            <motion.h2
              className="text-3xl font-bold text-center mb-16"
              variants={fadeInLeft}
            >
              Questions fréquentes
            </motion.h2>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
              variants={staggerContainer}
            >
              <FAQItem
                question="Puis-je changer de plan ultérieurement ?"
                answer="Oui, vous pouvez mettre à jour ou rétrograder votre plan à tout moment depuis votre tableau de bord."
              />
              <FAQItem
                question="Y a-t-il des frais de résiliation ?"
                answer="Aucun frais de résiliation - vous pouvez annuler votre abonnement à tout moment."
              />
              <FAQItem
                question="Quels moyens de paiement acceptez-vous ?"
                answer="Nous acceptons toutes les cartes de crédit principales via Stripe, ainsi que les virements bancaires."
              />
              <FAQItem
                question="Proposez-vous une période d'essai ?"
                answer="Oui, nous offrons un essai gratuit de 30 jours sans engagement."
              />
            </motion.div>
          </motion.div>
          <Footer />
        </>
      )}
    </motion.div>
  );
};

const FeatureItem = ({ text }: { text: string }) => (
  <li className="flex items-start">
    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
    <span>{text}</span>
  </li>
);

const FAQItem = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <h3 className="text-lg font-semibold mb-2">{question}</h3>
    <p className="text-gray-600">{answer}</p>
  </div>
);

export default PricingPage;
