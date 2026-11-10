import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Quote } from '@pomodoro-timer/core'
import { createQuoteServices } from '@/api'

/**
 * Loading state of the quote.
 *
 * - `idle`: nothing requested (or the card was dismissed)
 * - `loading`: a quote is being loaded
 * - `success`: {@link useQuoteStore} `quote` holds the loaded quote
 *
 * There is no error state: core's `getShortQuote` never rejects, it falls back to a local quote.
 */
export type QuoteStatus = 'idle' | 'loading' | 'success'

/**
 * The quote shown after a focus session.
 */
export const useQuoteStore = defineStore('quote', () => {
  const quote = ref<Quote | null>(null)
  const status = ref<QuoteStatus>('idle')
  // Identifies the latest load, so an older, slower response never replaces a newer one
  let requestId = 0

  /**
   * Loads a new short quote. Starting a new load drops the result of any load still running.
   */
  const load = async (): Promise<void> => {
    const id = ++requestId
    quote.value = null
    status.value = 'loading'

    const result = await createQuoteServices().getShortQuote()
    if (id !== requestId) return

    quote.value = result
    status.value = 'success'
  }

  /**
   * Clears the quote and goes back to `idle`, e.g. when the card is dismissed. A load still
   * running is ignored when it finishes.
   */
  const reset = (): void => {
    requestId++
    quote.value = null
    status.value = 'idle'
  }

  return { quote, status, load, reset }
})
