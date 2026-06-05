import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const questions = [
  {
    id: 'q1',
    category: 'sleep',
    text: 'When the house is finally quiet, where does your mind go?',
    options: [
      { text: 'It races ahead to tomorrow', value: 'poor' },
      { text: 'It drifts into a shallow rest', value: 'fair' },
      { text: 'It settles easily into the dark', value: 'good' }
    ]
  },
  {
    id: 'q2',
    category: 'stress',
    text: 'How does your body hold the hours of the day?',
    options: [
      { text: 'Tightness in the jaw or shoulders', value: 'poor' },
      { text: 'A dull ache of fatigue', value: 'fair' },
      { text: 'Loose, upright, and present', value: 'good' }
    ]
  },
  {
    id: 'q3',
    category: 'nutrition',
    text: 'What is your relationship with nourishment?',
    options: [
      { text: 'Eaten quickly, out of necessity', value: 'poor' },
      { text: 'Erratic, dependent on my schedule', value: 'fair' },
      { text: 'Intentional and grounded', value: 'good' }
    ]
  }
];

export default function SoilJournal({ onComplete, onClose }) {
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState({});

  const handleStart = () => setStep(0);

  const handleAnswer = (category, value) => {
    setAnswers(prev => ({ ...prev, [category]: value }));
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      onComplete({ ...answers, [category]: value });
    }
  };

  return (
    <div className="journal-overlay">
      <div className="journal-backdrop" onClick={onClose} />
      <div className="journal-container">
        <button className="journal-close" onClick={onClose} data-hoverable="true">×</button>
        
        <AnimatePresence mode="wait">
          {step === -1 && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8 }}
              className="journal-card"
            >
              <h2>The Soil Journal</h2>
              <p>Before we look at the leaves, we must understand the soil. A few quiet questions about the rhythms that sustain you.</p>
              <button className="btn btn--primary" onClick={handleStart} data-hoverable="true">
                Begin Reflection
                <ArrowRight size={14} className="btn-icon-right" />
              </button>
            </motion.div>
          )}

          {step >= 0 && step < questions.length && (
            <motion.div
              key={questions[step].id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.6 }}
              className="journal-card"
            >
              <span className="journal-step">{step + 1} / {questions.length}</span>
              <h2 className="journal-question">{questions[step].text}</h2>
              <div className="journal-options">
                {questions[step].options.map((opt, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    className="journal-option"
                    onClick={() => handleAnswer(questions[step].category, opt.value)}
                    data-hoverable="true"
                  >
                    {opt.text}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
