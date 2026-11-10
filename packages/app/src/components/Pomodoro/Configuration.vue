<template>
  <!-- Text Buttons -->
  <div class="flex justify-center w-full gap-x-5" role="group" aria-label="Timer mode">
    <TextButton
      v-for="m in modes"
      :key="m"
      :label="MODE_LABELS[m]"
      :class="{ 'btn-active': store.mode === m }"
      :aria-pressed="store.mode === m"
      @click="store.setMode(m)"
    ></TextButton>
  </div>
</template>
<script setup lang="ts">
import TextButton from '../TextButton.vue'
import {
  MODE_LABELS,
  usePomodoroStore,
  type PomodoroMode,
} from '@/stores/pomodoro-session/use-pomodoro-session-store'

const store = usePomodoroStore()
const modes: PomodoroMode[] = ['pomodoro', 'short', 'long']
</script>
<style></style>
