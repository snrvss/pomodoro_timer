<template>
  <div class="w-full justify-center">
    <div class="flex-col flex">
      <div><img .src="QuietStreet" alt="" /></div>
      <Configuration></Configuration>
      <Card></Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import QuietStreet from '@/assets/undraw_quiet-street_v45k.svg'
import Card from '@/components/Pomodoro/SettingCard.vue'
import Configuration from '@/components/Pomodoro/Configuration.vue'
import { useTitle } from '@vueuse/core'
import { usePomodoroStore } from '@/stores/pomodoro-session/use-pomodoro-session-store'

import { useSessionAlert } from '@/composables/useSessionAlert'

const store = usePomodoroStore()

// Sound + browser notification when a session runs out
useSessionAlert()

// Show the countdown in the browser tab; the original title is restored on unmount
useTitle(() => `${store.formattedTime} – ${store.modeLabel}`)
</script>
