<template>
  <div class="absolute top-4 right-4 flex items-center gap-2 z-10">
    <button
      type="button"
      role="switch"
      class="theme-switch"
      aria-label="Dark mode"
      :aria-checked="isDark"
      @click="toggleTheme"
    >
      <span class="theme-switch__thumb">
        <font-awesome-icon :icon="isDark ? 'moon' : 'sun'" />
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useColorMode } from '@vueuse/core'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons'
library.add(faMoon, faSun)

// Start in the light (cream) theme instead of following the OS setting;
// dark mode only turns on when the user flips the switch.
// A new storage key so an old saved 'auto' value doesn't keep forcing dark.
const mode = useColorMode({
  selector: 'html',
  attribute: 'class',
  initialValue: 'light',
  storageKey: 'pomodoro-timer:color-scheme',
})

const isDark = computed(() => mode.value === 'dark')

const toggleTheme = () => {
  mode.value = isDark.value ? 'light' : 'dark'
}
</script>

<style lang="postcss">
.theme-switch {
  @apply relative inline-flex items-center w-14 h-8 p-1 rounded-full
    bg-surfaceContainer border border-outline transition-colors;
}

.theme-switch[aria-checked='true'] {
  @apply bg-primary border-primary;
}

.theme-switch:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.theme-switch__thumb {
  @apply flex items-center justify-center w-6 h-6 rounded-full bg-surface text-primary text-xs
    shadow transition-transform duration-200;
}

.theme-switch[aria-checked='true'] .theme-switch__thumb {
  @apply translate-x-6;
}

@media (prefers-reduced-motion: reduce) {
  .theme-switch__thumb {
    transition: none;
  }
}
</style>
