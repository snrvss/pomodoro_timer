<template>
  <div class="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center">
    <div class="flex flex-col items-center gap-8 w-[min(560px,100%)]">
      <img :src="ParkIllustration" alt="" class="w-[90%]" />
      <Configuration></Configuration>
      <SessionCompleteCard></SessionCompleteCard>
      <Card></Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import ParkIllustration from '@/assets/kawaii_park_transparent.svg'
import Card from '@/components/Pomodoro/SettingCard.vue'
import SessionCompleteCard from '@/components/Pomodoro/SessionCompleteCard.vue'
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
