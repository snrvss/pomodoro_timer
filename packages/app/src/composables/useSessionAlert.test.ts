import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'

/** Minimal Web Audio stand-in that records every chime tone. */
class FakeAudioContext {
  static tones = 0
  state: AudioContextState = 'running'
  currentTime = 0
  destination = {}
  resume = vi.fn(async () => {})
  createOscillator() {
    FakeAudioContext.tones++
    return { type: '', frequency: { value: 0 }, connect: (n: unknown) => n, start() {}, stop() {} }
  }
  createGain() {
    const gain = {
      gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
      connect: (n: unknown) => n,
    }
    return gain
  }
}

/** Records shown notifications; `permission` is set per test. */
class FakeNotification {
  static permission: NotificationPermission = 'granted'
  static shown: { title: string; body?: string }[] = []
  static requestPermission = vi.fn(async () => FakeNotification.permission)
  constructor(title: string, options?: NotificationOptions) {
    FakeNotification.shown.push({ title, body: options?.body })
  }
}

/** Fresh module state (audio context, stored sound setting) for every test. */
const loadModules = async () => {
  vi.resetModules()
  const alert = await import('@/composables/useSessionAlert')
  const store = await import('@/stores/pomodoro-session/use-pomodoro-session-store')
  return { ...alert, usePomodoroStore: store.usePomodoroStore }
}

const finishFocus = (store: { start(): void; remainingSeconds: number }) => {
  store.start()
  vi.advanceTimersByTime(store.remainingSeconds * 1000 + 500)
}

describe('useSessionAlert', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
    setActivePinia(createPinia())
    FakeAudioContext.tones = 0
    FakeNotification.permission = 'granted'
    FakeNotification.shown = []
    FakeNotification.requestPermission.mockClear()
    vi.stubGlobal('AudioContext', FakeAudioContext)
    vi.stubGlobal('Notification', FakeNotification)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  const setup = async () => {
    const mods = await loadModules()
    setActivePinia(createPinia())
    const scope = effectScope()
    scope.run(() => mods.useSessionAlert())
    await mods.primeSessionAlerts()
    return { ...mods, store: mods.usePomodoroStore(), scope }
  }

  it('plays a chime and shows a notification when a session ends', async () => {
    const { store } = await setup()

    finishFocus(store)

    expect(FakeAudioContext.tones).toBe(2)
    expect(FakeNotification.shown).toEqual([
      { title: 'Pomodoro finished', body: 'Up next: Short Break' },
    ])
  })

  it('stays silent when the sound is turned off, but still notifies', async () => {
    const { store, soundEnabled } = await setup()
    soundEnabled.value = false
    await nextTick()

    finishFocus(store)

    expect(FakeAudioContext.tones).toBe(0)
    expect(FakeNotification.shown).toHaveLength(1)
  })

  it('remembers the sound setting across reloads', async () => {
    const first = await loadModules()
    expect(first.soundEnabled.value).toBe(true)
    first.soundEnabled.value = false
    await nextTick()

    const second = await loadModules()

    expect(second.soundEnabled.value).toBe(false)
  })

  it('works silently when notifications are denied', async () => {
    FakeNotification.permission = 'denied'
    const { store } = await setup()

    expect(() => finishFocus(store)).not.toThrow()
    expect(FakeNotification.shown).toHaveLength(0)
    expect(FakeNotification.requestPermission).not.toHaveBeenCalled()
  })

  it('asks for permission only while it is undecided (first Start)', async () => {
    FakeNotification.permission = 'default'
    const { primeSessionAlerts } = await setup()
    expect(FakeNotification.requestPermission).toHaveBeenCalledTimes(1)

    FakeNotification.permission = 'granted'
    await primeSessionAlerts()

    expect(FakeNotification.requestPermission).toHaveBeenCalledTimes(1)
  })

  it('stops alerting after the owning component is gone', async () => {
    const { store, scope } = await setup()
    scope.stop()

    finishFocus(store)

    expect(FakeAudioContext.tones).toBe(0)
    expect(FakeNotification.shown).toHaveLength(0)
  })
})
