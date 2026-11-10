import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import SettingCard from '@/components/Pomodoro/SettingCard.vue'
import { usePomodoroStore } from '@/stores/pomodoro-session/use-pomodoro-session-store'

const mountCard = () =>
  mount(SettingCard, { global: { stubs: { 'font-awesome-icon': true, SettingsView: true } } })

describe('SettingCard round', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows the current round as "#1" on a fresh start', () => {
    expect(mountCard().get('[data-test="round"]').text()).toBe('Round #1')
  })

  it('shows "#2" once the second pomodoro begins', async () => {
    const wrapper = mountCard()
    const store = usePomodoroStore()

    store.skip() // pomodoro 1 -> short break, still round 1
    await wrapper.vm.$nextTick()
    expect(wrapper.get('[data-test="round"]').text()).toBe('Round #1')

    store.skip() // short break -> pomodoro 2
    await wrapper.vm.$nextTick()
    expect(wrapper.get('[data-test="round"]').text()).toBe('Round #2')
  })

  it('reads as "#2" visually and "Round #2" for screen readers', async () => {
    const store = usePomodoroStore()
    store.skip()
    store.skip()
    const round = mountCard().get('[data-test="round"]')

    expect(round.get('.sr-only').text()).toBe('Round')
    expect(round.text().replace('Round', '').trim()).toBe('#2')
  })
})
