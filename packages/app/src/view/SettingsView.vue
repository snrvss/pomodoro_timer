<template>
  <Modal v-model="open">
    <template #title>Settings</template>

    <div class="flex flex-col gap-6">
      <!-- Durations -->
      <div class="grid grid-cols-3 gap-4">
        <TextField v-model="pomodoro" label="Pomodoro" type="number" />
        <TextField v-model="shortBreak" label="Short Break" type="number" />
        <TextField v-model="longBreak" label="Long Break" type="number" />
      </div>

      <!-- Long break interval -->
      <TextField
        v-model="longBreakInterval"
        class="w-full"
        label="Long Break Interval"
        type="number"
      />

      <!-- Pomodoro settings -->
      <div class="flex flex-wrap gap-6">
        <label class="flex items-center gap-2 cursor-pointer">
          <Checkbox v-model:value="autoStartBreaks" />
          Auto Start Breaks
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <Checkbox v-model:value="autoStartPomodoros" />
          Auto Start Pomodoros
        </label>
      </div>
    </div>

    <template #actions="{ close }">
      <TextButton label="Cancel" @click="close" />
      <FilledButton label="Save" />
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Modal from '@/components/Modal.vue'
import TextField from '@/components/TextField.vue'
import Checkbox from '@/components/Checkbox.vue'
import TextButton from '@/components/TextButton.vue'
import FilledButton from '@/components/FilledButton.vue'

const open = defineModel<boolean>({ default: false })

// Local form state only – not connected to the store yet
const pomodoro = ref(25)
const shortBreak = ref(5)
const longBreak = ref(15)
const longBreakInterval = ref(4)
const autoStartBreaks = ref(false)
const autoStartPomodoros = ref(false)
</script>
