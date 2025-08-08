<template>
  <div class="pomodoro-card">
    <!-- Setting -->
    <div class="flex justify-end">
      <font-awesome-icon icon="gear" class="text-primary" />
    </div>

    <div class="justify-center text-center mb-4">TIME</div>
    <!-- Buttons -->
    <div class="flex justify-center gap-x-5 items-center">
      <font-awesome-icon icon="repeat" class="text-primary" />
      <FilledButton label="Start"></FilledButton>

      <font-awesome-icon icon="forward-step" class="text-primary" />
    </div>
  </div>
</template>
<script setup lang="ts">
import FilledButton from '../FilledButton.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faForwardStep, faRepeat, faGear } from '@fortawesome/free-solid-svg-icons'
library.add(faForwardStep, faRepeat, faGear)

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
