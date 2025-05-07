import React, { useEffect, useState } from 'react';
import {   useStripe,
    useElements,
    CardElement,
    IbanElement,
    Elements,
 } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '../../lib/supabase';
// Composant 1 : Informations de facturation
export function BillingInfoSettings() {
  const [company, setCompany] = useState('');
  const [address, setAddress] = useState('');
  const [siret, setSiret] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ company, address, siret });
    // TODO: Envoi vers le backend
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <h2 className="text-lg font-semibold">Informations de facturation</h2>
      <div>
        <label className="block font-medium">Entreprise</label>
        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block font-medium">Adresse</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block font-medium">SIRET</label>
        <input
          type="text"
          value={siret}
          onChange={(e) => setSiret(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Enregistrer
      </button>
    </form>
  );
}

// Composant 2 : Choix de l’abonnement
export function SubscriptionSettings() {
  const [plan, setPlan] = useState('starter');
  const fetchSubscription = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Erreur utilisateur :', userError);
      return;
    }

    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (subscriptionError) {
      console.error('Erreur abonnement :', subscriptionError);
      return;
    }

    if (subscription) {
      setPlan(subscription.plan);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlan(e.target.value);
    console.log('Abonnement choisi :', e.target.value);
    // TODO: Enregistrer dans le backend
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

      // Add new subscription to Supabase
      const { error: upsertError } = await supabase
      .from("subscriptions")
      .upsert(
        [
          {
            user_id: user.id,
            status: "active",
            plan: plan,
          },
        ],
        { onConflict: 'user_id' } 
      );

      if (upsertError) {
        console.error("Error saving subscription:", upsertError);
     //   alert("Erreur lors de la création de l'abonnement");
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
  return (
    <div className="space-y-4 max-w-md">
      {(plan==="free")&&(
         <div className="mb-4 p-4 border border-yellow-400 bg-yellow-100 text-yellow-800 rounded">
         ⚠️ Vous n'êtes  souscrit à aucun abonnement pour le moment!
       </div>)}
      
      <h2 className="text-lg font-semibold">Choix de l’abonnement</h2>
      {['basic', 'pro', 'entreprise'].map((p) => (
        <div key={p} className="flex items-center space-x-2">
          <input
            type="radio"
            id={p}
            name="plan"
            value={p}
            checked={plan === p}
            onChange={handleChange}
          />
          <label htmlFor={p} className="capitalize">
            {p === 'basic' ? 'Basique' : p === 'pro' ? 'Pro' : 'Entreprise'}
          </label>
        </div>
      ))}
            <button onClick={()=>{handleStripePayment(plan)}} className="bg-blue-600 text-white px-4 py-2 rounded">
        Enregistrer
      </button>
    </div>
  );
}

// Composant 3 : Moyen de paiement

const stripePromise = loadStripe('pk_live_51OYx3fJxwVIdriDjYzY06iH34Sj15e3mW94OQD8TWFLxakBwEkD4xWJ1jS4ZzmV6cWeNr14tVIFnfzMzOYONYjD700Fh41MBlF'); // Remplace par ta clé publique

export function PaymentMethodSettings() {
  const [method, setMethod] = useState<'card' | 'sepa'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);

    // TODO : Appelle ton backend pour obtenir un SetupIntent selon le mode
    const clientSecret = await fetch('https://rsomeerndudkhyhpigmn.supabase.co/functions/v1/nothingspecial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method }), // soit 'card' soit 'sepa'
    }).then(res => res.json()).then(data => data.client_secret);

    const element = method === 'card'
      ? elements.getElement(CardElement)
      : elements.getElement(IbanElement);

    const { error, setupIntent } = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/success`,
      },
      redirect: 'if_required',
    });

    if (error) {
      console.error(error.message);
    } else if (setupIntent?.status === 'succeeded') {
      console.log("Moyen de paiement enregistré !");
    }

    setIsProcessing(false);
  };

  const cardStyle = {
    style: {
      base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSize: '16px',
        '::placeholder': { color: '#aab7c4' },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
  };

  return (
    <Elements stripe={stripePromise}>
      <div className="space-y-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setMethod('card')}
            className={`px-4 py-2 rounded ${method === 'card' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            Carte bancaire
          </button>
          <button
            onClick={() => setMethod('sepa')}
            className={`px-4 py-2 rounded ${method === 'sepa' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            SEPA
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div className="border border-gray-300 rounded p-4 bg-white shadow-sm">
            {method === 'card' ? (
              <CardElement options={cardStyle} className="block w-full" />
            ) : (
              <IbanElement
                options={{
                  supportedCountries: ['SEPA'],
                  style: cardStyle.style,
                }}
                className="block w-full"
              />
            )}
          </div>
          <button
            type="submit"
            disabled={isProcessing || !stripe}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {isProcessing ? 'Traitement...' : 'Enregistrer'}
          </button>
        </form>
      </div>
    </Elements>
  );
}
