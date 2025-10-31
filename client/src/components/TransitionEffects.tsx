import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TransitionEffectsProps {
  children: ReactNode;
  transitionKey: string | number;
  shouldFlash?: boolean;
  className?: string;
}

const slideVariants = {
  enter: {
    x: 100,
    opacity: 0,
  },
  center: {
    x: 0,
    opacity: 1,
  },
  exit: {
    x: -100,
    opacity: 0,
  },
};

const flashAnimation = {
  boxShadow: [
    '0 0 0 0 rgba(16, 185, 129, 0)',
    '0 0 0 4px rgba(16, 185, 129, 0.4)',
    '0 0 0 8px rgba(16, 185, 129, 0.2)',
    '0 0 0 4px rgba(16, 185, 129, 0)',
  ],
  borderColor: [
    'rgba(16, 185, 129, 0)',
    'rgba(16, 185, 129, 1)',
    'rgba(16, 185, 129, 1)',
    'rgba(16, 185, 129, 0)',
  ],
};

export function TransitionEffects({
  children,
  transitionKey,
  shouldFlash = false,
  className,
}: TransitionEffectsProps) {
  return (
    <div className="relative">
      {/* Flash Overlay */}
      {shouldFlash && (
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-lg z-10"
          initial={{ opacity: 0 }}
          animate={flashAnimation}
          transition={{
            duration: 0.8,
            ease: 'easeInOut',
          }}
          style={{
            border: '3px solid transparent',
          }}
        />
      )}

      {/* Content with slide transition */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={transitionKey}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className={cn('w-full', className)}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Success checkmark animation
export function SuccessCheckmark() {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
    >
      <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center shadow-2xl">
        <svg
          className="w-16 h-16 text-primary-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <motion.path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M5 13l4 4L19 7"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
        </svg>
      </div>
    </motion.div>
  );
}

// Progress ring animation
export function ProgressRing({ progress }: { progress: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width="100" height="100" className="transform -rotate-90">
      {/* Background circle */}
      <circle
        cx="50"
        cy="50"
        r={radius}
        stroke="currentColor"
        strokeWidth="8"
        fill="none"
        className="text-muted"
      />
      {/* Progress circle */}
      <motion.circle
        cx="50"
        cy="50"
        r={radius}
        stroke="currentColor"
        strokeWidth="8"
        fill="none"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="text-primary"
      />
    </svg>
  );
}
