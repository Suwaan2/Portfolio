export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl rounded-bl-sm bg-surface-container-high border border-outline-variant/10 text-on-surface-variant font-body text-sm" role="status" aria-live="polite">
        <span>Suan's AI is thinking</span>
        <span className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="typing-dot h-1.5 w-1.5 rounded-full bg-primary"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}