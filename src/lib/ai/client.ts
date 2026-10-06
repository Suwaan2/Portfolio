import type { HistoryMessage, Reference } from '../../types/ai';

export class ChatError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ChatError';
    this.status = status;
  }
}

const ERROR_MESSAGES: Record<number, string> = {
  400: "That message couldn't be processed. Please try rephrasing.",
  429: "You're sending messages too quickly. Please wait a moment and try again.",
  500: "I'm having trouble connecting right now. Please try again in a moment.",
  502: "The AI service is temporarily unreachable. Please try again in a moment.",
  504: 'The AI service took too long to respond. Please try again.',
};

interface StreamEvent {
  type: string;
  text?: string;
  message?: string;
  references?: Reference[];
}

export async function sendChatMessage(
  message: string,
  history: HistoryMessage[],
  onChunk?: (text: string) => void,
  onRef?: (references: Reference[]) => void,
): Promise<string> {
  let res: Response;
  try {
    res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history: history.slice(-20) }),
    });
  } catch {
    throw new ChatError('Network error. Check your connection and try again.');
  }

  if (!res.ok) {
    let data: { error?: string; code?: string };
    try {
      data = await res.json();
    } catch {
      data = {};
    }
    // When the server classified the failure (quota, overloaded, ...), show its message as-is.
    const message = data.code && data.error ? data.error : ERROR_MESSAGES[res.status] ?? data.error;
    throw new ChatError(message ?? 'Something went wrong. Please try again.', res.status);
  }

  if (!res.body || !onChunk) {
    const text = await res.text();
    return text.trim();
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let result = '';

  const handleLine = (line: string) => {
    if (!line.trim()) return;
    let event: StreamEvent;
    try {
      event = JSON.parse(line);
    } catch {
      return;
    }
    if (event.type === 'chunk' && event.text) {
      result += event.text;
      onChunk(event.text);
    } else if (event.type === 'ref' && event.references && onRef) {
      onRef(event.references);
    } else if (event.type === 'error') {
      throw new ChatError(event.message ?? 'Something went wrong. Please try again.', res.status);
    }
  };

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let newlineIndex;
      while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);
        handleLine(line);
      }
    }
    buffer += decoder.decode();
    if (buffer.trim()) handleLine(buffer);
  } catch (err) {
    if (err instanceof ChatError) throw err;
    throw new ChatError('Network error. Check your connection and try again.');
  }

  return result;
}