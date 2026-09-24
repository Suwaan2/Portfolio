import { motion } from 'framer-motion';
import type { ChatMessage as Message } from '../../types/ai';
import { ProjectReference } from './ProjectReference';

interface ChatMessageProps {
  message: Message;
  onRetry?: () => void;
  streaming?: boolean;
}

export function ChatMessage({ message, onRetry, streaming }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[85%] px-4 py-3 rounded-xl text-sm font-body leading-relaxed whitespace-pre-wrap break-words ${
          isUser
            ? 'bg-primary text-on-primary rounded-br-sm'
            : message.error
              ? 'bg-error/10 border border-error/30 text-on-surface rounded-bl-sm'
              : 'bg-surface-container-high border border-outline-variant/10 text-on-surface rounded-bl-sm'
        }`}
      >
        {message.content}
        {streaming && <span className="stream-cursor" aria-hidden="true" />}
        {message.references && message.references.length > 0 && (
          <ProjectReference refs={message.references} />
        )}
        {message.error && onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 block text-primary font-bold text-xs uppercase tracking-widest hover:underline"
          >
            Retry
          </button>
        )}
      </div>
    </motion.div>
  );
}