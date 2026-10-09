import { PomodoroSettings } from './pomodoro-settings'
import { SessionType } from './session-type'
import { Timer } from './timer'

/**
 * A snapshot of the current state of the Pomodoro (used as a read-only DTO for the UI).
 */
export interface PomodoroSnapshot {
  settings: PomodoroSettings
  currentType: SessionType
  cycleCount: number
  timer: Timer
}
