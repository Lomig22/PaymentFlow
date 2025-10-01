import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Filter } from 'lucide-react';
import FaqItem from './FaqItem';
import { faqData } from '../data/faqData';

const FaqSection: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const categories = ['all', 'billing', 'features', 'account', 'technical'];

  const filteredFaqs = filter === 'all' 
    ? faqData 
    : faqData.filter(item => item.category === filter);

  return (
    <section className="mb-16" id="faq">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Questions Fréquentes</h2>
        
        <div className="mt-4 md:mt-0 flex items-center">
          <Filter className="h-5 w-5 mr-2 text-blue-600" />
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  filter === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.05 }}
      >
        <AnimatePresence>
          {filteredFaqs.map((faq, index) => (
            <FaqItem key={index} question={faq.question} answer={faq.answer} category={faq.category} />
          ))}
        </AnimatePresence>
      </motion.div>

      <div className="mt-8 text-center">
        <a href="#contact" className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
          <span>Besoin d’aide plus poussée ? Contactez notre équipe de support.</span>
          <svg className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </a>
      </div>
    </section>
  );
};

export default FaqSection;