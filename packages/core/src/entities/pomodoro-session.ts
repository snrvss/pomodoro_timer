import { SessionType } from './session-type'
import { Timer } from './timer'

export interface PomodoroSession {
  id: string
  type: SessionType
  timer: Timer
}
