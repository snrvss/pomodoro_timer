export interface Timer {
  id: string
  duration: number
  remaining: number
  isRunning: boolean
  startedAt: number
}
