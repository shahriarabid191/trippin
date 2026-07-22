import { useRef, useEffect, useCallback } from 'react';
import { motion, useInView } from 'motion/react';
import './OptionCards.css';

const OptionCard = ({ children, index, selected, onSelect }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.5, once: false });

  return (
    <motion.div
      ref={ref}
      data-index={index}
      onClick={() => onSelect(index)}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
      transition={{ duration: 0.25, delay: index * 0.08 }}
      whileHover={{ y: -3 }}
      className={`option-card ${selected ? 'option-card-selected' : ''}`}
    >
      {children}
    </motion.div>
  );
};

// Adapted from the React Bits <AnimatedList /> pattern: same view-triggered
// stagger-in animation, repurposed as a single-select answer grid instead of
// a scrollable list (each question only has 3-4 options, nothing to scroll).
export default function OptionCards({
  options = [],
  selectedIndex = -1,
  onSelect,
  enableArrowNavigation = true,
  className = ''
}) {
  const handleSelect = useCallback(
    index => {
      onSelect?.(index);
    },
    [onSelect]
  );

  useEffect(() => {
    if (!enableArrowNavigation) return;

    const handleKeyDown = e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleSelect(Math.min((selectedIndex < 0 ? -1 : selectedIndex) + 1, options.length - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        handleSelect(Math.max((selectedIndex < 0 ? 1 : selectedIndex) - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableArrowNavigation, selectedIndex, options.length, handleSelect]);

  return (
    <div className={`option-cards-grid ${className}`}>
      {options.map((option, index) => (
        <OptionCard key={option} index={index} selected={selectedIndex === index} onSelect={handleSelect}>
          <p className="option-card-text">{option}</p>
        </OptionCard>
      ))}
    </div>
  );
}
