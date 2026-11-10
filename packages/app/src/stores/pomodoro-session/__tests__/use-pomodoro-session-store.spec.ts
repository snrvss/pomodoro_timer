import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import {
  DEFAULT_SETTINGS,
  STORAGE_PREFIX,
  formatTime,
  usePomodoroStore,
} from '../use-pomodoro-session-store'

const MIN = 60

/** Runs the current session to the end with fake timers. */
const finishSession = (store: ReturnType<typeof usePomodoroStore>) => {
  store.start()
  vi.advanceTimersByTime(store.remainingSeconds * 1000 + 500)
}

describe('formatTime', () => {
  it.each([
    [0, '00:00'],
    [5, '00:05'],
    [65, '01:05'],
    [25 * MIN, '25:00'],
    [100 * MIN, '100:00'],
    [-3, '00:00'],
  ])('formats %d seconds as %s', (seconds, expected) => {
    expect(formatTime(seconds)).toBe(expected)
  })
})

describe('usePomodoroStore', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts on round 1 with a full pomodoro', () => {
    const store = usePomodoroStore()
    expect(store.mode).toBe('pomodoro')
    expect(store.round).toBe(1)
    expect(store.isRunning).toBe(false)
    expect(store.remainingSeconds).toBe(25 * MIN)
    expect(store.formattedTime).toBe('25:00')
  })

  it('counts down while running and stops on pause', () => {
    const store = usePomodoroStore()
    store.start()
    vi.advanceTimersByTime(3000)
    expect(store.remainingSeconds).toBe(25 * MIN - 3)

    store.pause()
    vi.advanceTimersByTime(5000)
    expect(store.isRunning).toBe(false)
    expect(store.remainingSeconds).toBe(25 * MIN - 3)

    store.reset()
    expect(store.remainingSeconds).toBe(25 * MIN)
  })

  it('cycles focus -> short break and takes a long break every longBreakInterval rounds', () => {
    const store = usePomodoroStore()
    const seen: string[] = []

    for (let i = 0; i < 8; i++) {
      finishSession(store)
      seen.push(`${store.mode}#${store.round}`)
    }

    expect(seen).toEqual([
      'short#1',
      'pomodoro#2',
      'short#2',
      'pomodoro#3',
      'short#3',
      'pomodoro#4',
      'long#4',
      'pomodoro#5',
    ])
    expect(store.remainingSeconds).toBe(25 * MIN)
    // Auto-start is off by default
    expect(store.isRunning).toBe(false)
  })

  it('notifies session-end listeners only when a session runs out', () => {
    const store = usePomodoroStore()
    const listener = vi.fn()
    const stop = store.onSessionEnd(listener)

    store.skip()
    store.setMode('long')
    expect(listener).not.toHaveBeenCalled()

    finishSession(store)
    expect(listener).toHaveBeenCalledWith({ ended: 'long', next: 'pomodoro' })

    stop()
    finishSession(store)
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('auto-starts the next session when enabled', () => {
    const store = usePomodoroStore()
    store.updateSettings({ autoStartBreaks: true })
    finishSession(store)
    expect(store.mode).toBe('short')
    expect(store.isRunning).toBe(true)
  })

  describe('skip', () => {
    it('moves to the next session without starting it', () => {
      const store = usePomodoroStore()
      store.start()
      vi.advanceTimersByTime(10_000)

      store.skip()
      expect(store.mode).toBe('short')
      expect(store.isRunning).toBe(false)
      expect(store.remainingSeconds).toBe(5 * MIN)

      store.skip()
      expect(store.mode).toBe('pomodoro')
      expect(store.round).toBe(2)
    })

    it('follows the same long break rule as finishing a session', () => {
      const store = usePomodoroStore()
      store.updateSettings({ longBreakInterval: 2 })
      store.skip() // pomodoro 1 -> short
      store.skip() // -> pomodoro 2
      store.skip() // pomodoro 2 -> long
      expect(store.mode).toBe('long')
      expect(store.round).toBe(2)
    })
  })

  describe('setMode (tabs)', () => {
    it('does not change the round when jumping to a break', () => {
      const store = usePomodoroStore()
      store.setMode('short')
      expect(store.round).toBe(1)

      // Finishing a break that did not follow a pomodoro keeps the round
      finishSession(store)
      expect(store.mode).toBe('pomodoro')
      expect(store.round).toBe(1)
    })

    it('starts the next round when leaving a break early via the Pomodoro tab', () => {
      const store = usePomodoroStore()
      finishSession(store) // pomodoro 1 done -> short break
      store.setMode('pomodoro')
      expect(store.round).toBe(2)

      // Clicking it again does not count twice
      store.setMode('pomodoro')
      expect(store.round).toBe(2)
    })

    describe('long-break cycle', () => {
      /** Finishes the current pomodoro and returns the break the timer switched to. */
      const completePomodoro = (store: ReturnType<typeof usePomodoroStore>) => {
        expect(store.mode).toBe('pomodoro')
        finishSession(store)
        return store.mode
      }

      it('still gives the long break after the 4th finished pomodoro when breaks are picked via tabs', () => {
        const store = usePomodoroStore()
        const breaks: string[] = []

        for (let pomodoro = 1; pomodoro <= 4; pomodoro++) {
          expect(store.round).toBe(pomodoro)
          breaks.push(completePomodoro(store))
          // Leave every break through the tabs instead of letting it run out
          store.setMode('short')
          store.setMode('pomodoro')
        }

        expect(breaks).toEqual(['short', 'short', 'short', 'long'])
        expect(store.round).toBe(5)
      })

      it('does not count a pomodoro that was abandoned by switching to a break tab', () => {
        const store = usePomodoroStore()
        completePomodoro(store) // pomodoro 1
        store.setMode('pomodoro') // round 2

        // Start pomodoro 2, give up halfway and jump to the Long Break tab
        store.start()
        vi.advanceTimersByTime(10 * MIN * 1000)
        store.setMode('long')
        finishSession(store) // the long break runs out
        expect(store.mode).toBe('pomodoro')
        expect(store.round).toBe(2) // pomodoro 2 still has to be done

        // The cycle is unchanged: pomodoros 2 and 3 give short breaks, 4 the long one
        expect(completePomodoro(store)).toBe('short')
        store.setMode('pomodoro')
        expect(completePomodoro(store)).toBe('short')
        store.setMode('pomodoro')
        expect(store.round).toBe(4)
        expect(completePomodoro(store)).toBe('long')
      })

      it('keeps the cycle when the offered long break is swapped for a short one', () => {
        const store = usePomodoroStore()
        for (let pomodoro = 1; pomodoro <= 3; pomodoro++) {
          completePomodoro(store)
          store.setMode('pomodoro')
        }
        expect(completePomodoro(store)).toBe('long') // after pomodoro 4

        store.setMode('short') // take a short break instead
        finishSession(store)
        expect(store.round).toBe(5)

        const next: string[] = []
        for (let pomodoro = 5; pomodoro <= 8; pomodoro++) {
          next.push(completePomodoro(store))
          store.setMode('pomodoro')
        }
        expect(next).toEqual(['short', 'short', 'short', 'long'])
      })

      it('follows a changed longBreakInterval', () => {
        const store = usePomodoroStore()
        store.updateSettings({ longBreakInterval: 2 })

        const breaks: string[] = []
        for (let pomodoro = 1; pomodoro <= 4; pomodoro++) {
          breaks.push(completePomodoro(store))
          store.setMode('short')
          store.setMode('pomodoro')
        }

        expect(breaks).toEqual(['short', 'long', 'short', 'long'])
      })
    })

    it('resets the timer and stops it', () => {
      const store = usePomodoroStore()
      store.start()
      store.setMode('long')
      expect(store.isRunning).toBe(false)
      expect(store.remainingSeconds).toBe(15 * MIN)
    })
  })

  describe('updateSettings', () => {
    it('applies valid values and refreshes an untouched timer', () => {
      const store = usePomodoroStore()
      store.updateSettings({ pomodoroDuration: 50, longBreakInterval: 3 })
      expect(store.settings.pomodoroDuration).toBe(50)
      expect(store.settings.longBreakInterval).toBe(3)
      expect(store.remainingSeconds).toBe(50 * MIN)
    })

    it.each([0, -5, Number.NaN, '' as unknown as number, 'abc' as unknown as number])(
      'ignores invalid duration %s',
      (value) => {
        const store = usePomodoroStore()
        store.updateSettings({ pomodoroDuration: value, longBreakInterval: value })
        expect(store.settings.pomodoroDuration).toBe(DEFAULT_SETTINGS.pomodoroDuration)
        expect(store.settings.longBreakInterval).toBe(DEFAULT_SETTINGS.longBreakInterval)
      },
    )

    it('floors fractional values', () => {
      const store = usePomodoroStore()
      store.updateSettings({ shortBreakDuration: 7.9 })
      expect(store.settings.shortBreakDuration).toBe(7)
    })

    it('keeps the remaining time of a session in progress', () => {
      const store = usePomodoroStore()
      store.start()
      vi.advanceTimersByTime(60_000)
      store.pause()
      store.updateSettings({ pomodoroDuration: 50 })
      expect(store.remainingSeconds).toBe(24 * MIN)
    })
  })

  describe('persistence', () => {
    it('restores state after a reload without resuming the timer', async () => {
      const first = usePomodoroStore()
      first.updateSettings({ shortBreakDuration: 10 })
      finishSession(first) // -> short break, round 1
      first.start()
      vi.advanceTimersByTime(30_000)
      await nextTick()

      // Simulate a page reload: fresh Pinia, same localStorage
      setActivePinia(createPinia())
      const second = usePomodoroStore()
      expect(second.settings.shortBreakDuration).toBe(10)
      expect(second.mode).toBe('short')
      expect(second.round).toBe(1)
      expect(second.remainingSeconds).toBe(10 * MIN - 30)
      expect(second.isRunning).toBe(false)
    })

    it('falls back to defaults when stored data is corrupt', () => {
      localStorage.setItem(`${STORAGE_PREFIX}mode`, 'nap')
      localStorage.setItem(`${STORAGE_PREFIX}round`, '-2')
      localStorage.setItem(`${STORAGE_PREFIX}remaining-seconds`, 'oops')
      localStorage.setItem(`${STORAGE_PREFIX}settings`, '{"pomodoroDuration":0}')

      const store = usePomodoroStore()
      expect(store.mode).toBe('pomodoro')
      expect(store.round).toBe(1)
      expect(store.settings).toEqual(DEFAULT_SETTINGS)
      expect(store.remainingSeconds).toBe(25 * MIN)
    })
  })
})
