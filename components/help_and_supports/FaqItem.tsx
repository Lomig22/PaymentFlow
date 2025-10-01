import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

interface FaqItemProps {
  question: string;
  answer: string;
  category: string;
}

const FaqItem: React.FC<FaqItemProps> = ({ question, answer, category }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      layout
      className="border border-gray-200 rounded-lg overflow-hidden bg-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <motion.button
        layout
        className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <span className="font-medium text-gray-900">{question}</span>
          <span className="ml-3 text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
            {category}
          </span>
        </div>
        <div className="text-blue-600">
          {isOpen ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-4 pt-0 text-gray-600">
              <p>{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FaqItem;