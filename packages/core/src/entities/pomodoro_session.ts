import { SessionType } from "./session_type"

export interface PomodoroSession {
    id: string,
    type: SessionType,
    duration: number
    remaining: number
    isRunning: boolean
    startedAt?: number
}