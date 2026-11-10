import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createServices, type Quote, type QuotePort } from '@pomodoro-timer/core'
import { createQuoteServices } from '@/api'
import SessionCompleteCard from '@/components/Pomodoro/SessionCompleteCard.vue'
import { usePomodoroStore } from '@/stores/pomodoro-session/use-pomodoro-session-store'

vi.mock('@/api', () => ({ createQuoteServices: vi.fn() }))

/** A port whose answer the test sends manually. */
const deferredPort = () => {
  let answer: (quotes: Quote[]) => void = () => {}
  const getRandomQuotes = vi.fn(() => new Promise<Quote[]>((resolve) => (answer = resolve)))
  const port: QuotePort = { getRandomQuotes }
  return { port, getRandomQuotes, answer: (quotes: Quote[]) => answer(quotes) }
}

const finishSession = (store: ReturnType<typeof usePomodoroStore>) => {
  store.start()
  vi.advanceTimersByTime(store.remainingSeconds * 1000 + 500)
}

const mountCard = () =>
  mount(SessionCompleteCard, { global: { stubs: { 'font-awesome-icon': true } } })

describe('SessionCompleteCard', () => {
  let deferred: ReturnType<typeof deferredPort>

  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
    setActivePinia(createPinia())
    deferred = deferredPort()
    vi.mocked(createQuoteServices).mockImplementation(() => createServices(deferred.port))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('is hidden until a focus session completes', () => {
    expect(mountCard().text()).not.toContain('You did great!')
  })

  it('shows the default text while loading, then the quote, without blocking the timer', async () => {
    const wrapper = mountCard()
    const timer = usePomodoroStore()

    finishSession(timer)
    await flushPromises()

    expect(timer.mode).toBe('short')
    expect(wrapper.text()).toContain('You did great!')
    expect(wrapper.text()).toContain('Pomodoro session completed.')

    deferred.answer([{ id: '1', text: 'Great work!', author: 'Coach' }])
    await flushPromises()

    expect(wrapper.get('[data-test="quote"]').text()).toContain('Great work!')
    expect(wrapper.text()).toContain('Coach')
    expect(wrapper.text()).not.toContain('Pomodoro session completed.')
  })

  it('does not load a quote when a break ends', async () => {
    const wrapper = mountCard()
    const timer = usePomodoroStore()

    timer.setMode('short')
    finishSession(timer)
    await flushPromises()

    expect(deferred.getRandomQuotes).not.toHaveBeenCalled()
    expect(wrapper.text()).not.toContain('You did great!')
  })

  it('can be dismissed', async () => {
    const wrapper = mountCard()
    finishSession(usePomodoroStore())
    await flushPromises()

    await wrapper.get('button[aria-label="Dismiss"]').trigger('click')

    expect(wrapper.text()).not.toContain('You did great!')
  })
})
