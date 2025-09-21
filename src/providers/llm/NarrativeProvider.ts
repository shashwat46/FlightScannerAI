import { DealNarrative } from '../../schemas/narrative';

export interface NarrativeProvider {
  /**
   * Generate a short narrative for a flight deal given a prompt.
   * @param prompt full prompt string
   * @param options optional model overrides
   */
  generate(prompt: string, options?: Record<string, unknown>): Promise<DealNarrative | string>;
}
