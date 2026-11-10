import { onScopeDispose } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import {
  MODE_LABELS,
  STORAGE_PREFIX,
  usePomodoroStore,
  type SessionEndEvent,
} from '@/stores/pomodoro-session/use-pomodoro-session-store'

let audioContext: AudioContext | undefined

/**
 * Whether the session-end chime plays. On by default, saved in localStorage.
 *
 * @remarks
 * Kept apart from the timer settings on purpose: it's an alert preference, not part of core's
 * `PomodoroSettings`. The browser notification is not affected by it.
 */
export const soundEnabled = useLocalStorage(`${STORAGE_PREFIX}sound-enabled`, true)

const notificationsSupported = () => typeof window !== 'undefined' && 'Notification' in window

/**
 * Prepares session-end alerts. Call it from a user gesture (e.g. Start):
 * browsers only allow audio to start, and the permission prompt to show,
 * in response to user interaction.
 *
 * @remarks
 * Asks for notification permission only while it is still undecided, so a
 * denial is respected and never re-prompted. Never throws: if audio or
 * notifications are unavailable, the alert just does less.
 */
export const primeSessionAlerts = async () => {
  try {
    const Ctx = window.AudioContext
    if (!audioContext && Ctx) audioContext = new Ctx()
    if (audioContext?.state === 'suspended') await audioContext.resume()
  } catch {
    // Audio unavailable – the notification (if allowed) still works
  }

  if (notificationsSupported() && Notification.permission === 'default') {
    try {
      await Notification.requestPermission()
    } catch {
      // Older browsers or blocked prompts – fall back to sound only
    }
  }
}

/** Plays a short two-tone chime with the Web Audio API, unless the sound is turned off. */
const playChime = () => {
  const ctx = audioContext
  if (!soundEnabled.value || !ctx || ctx.state !== 'running') return

  const now = ctx.currentTime
  ;[880, 1320].forEach((frequency, i) => {
    const start = now + i * 0.18
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = frequency
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.3, start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35)
    osc.connect(gain).connect(ctx.destination)
    osc.start(start)
    osc.stop(start + 0.4)
  })
}

const showNotification = ({ ended, next }: SessionEndEvent) => {
  if (!notificationsSupported() || Notification.permission !== 'granted') return
  try {
    new Notification(`${MODE_LABELS[ended]} finished`, {
      body: `Up next: ${MODE_LABELS[next]}`,
      tag: 'pomodoro-session-end',
    })
  } catch {
    // e.g. mobile Chrome only allows notifications from a service worker
  }
}

/**
 * Plays a sound (if {@link soundEnabled}) and shows a browser notification (if permitted)
 * whenever a session runs out. The listener is removed when the calling component unmounts.
 */
export const useSessionAlert = () => {
  const store = usePomodoroStore()
  const stop = store.onSessionEnd((event) => {
    playChime()
    showNotification(event)
  })
  onScopeDispose(stop)
}
