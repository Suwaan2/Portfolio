import { useCallback, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import type { ChatMessage as Message, HistoryMessage } from '../../types/ai';
import { sendChatMessage } from '../../lib/ai/client';
import { ChatWindow } from './ChatWindow';

function makeId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function AskSuanAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Message | null>(null);
  const lastUserRef = useRef('');

  const handleSend = useCallback(async (text: string) => {
    const userMessage: Message = { id: makeId(), role: 'user', content: text };
    const assistantId = makeId();
    lastUserRef.current = text;
    setMessages((prev) => [...prev, userMessage]);
    setError(null);
    setIsThinking(true);
    setIsStreaming(false);

    const history: HistoryMessage[] = messages
      .filter((m) => !m.error)
      .map((m) => ({ role: m.role, content: m.content }))
      .slice(-20);

    let started = false;
    let acc = '';

    try {
      await sendChatMessage(
        text,
        history,
        (delta) => {
          if (!started) {
            started = true;
            setIsThinking(false);
            setIsStreaming(true);
            setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', content: '' }]);
          }
          acc += delta;
          setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: acc } : m)));
        },
        (incoming) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, references: incoming } : m)),
          );
        },
      );

      if (!started) {
        setError({
          id: makeId(),
          role: 'assistant',
          content: "I'm having trouble connecting right now. Please try again in a moment.",
          error: true,
        });
      }
    } catch (err) {
      setError({
        id: makeId(),
        role: 'assistant',
        content: err instanceof Error ? err.message : 'Something went wrong. Please try again.',
        error: true,
      });
    } finally {
      setIsThinking(false);
      setIsStreaming(false);
    }
  }, [messages]);

  const handleRetry = useCallback(() => {
    if (lastUserRef.current) {
      void handleSend(lastUserRef.current);
    }
  }, [handleSend]);

  const handleClear = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-0 z-50 md:inset-auto md:bottom-24 md:right-6 md:h-[560px] md:w-[420px]"
          >
            <ChatWindow
              messages={messages}
              isThinking={isThinking}
              isStreaming={isStreaming}
              error={error}
              onSend={handleSend}
              onRetry={handleRetry}
              onClear={handleClear}
              onClose={() => setIsOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="chat-launcher"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            aria-label="Open Ask Suan's AI"
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-gradient-to-br from-primary to-primary-dim text-on-primary px-5 py-3 font-bold shadow-[0_0_30px_rgba(129,236,255,0.3)]"
          >
            <Sparkles size={18} />
            <span className="font-label text-sm">Ask Suan's AI</span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}