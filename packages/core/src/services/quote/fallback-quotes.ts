import type { Quote } from '@/entities'

/**
 * Short quotes `QuoteService` falls back to when the port fails or returns nothing short
 * enough. Every text fits `MAX_QUOTE_LENGTH`.
 */
export const FALLBACK_QUOTES: readonly Quote[] = [
  { id: 'fallback-1', text: 'Well done is better than well said.', author: 'Benjamin Franklin' },
  { id: 'fallback-2', text: 'Little by little, one travels far.', author: 'J.R.R. Tolkien' },
  {
    id: 'fallback-3',
    text: 'It always seems impossible until it’s done.',
    author: 'Nelson Mandela',
  },
  { id: 'fallback-4', text: 'Focus on being productive instead of busy.', author: 'Tim Ferriss' },
  {
    id: 'fallback-5',
    text: 'The secret of getting ahead is getting started.',
    author: 'Mark Twain',
  },
  {
    id: 'fallback-6',
    text: 'Action is the foundational key to all success.',
    author: 'Pablo Picasso',
  },
  { id: 'fallback-7', text: 'Quality is not an act, it is a habit.', author: 'Aristotle' },
  {
    id: 'fallback-8',
    text: 'Energy and persistence conquer all things.',
    author: 'Benjamin Franklin',
  },
  {
    id: 'fallback-9',
    text: 'Simplicity is the ultimate sophistication.',
    author: 'Leonardo da Vinci',
  },
  { id: 'fallback-10', text: 'Done is better than perfect.', author: 'Sheryl Sandberg' },
]
