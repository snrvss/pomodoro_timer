import { SessionType } from './session-type'
import type { Timer } from './timer'

export interface PomodoroSession {
  id: string
  type: SessionType
  timer: Timer
}
