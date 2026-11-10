<template>
  <Modal v-model="open">
    <template #title>Settings</template>

    <div class="flex flex-col gap-6">
      <!-- Durations -->
      <div class="grid grid-cols-3 gap-4 mt-2">
        <TextField v-model.number="form.pomodoroDuration" label="Pomodoro" type="number" />
        <TextField v-model.number="form.shortBreakDuration" label="Short Break" type="number" />
        <TextField v-model.number="form.longBreakDuration" label="Long Break" type="number" />
      </div>

      <!-- Long break interval -->
      <TextField
        v-model.number="form.longBreakInterval"
        class="w-full"
        label="Long Break Interval"
        type="number"
      />

      <!-- Pomodoro settings -->
      <div class="flex flex-wrap gap-6">
        <label class="flex items-center gap-2 cursor-pointer">
          <Checkbox v-model:value="form.autoStartBreaks" />
          Auto Start Breaks
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <Checkbox v-model:value="form.autoStartPomodoros" />
          Auto Start Pomodoros
        </label>
      </div>
    </div>

    <template #actions="{ close }">
      <TextButton label="Cancel" @click="close" />
      <FilledButton label="Save" @click="save" />
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  usePomodoroStore,
  type PomodoroStoreSettings,
} from '@/stores/pomodoro-session/use-pomodoro-session-store'
import Modal from '@/components/Modal.vue'
import TextField from '@/components/TextField.vue'
import Checkbox from '@/components/Checkbox.vue'
import TextButton from '@/components/TextButton.vue'
import FilledButton from '@/components/FilledButton.vue'

const open = defineModel<boolean>({ default: false })

const store = usePomodoroStore()

// Draft copy of the store settings: edits only apply on Save, Cancel discards them
const form = ref<PomodoroStoreSettings>({ ...store.settings })

watch(open, (isOpen) => {
  if (isOpen) form.value = { ...store.settings }
})

const save = () => {
  store.updateSettings(form.value)
  open.value = false
}
</script>
