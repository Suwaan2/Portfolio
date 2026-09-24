import { motion } from 'framer-motion';
import { SUGGESTED_QUESTIONS } from '../../lib/ai/suggested';

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
}

export function SuggestedQuestions({ onSelect }: SuggestedQuestionsProps) {
  return (
    <div className="flex flex-col items-center px-6 py-8">
      <p className="text-on-surface-variant text-sm text-center font-body leading-relaxed max-w-xs">
        I'm Suan's portfolio assistant. Ask me about his experience, projects, skills, education, or technical background.
      </p>
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {SUGGESTED_QUESTIONS.map((question, i) => (
          <motion.button
            key={question}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.2 }}
            onClick={() => onSelect(question)}
            className="px-3 py-1.5 rounded-full border border-outline-variant/30 text-primary font-label text-xs hover:bg-primary/10 hover:border-primary transition-colors"
          >
            {question}
          </motion.button>
        ))}
      </div>
    </div>
  );
}