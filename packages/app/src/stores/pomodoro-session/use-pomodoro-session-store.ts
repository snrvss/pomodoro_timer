import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type PomodoroMode = 'pomodoro' | 'short' | 'long'

/**
 * Durations are in minutes. Field names mirror `PomodoroSettings` from
 * `@pomodoro-timer/core` so the store can later delegate to a `PomodoroPort`.
 */
export interface PomodoroStoreSettings {
  pomodoroDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  longBreakInterval: number
  autoStartBreaks: boolean
  autoStartPomodoros: boolean
}

export const DEFAULT_SETTINGS: PomodoroStoreSettings = {
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

const TICK_MS = 250

/**
 * Formats a number of seconds as `mm:ss`.
 *
 * @param totalSeconds - Seconds to format; negative values are treated as 0.
 */
export const formatTime = (totalSeconds: number) => {
  const safe = Math.max(0, totalSeconds)
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
 * Pomodoro timer state backed by local mock logic.
 *
 * @remarks
 * The public API (state + start/pause/reset/skip/setMode/updateSettings)
 * maps one-to-one onto `PomodoroPort` (start/pause/restart/next/
 * setSessionType/setSettings), so the internals can be swapped for a port
 * implementation without changing components.
 */
export const usePomodoroStore = defineStore('pomodoro', () => {
  const settings = ref<PomodoroStoreSettings>({ ...DEFAULT_SETTINGS })
  const mode = ref<PomodoroMode>('pomodoro')
  const round = ref(1)
  const isRunning = ref(false)
  const remainingSeconds = ref(settings.value.pomodoroDuration * 60)

  // Wall-clock deadline of the running session. Deriving the remaining time
  // from it keeps the countdown accurate when the browser throttles timers
  // in background tabs.
  let endsAt = 0
  let intervalId: ReturnType<typeof setInterval> | undefined

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

  /** Switches to `m` and resets its timer, without starting it. */
  const setMode = (m: PomodoroMode) => {
    pause()
    mode.value = m
    remainingSeconds.value = durationFor(m)
  }

  /**
   * Moves to the session that follows the current one.
   * A long break follows every `longBreakInterval`-th pomodoro; the round
   * counter advances when a break ends.
   */
  const advance = () => {
    if (mode.value === 'pomodoro') {
      const isLong = round.value % settings.value.longBreakInterval === 0
      setMode(isLong ? 'long' : 'short')
    } else {
      round.value += 1
      setMode('pomodoro')
    }
  }

  const completeSession = () => {
    advance()
    const autoStart =
      mode.value === 'pomodoro' ? settings.value.autoStartPomodoros : settings.value.autoStartBreaks
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
  const updateSettings = (patch: Partial<PomodoroStoreSettings>) => {
    const prev = settings.value
    const wasUntouched = !isRunning.value && remainingSeconds.value === durationFor(mode.value)

    settings.value = {
      pomodoroDuration: toPositiveInt(
        patch.pomodoroDuration ?? prev.pomodoroDuration,
        prev.pomodoroDuration,
      ),
      shortBreakDuration: toPositiveInt(
        patch.shortBreakDuration ?? prev.shortBreakDuration,
        prev.shortBreakDuration,
      ),
      longBreakDuration: toPositiveInt(
        patch.longBreakDuration ?? prev.longBreakDuration,
        prev.longBreakDuration,
      ),
      longBreakInterval: toPositiveInt(
        patch.longBreakInterval ?? prev.longBreakInterval,
        prev.longBreakInterval,
      ),
      autoStartBreaks: patch.autoStartBreaks ?? prev.autoStartBreaks,
      autoStartPomodoros: patch.autoStartPomodoros ?? prev.autoStartPomodoros,
    }

    if (wasUntouched) remainingSeconds.value = durationFor(mode.value)
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
  }
})
