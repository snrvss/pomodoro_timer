<template>
  <div class="w-full justify-center">
    <div class="flex-col flex">
      <div>
        <img .src="QuietStreet" alt="" />
      </div>
      <Configuration></Configuration>
      <Card></Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import QuietStreet from '@/assets/undraw_quiet-street_v45k.svg'
import Card from '@/components/Pomodoro/SettingCard.vue'
import Configuration from '@/components/Pomodoro/Configuration.vue'
</script>
