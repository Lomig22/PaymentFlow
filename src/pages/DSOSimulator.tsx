import React, { useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import "./DSOSimulator.css";
import { motion } from "framer-motion";
import DSOIntro from "../components/DSOIntro";
import Footer from "../components/Footer";

interface DSOSimulatorInputs {
  receivables: number; // encours client
  unpaidInvoices: number; // nombre de factures impayées
  dso: number; // délai moyen de paiement actuel
  reminderHours: number; // temps passé à relancer
  reminderSuccessRate: number; // taux de réussite des relances
  hourlyCost: number; // coût horaire collaborateur
}

const defaultValues: DSOSimulatorInputs = {
  receivables: 120000,
  unpaidInvoices: 35,
  dso: 60,
  reminderHours: 12,
  reminderSuccessRate: 50,
  hourlyCost: 30,
};

function calculateResults(values: DSOSimulatorInputs) {
  const { receivables, dso, reminderHours, hourlyCost } = values;
  // Trésorerie immobilisée
  const lockedCash = receivables * (dso / 365);
  // Temps perdu (€/mois)
  const lostPerMonth = reminderHours * hourlyCost;

  // Avec Payment Flow
  const dsoOptimized = Math.round(dso * 0.6); // -40%
  const reminderHoursOptimized = Math.round(reminderHours * 0.25 * 10) / 10; // -75%
  const lockedCashOptimized = receivables * (dsoOptimized / 365);
  const lostPerMonthOptimized = reminderHoursOptimized * hourlyCost;

  return {
    lockedCash,
    lostPerMonth,
    dsoOptimized,
    reminderHoursOptimized,
    lockedCashOptimized,
    lostPerMonthOptimized,
    cashGain: lockedCash - lockedCashOptimized,
    timeGain: reminderHours - reminderHoursOptimized,
    euroGain: lostPerMonth - lostPerMonthOptimized,
  };
}

import { Helmet } from "react-helmet";

export default function DSOSimulator() {
  /* SEO Helmet */
  const helmetBlock = (
    <Helmet>
      <title>Simulateur DSO | Payment Flow</title>
      <meta name="description" content="Simulez l'impact de la relance client sur votre DSO et calculez vos gains de trésorerie avec notre outil gratuit." />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href="https://www.payment-flow.fr/simulateur-dso" />
    </Helmet>
  );
  const simulatorRef = useRef<HTMLDivElement>(null);
  const scrollToSimulator = () => {
    simulatorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const { control, handleSubmit, watch, formState } = useForm<DSOSimulatorInputs>({ defaultValues });
  const [showResults, setShowResults] = useState(false);
  const values = watch();
  const results = calculateResults(values);

  const onSubmit = () => {
    setShowResults(true);
  };

  return (
    <>
      {helmetBlock}
      <DSOIntro onScrollToSimulator={scrollToSimulator} />
      <motion.div ref={simulatorRef}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-8"
    >
      <h2 className="text-3xl font-extrabold mb-6 text-center flex items-center justify-center gap-2 text-blue-700">
        <span role="img" aria-label="bar chart" style={{fontSize: '2rem'}}>📊</span>
        Mesurer votre DSO moyen
        <span role="img" aria-label="bank" style={{fontSize: '2rem'}}>🏦</span>
      </h2>
      {!showResults && (
        <form className="grid grid-cols-1 gap-6" onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="receivables"
            control={control}
            render={({ field }) => (
              <label className="block">
                <span className="font-medium">Montant de votre encours client (€)</span>
                <input type="number" min={0} step={1000} {...field} className="input input-bordered w-full mt-1" />
              </label>
            )}
          />
          <Controller
            name="unpaidInvoices"
            control={control}
            render={({ field }) => (
              <label className="block">
                <span className="font-medium">Nombre de factures impayées</span>
                <input type="number" min={0} step={1} {...field} className="input input-bordered w-full mt-1" />
              </label>
            )}
          />
          <Controller
            name="dso"
            control={control}
            render={({ field }) => (
              <label className="block">
                <span className="font-medium">DSO actuel (jours)</span>
                <input type="number" min={0} step={1} {...field} className="input input-bordered w-full mt-1" />
              </label>
            )}
          />
          <Controller
            name="reminderHours"
            control={control}
            render={({ field }) => (
              <label className="block">
                <span className="font-medium">Heures/mois passées à relancer</span>
                <input type="number" min={0} step={0.5} {...field} className="input input-bordered w-full mt-1" />
              </label>
            )}
          />
          <Controller
            name="reminderSuccessRate"
            control={control}
            render={({ field }) => (
              <label className="block">
                <span className="font-medium">Taux de réussite des relances (%)</span>
                <input type="number" min={0} max={100} step={1} {...field} className="input input-bordered w-full mt-1" />
              </label>
            )}
          />
          <Controller
            name="hourlyCost"
            control={control}
            render={({ field }) => (
              <label className="block">
                <span className="font-medium">Coût horaire collaborateur (€)</span>
                <input type="number" min={0} step={1} {...field} className="input input-bordered w-full mt-1" />
              </label>
            )}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-lg shadow-md text-lg mt-4 flex items-center justify-center gap-2 transition"
          >
            <span role="img" aria-label="start" style={{fontSize: '1.5rem'}}>⏱️</span>
            Lancer la simulation
          </motion.button>
        </form>
      )}
      {showResults && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="mt-8"
        >
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 justify-center text-blue-700">
            <span role="img" aria-label="bar chart" style={{fontSize: '1.7rem'}}>📊</span>
            Résultats de votre DSO
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 flex flex-col items-center shadow">
              <span className="text-lg font-semibold mb-2 text-blue-800">Votre situation actuelle</span>
              <span className="text-4xl font-extrabold text-blue-700 mb-2">{values.dso} jours</span>
              <span className="text-lg">Trésorerie immobilisée : <span className="font-bold text-blue-700">{results.lockedCash.toLocaleString()} €</span></span>
              <span className="text-lg">Temps perdu/mois : <span className="font-bold text-blue-400">{results.reminderHoursOptimized ? values.reminderHours : 0} h</span></span>
            </div>
            <div className="bg-green-50 rounded-lg p-4 flex flex-col items-center shadow">
              <span className="text-lg font-semibold mb-2 flex items-center gap-1 text-green-800">Avec <span className="font-extrabold text-green-700">Payment Flow</span> <span role="img" aria-label="briefcase" style={{fontSize: '1.4rem'}}>💼</span></span>
              <span className="text-4xl font-extrabold text-green-700 mb-2">{results.dsoOptimized} jours</span>
              <span className="text-lg">Trésorerie libérée : <span className="font-bold text-green-700">{results.cashGain.toLocaleString()} €</span></span>
              <span className="text-lg">Temps gagné/mois : <span className="font-bold text-green-600">{results.timeGain} h</span></span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3 mb-6">
            <span className="text-lg font-semibold flex items-center gap-2 text-blue-700">Gain potentiel total <span role="img" aria-label="bank" style={{fontSize: '1.6rem'}}>🏦</span> <span className="text-blue-700 font-bold">{results.cashGain.toLocaleString()} €</span></span>
            <span className="text-lg font-semibold flex items-center gap-2 text-blue-700">Temps économisé <span role="img" aria-label="chronomètre" style={{fontSize: '1.6rem'}}>⏱️</span> <span className="text-blue-700 font-bold">{results.timeGain} h/mois</span></span>
          </div>
          <motion.button
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.96 }}
            className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-xl shadow-lg text-xl mt-4 flex items-center justify-center gap-2 transition"
            onClick={() => window.location.href = '/signup'}
          >
            <span role="img" aria-label="briefcase" style={{fontSize: '1.8rem'}}>💼</span>
            Essayez Payment Flow gratuitement
          </motion.button>
          <button
            className="mt-4 text-blue-700 underline hover:text-blue-900"
            onClick={() => setShowResults(false)}
          >
            <span role="img" aria-label="refresh">🔄</span> Refaire une simulation
          </button>
        </motion.div>
      )}
    </motion.div>
      <div style={{ height: '0.5cm' }} />
      <Footer />
    </>
  );
}
