import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import type { PomodoroSettings } from '@pomodoro-timer/core'

export type PomodoroMode = 'pomodoro' | 'short' | 'long'

/** Payload passed to {@link usePomodoroStore} `onSessionEnd` listeners. */
export interface SessionEndEvent {
  /** The session that just ran out. */
  ended: PomodoroMode
  /** The session the timer moved on to. */
  next: PomodoroMode
}

export type SessionEndListener = (event: SessionEndEvent) => void

/**
 * Default timer settings. Durations are in minutes. Typed with core's `PomodoroSettings`.
 */
export const DEFAULT_SETTINGS: PomodoroSettings = {
  pomodoroDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
}

export const MODE_LABELS: Record<PomodoroMode, string> = {
  pomodoro: 'Pomodoro',
  short: 'Short Break',
  long: 'Long Break',
}

export const STORAGE_PREFIX = 'pomodoro-timer:'

const MODES: PomodoroMode[] = ['pomodoro', 'short', 'long']
const TICK_MS = 250

/**
 * Formats a number of seconds as `mm:ss`.
 *
 * @param totalSeconds - Seconds to format; negative values are treated as 0.
 */
export const formatTime = (totalSeconds: number) => {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

/**
 * Returns `value` if it is a positive integer, otherwise `fallback`.
 */
const toPositiveInt = (value: unknown, fallback: number) => {
  const n = Number(value)
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : fallback
}

/**
 * Merges `patch` onto `prev`, keeping the previous value for any field
 * that is missing or invalid (non-positive or non-numeric durations).
 */
const mergeSettings = (
  prev: PomodoroSettings,
  patch: Partial<PomodoroSettings>,
): PomodoroSettings => ({
  pomodoroDuration: toPositiveInt(patch.pomodoroDuration, prev.pomodoroDuration),
  shortBreakDuration: toPositiveInt(patch.shortBreakDuration, prev.shortBreakDuration),
  longBreakDuration: toPositiveInt(patch.longBreakDuration, prev.longBreakDuration),
  longBreakInterval: toPositiveInt(patch.longBreakInterval, prev.longBreakInterval),
  autoStartBreaks:
    typeof patch.autoStartBreaks === 'boolean' ? patch.autoStartBreaks : prev.autoStartBreaks,
  autoStartPomodoros:
    typeof patch.autoStartPomodoros === 'boolean'
      ? patch.autoStartPomodoros
      : prev.autoStartPomodoros,
})

/**
 * Pomodoro timer state and logic.
 *
 * @remarks
 * Public API: state + start/pause/reset/skip/setMode/updateSettings, and `onSessionEnd` for
 * listeners that react when a session runs out.
 *
 * Settings, mode, remaining time and round are persisted to localStorage.
 * `isRunning` is not, so a reload always comes back paused.
 */
export const usePomodoroStore = defineStore('pomodoro', () => {
  const settings = useLocalStorage<PomodoroSettings>(
    `${STORAGE_PREFIX}settings`,
    { ...DEFAULT_SETTINGS },
    { mergeDefaults: true },
  )
  const mode = useLocalStorage<PomodoroMode>(`${STORAGE_PREFIX}mode`, 'pomodoro')
  const round = useLocalStorage(`${STORAGE_PREFIX}round`, 1)
  // Whether the pomodoro of the current round has already been finished.
  // The round only advances when moving on from a finished pomodoro, so
  // jumping between tabs never skews the count.
  const focusDone = useLocalStorage(`${STORAGE_PREFIX}focus-done`, false)
  const remainingSeconds = useLocalStorage(
    `${STORAGE_PREFIX}remaining-seconds`,
    DEFAULT_SETTINGS.pomodoroDuration * 60,
  )
  const isRunning = ref(false)

  const durationFor = (m: PomodoroMode) => {
    const s = settings.value
    const minutes =
      m === 'pomodoro'
        ? s.pomodoroDuration
        : m === 'short'
          ? s.shortBreakDuration
          : s.longBreakDuration
    return minutes * 60
  }

  // Repair anything invalid that came back from storage
  settings.value = mergeSettings(DEFAULT_SETTINGS, settings.value ?? {})
  if (!MODES.includes(mode.value)) mode.value = 'pomodoro'
  round.value = toPositiveInt(round.value, 1)
  if (typeof focusDone.value !== 'boolean') focusDone.value = false
  const storedRemaining = Number(remainingSeconds.value)
  remainingSeconds.value =
    Number.isFinite(storedRemaining) && storedRemaining > 0
      ? Math.min(Math.floor(storedRemaining), durationFor(mode.value))
      : durationFor(mode.value)

  // Wall-clock deadline of the running session. Deriving the remaining time
  // from it keeps the countdown accurate when the browser throttles timers
  // in background tabs.
  let endsAt = 0
  let intervalId: ReturnType<typeof setInterval> | undefined
  const sessionEndListeners = new Set<SessionEndListener>()

  const formattedTime = computed(() => formatTime(remainingSeconds.value))
  const modeLabel = computed(() => MODE_LABELS[mode.value])

  const clearTicker = () => {
    if (intervalId !== undefined) {
      clearInterval(intervalId)
      intervalId = undefined
    }
  }

  const tick = () => {
    remainingSeconds.value = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000))
    if (remainingSeconds.value === 0) completeSession()
  }

  const start = () => {
    if (isRunning.value) return
    if (remainingSeconds.value <= 0) remainingSeconds.value = durationFor(mode.value)
    endsAt = Date.now() + remainingSeconds.value * 1000
    isRunning.value = true
    clearTicker()
    intervalId = setInterval(tick, TICK_MS)
  }

  const pause = () => {
    if (!isRunning.value) return
    remainingSeconds.value = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000))
    isRunning.value = false
    clearTicker()
  }

  /** Stops the timer and restores the full duration of the current mode. */
  const reset = () => {
    pause()
    remainingSeconds.value = durationFor(mode.value)
  }

  /**
   * Switches to `m` and resets its timer, without starting it.
   *
   * @remarks
   * Entering a pomodoro after the current round's pomodoro was finished
   * starts the next round, whether that happens via the timer, Skip or a tab.
   * Switching to a break never changes the round.
   */
  const setMode = (m: PomodoroMode) => {
    pause()
    if (m === 'pomodoro' && focusDone.value) {
      round.value += 1
      focusDone.value = false
    }
    mode.value = m
    remainingSeconds.value = durationFor(m)
  }

  /**
   * Moves to the session that follows the current one.
   * Finishing pomodoro N leads to a long break when N is a multiple of
   * `longBreakInterval`, otherwise to a short break.
   */
  const advance = () => {
    if (mode.value === 'pomodoro') {
      focusDone.value = true
      const isLong = round.value % settings.value.longBreakInterval === 0
      setMode(isLong ? 'long' : 'short')
    } else {
      setMode('pomodoro')
    }
  }

  const completeSession = () => {
    const ended = mode.value
    advance()
    const next = mode.value
    sessionEndListeners.forEach((listener) => {
      try {
        listener({ ended, next })
      } catch (error) {
        console.error('[pomodoro] session end listener failed', error)
      }
    })
    const autoStart =
      next === 'pomodoro' ? settings.value.autoStartPomodoros : settings.value.autoStartBreaks
    if (autoStart) start()
  }

  /** Skips to the next session immediately, without auto-starting it. */
  const skip = () => {
    advance()
  }

  /**
   * Merges new settings. Invalid durations/interval keep their previous value.
   * If the current session hasn't started yet, its time is updated too.
   */
  const updateSettings = (patch: Partial<PomodoroSettings>) => {
    const wasUntouched = !isRunning.value && remainingSeconds.value === durationFor(mode.value)
    settings.value = mergeSettings(settings.value, patch)
    if (wasUntouched) remainingSeconds.value = durationFor(mode.value)
  }

  /**
   * Registers a callback fired when a session runs out on its own
   * (not on skip, reset or tab changes).
   *
   * @returns A function that removes the listener.
   */
  const onSessionEnd = (listener: SessionEndListener) => {
    sessionEndListeners.add(listener)
    return () => {
      sessionEndListeners.delete(listener)
    }
  }

  return {
    // state
    mode,
    remainingSeconds,
    isRunning,
    round,
    settings,
    // getters
    formattedTime,
    modeLabel,
    // actions
    start,
    pause,
    reset,
    skip,
    setMode,
    updateSettings,
    onSessionEnd,
  }
})
