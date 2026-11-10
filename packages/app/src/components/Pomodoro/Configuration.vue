<template>
  <!-- Segmented control: pill track with the active mode filled -->
  <div class="mode-switch" role="group" aria-label="Timer mode">
    <button
      v-for="m in modes"
      :key="m"
      type="button"
      class="mode-switch__item"
      :class="{ 'mode-switch__item--active': store.mode === m }"
      :aria-pressed="store.mode === m"
      @click="store.setMode(m)"
    >
      {{ MODE_LABELS[m] }}
    </button>
  </div>
</template>
<script setup lang="ts">
import {
  MODE_LABELS,
  usePomodoroStore,
  type PomodoroMode,
} from '@/stores/pomodoro-session/use-pomodoro-session-store'

const store = usePomodoroStore()
const modes: PomodoroMode[] = ['pomodoro', 'short', 'long']
</script>
<style lang="postcss">
.mode-switch {
  @apply w-[94%] grid grid-cols-3 gap-1 p-1.5 rounded-full bg-surfaceContainer;
}

.mode-switch__item {
  @apply px-4 py-2.5 rounded-full text-base font-medium text-onSurface whitespace-nowrap;
  transition:
    background-color 200ms,
    color 200ms;
}

.mode-switch__item:hover:not(.mode-switch__item--active) {
  background-color: color-mix(in srgb, var(--color-primary) 10%, transparent);
}

.mode-switch__item:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.mode-switch__item--active {
  @apply bg-primary text-onPrimary font-semibold;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.2);
}
</style>
