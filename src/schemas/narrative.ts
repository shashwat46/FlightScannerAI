// Narrative schema used for AI flight insights

import { z } from 'zod';

// ------------- Types -------------
export interface DealNarrative {
  version: '1.1';
  deal_insight: string; // main statement about price/quality (<= ~60 words)
  destination_blurb?: {
    pros: string;
    cons: string;
  } | null;
}

// ------------- Zod validation -------------
export const DealNarrativeSchema = z.object({
  version: z.literal('1.1'),
  deal_insight: z.string().min(1).max(600),
  destination_blurb: z
    .object({ pros: z.string().min(1).max(400), cons: z.string().min(1).max(400) })
    .optional()
    .nullable()
});
