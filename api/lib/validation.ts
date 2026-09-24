import { z } from 'zod';

export const chatRequestSchema = z.object({
  message: z.string().trim().min(1).max(500),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(2000),
      }),
    )
    .max(20)
    .optional(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type HistoryMessage = NonNullable<ChatRequest['history']>[number];