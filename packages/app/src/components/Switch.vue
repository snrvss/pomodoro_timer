<template>
  <div class="absolute top-4 right-4 flex items-center gap-2 z-10">
    <input type="checkbox" class="toggle" :checked="mode === 'dark'" @change="toggleTheme" />
  </div>
</template>

<script setup lang="ts">
import { useColorMode } from '@vueuse/core'

const mode = useColorMode({
  selector: 'html',
  attribute: 'class',
})

// Handle checkbox change
function toggleTheme(event: Event) {
  const isChecked = (event.target as HTMLInputElement).checked
  mode.value = isChecked ? 'dark' : 'light'
}
</script>
