import { SessionType, PomodoroSettings, PomodoroSnapshot } from '../../entities/index'

export interface PomodoroPort {
  /**
   * Returns a snapshot of the current pomodoro state.
   *
   * @returns {PomodoroSnapshot} the full current state (settings, session type, cycleCount, timer)
   */
  getSnapshot(): PomodoroSnapshot

  /**
   * Updates the settings of the current pomodoro
   * @param {Partial<PomodoroSettings>} - partial settings object
   */
  setSettings(p: Partial<PomodoroSettings>): void

  /**
   * Resets the timer to a different session type (FOCUS, SHORT_BREAK, LONG_BREAK),
   * without starting it automatically.
   *
   * @param {SessionType} t - the desired session type to switch to
   */
  setSessionType(t: SessionType): void

  /**
   * Starts or resumes the timer.
   * If the remaining time is 0, it will reset the current session before starting.
   */
  start(): void

  /**
   * Pauses the timer.
   */
  pause(): void

  /**
   * Resets the current session timer (to its full duration) and stops it.
   */
  restart(): void

  /**
   * Immediately skips to the next session (short/long break or focus),
   * without waiting for the timer to finish.
   */
  next(): void

  /**
   * Advances time forward. This must be called regularly (ex: every 250ms).
   * @returns {boolean} - returns `true` if the session just finished and a new session started.
   */
  tick(): boolean
}
