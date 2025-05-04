POMODORO TIMER

Entities:

### Timer

```
Timer {
    id: string
    duration: number
    remaining: number
    isRunning: boolean
    startedAt: number
}
```

### Session Type

```
 enum SessionType {
    FOCUS = 'focus'
    SHORT_BREAK = 'short_break'
    LONG_BREAK = 'long_break'
}
```

### Pomodoro Session

PomodoroSession {
id: string
type: SesionType
duration: number
remaining: number
isRunning: boolean
startedAt?: number
}

### Quote

Quote{
id: string
text: string
}
