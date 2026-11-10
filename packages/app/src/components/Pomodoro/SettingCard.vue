<template>
  <div class="pomodoro-card">
    <!-- Settings -->
    <IconButton class="pomodoro-card__settings" aria-label="Settings" @click="settingsOpen = true">
      <font-awesome-icon icon="gear" />
    </IconButton>
    <SettingsView v-model="settingsOpen" />

    <div class="pomodoro-card__time" role="timer" aria-live="off">
      {{ store.formattedTime }}
    </div>

    <!-- Controls -->
    <div class="flex justify-center items-center gap-x-10 sm:gap-x-14">
      <IconButton class="pomodoro-card__control" aria-label="Reset" @click="store.reset()">
        <font-awesome-icon icon="repeat" />
      </IconButton>
      <FilledButton
        class="pomodoro-card__start"
        :label="store.isRunning ? 'Pause' : 'Start'"
        @click="toggle"
      >
        <template #icon>
          <font-awesome-icon :icon="store.isRunning ? 'pause' : 'play'" />
        </template>
      </FilledButton>
      <IconButton class="pomodoro-card__control" aria-label="Skip" @click="store.skip()">
        <font-awesome-icon icon="forward-step" />
      </IconButton>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import FilledButton from '../FilledButton.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faForwardStep, faRepeat, faGear, faPlay, faPause } from '@fortawesome/free-solid-svg-icons'
import IconButton from '../IconButton.vue'
import SettingsView from '@/view/SettingsView.vue'
import { usePomodoroStore } from '@/stores/pomodoro-session/use-pomodoro-session-store'
import { primeSessionAlerts } from '@/composables/useSessionAlert'
library.add(faForwardStep, faRepeat, faGear, faPlay, faPause)

const store = usePomodoroStore()
const settingsOpen = ref(false)

const toggle = () => {
  if (store.isRunning) {
    store.pause()
    return
  }
  store.start()
  // Runs inside the click so the browser allows audio and the permission prompt
  void primeSessionAlerts()
}
</script>
<style lang="postcss">
.pomodoro-card {
  @apply relative w-full flex flex-col items-center gap-8 px-6 pt-14 pb-12
    rounded-3xl bg-surface text-onSurface border border-outline;
  box-shadow:
    0 1px 2px 0 rgb(74 44 32 / 0.04),
    0 10px 30px -8px rgb(74 44 32 / 0.18);
}

.pomodoro-card__settings {
  @apply absolute top-4 right-4;
}

.pomodoro-card__time {
  @apply font-semibold leading-none tracking-tight;
  /* Scales with the screen, from 4.5rem on phones up to 7.5rem */
  font-size: clamp(4.5rem, 18vw, 7.5rem);
  font-variant-numeric: tabular-nums;
}

.pomodoro-card__control {
  @apply w-12 h-12 text-2xl;
}

.pomodoro-card__start {
  @apply h-14 min-w-44 text-lg;
}
</style>
