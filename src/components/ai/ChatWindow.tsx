import { useEffect, useRef } from 'react';
import { Sparkles, Trash2, X } from 'lucide-react';
import type { ChatMessage as Message } from '../../types/ai';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { SuggestedQuestions } from './SuggestedQuestions';
import { TypingIndicator } from './TypingIndicator';

interface ChatWindowProps {
  messages: Message[];
  isThinking: boolean;
  isStreaming: boolean;
  error: Message | null;
  onSend: (text: string) => void;
  onRetry: () => void;
  onClear: () => void;
  onClose: () => void;
}

export function ChatWindow({ messages, isThinking, isStreaming, error, onSend, onRetry, onClear, onClose }: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight });
  }, [messages, isThinking, error, isStreaming]);

  return (
    <div className="flex h-full flex-col bg-surface-container-low/95 backdrop-blur-xl border border-outline-variant/10 rounded-t-[2rem] md:rounded-[2rem] overflow-hidden shadow-2xl">
      <header className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/10 bg-surface-container-high/60">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Sparkles size={16} />
          </span>
          <h2 className="font-headline font-bold text-on-background">Ask Suan's AI</h2>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              onClick={onClear}
              aria-label="Clear conversation"
              className="p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          )}
          <button
            onClick={onClose}
            aria-label="Close chat"
            className="p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 ? (
          <SuggestedQuestions onSelect={onSend} />
        ) : (
          <>
            {messages.map((m, i) => (
              <ChatMessage
                key={m.id}
                message={m}
                streaming={isStreaming && i === messages.length - 1 && m.role === 'assistant'}
              />
            ))}
            {error && <ChatMessage message={error} onRetry={onRetry} />}
            {isThinking && <TypingIndicator />}
          </>
        )}
      </div>

      <ChatInput onSend={onSend} disabled={isThinking} />
    </div>
  );
}