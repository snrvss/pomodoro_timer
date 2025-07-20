<template>
  <button class="btn bg-[var(--color-primary)] text-[var(--color-on-primary)]">Click me</button>

  <div class="absolute top-4 right-4 flex items-center gap-2 z-10">
    <input type="checkbox" class="toggle" :checked="mode === 'dark'" @change="toggleTheme" />
  </div>
</template>

<script setup lang="ts">
import { useColorMode } from '@vueuse/core'

const mode = useColorMode({
  selector: 'html', // applies 'dark' class to <html>
  attribute: 'class', // matches tailwind darkMode: class
})

// Handle checkbox change
function toggleTheme(event: Event) {
  const isChecked = (event.target as HTMLInputElement).checked
  mode.value = isChecked ? 'dark' : 'light'
}
</script>
