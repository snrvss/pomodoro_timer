import { SessionType } from './session_type'
import { Timer } from './timer'

export interface PomodoroSession {
  id: string
  type: SessionType
  timer: Timer
}
