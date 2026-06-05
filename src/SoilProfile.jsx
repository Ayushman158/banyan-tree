import React from 'react';
import { motion } from 'framer-motion';
import { BanyanData } from './data.js';
import { Calendar, RotateCcw } from 'lucide-react';

export default function SoilProfile({ answers, onRestart, onClose }) {
  // Translate answers into root health scores
  const scoreMap = { poor: 30, fair: 65, good: 95 };
  
  const stats = [
    { label: 'Circadian Rhythm', key: 'sleep', root: BanyanData.rootCauses['sleep'] },
    { label: 'Nervous System Tone', key: 'stress', root: BanyanData.rootCauses['nervous-system'] },
    { label: 'Gut Microbiome', key: 'nutrition', root: BanyanData.rootCauses['nutrition'] }
  ];

  return (
    <div className="journal-overlay">
      <div className="journal-backdrop" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="profile-container"
      >
        <button className="journal-close" onClick={onClose} data-hoverable="true">×</button>
        
        <div className="profile-header">
          <h2>Your Interior Soil</h2>
          <p>A mapping of your foundational systems, based on your reflections.</p>
        </div>

        <div className="profile-metrics">
          {stats.map((stat, i) => {
            const width = scoreMap[answers[stat.key]] || 50;
            const isLow = width <= 40;
            return (
              <motion.div 
                key={stat.key}
                className="profile-metric"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2 + 0.4 }}
              >
                <div className="metric-info">
                  <h3>{stat.label}</h3>
                  <span className={`metric-status ${isLow ? 'is-low' : ''}`}>
                    {isLow ? 'Depleted' : width < 80 ? 'Strained' : 'Nourished'}
                  </span>
                </div>
                <div className="metric-bar-bg">
                  <motion.div 
                    className="metric-bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${width}%` }}
                    transition={{ delay: i * 0.2 + 0.8, duration: 1, ease: "easeOut" }}
                    style={{ backgroundColor: isLow ? '#d97b53' : width < 80 ? '#b88c18' : '#8aaa28' }}
                  />
                </div>
                {isLow && (
                  <p className="metric-insight">{stat.root.insight}</p>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="profile-actions">
          <button className="btn btn--primary" data-hoverable="true">
            Book a 90-Min Assessment
            <Calendar size={14} className="btn-icon-right" />
          </button>
          <button className="btn btn--ghost" onClick={onRestart} data-hoverable="true">
            Retake Journal
            <RotateCcw size={14} className="btn-icon-right" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
