<template>
  <div class="pomodoro-card">
    <!-- Setting -->
    <div class="flex justify-end">
      <IconButton aria-label="Settings" @click="settingsOpen = true">
        <font-awesome-icon icon="gear" class="text-primary" />
      </IconButton>
    </div>
    <SettingsView v-model="settingsOpen" />

    <div class="justify-center text-center mb-4" role="timer" aria-live="off">
      {{ store.formattedTime }}
    </div>
    <!-- Buttons -->
    <div class="flex justify-center gap-x-5 items-center">
      <IconButton aria-label="Reset" @click="store.reset()">
        <font-awesome-icon icon="repeat" class="text-primary" />
      </IconButton>
      <FilledButton :label="store.isRunning ? 'Pause' : 'Start'" @click="toggle"></FilledButton>
      <IconButton aria-label="Skip" @click="store.skip()">
        <font-awesome-icon icon="forward-step" class="text-primary" />
      </IconButton>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import FilledButton from '../FilledButton.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faForwardStep, faRepeat, faGear } from '@fortawesome/free-solid-svg-icons'
import IconButton from '../IconButton.vue'
import SettingsView from '@/view/SettingsView.vue'
import { usePomodoroStore } from '@/stores/pomodoro-session/use-pomodoro-session-store'
library.add(faForwardStep, faRepeat, faGear)

const store = usePomodoroStore()
const settingsOpen = ref(false)

const toggle = () => (store.isRunning ? store.pause() : store.start())

const props = defineProps({
  timer: {
    type: String,
    default: 'Click m e',
  },
  configuration: {
    type: String,
    default: 'Click m e',
  },
})
</script>
<style lang="postcss">
.pomodoro-card {
  @apply bg-surface p-2.5 [width:min(500px)] h-40 rounded-3xl flex flex-col;
}
</style>
