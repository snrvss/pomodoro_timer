<template>
  <input
    type="checkbox"
    class="checkbox"
    :checked="value"
    :disabled="disabled"
    @change="handleCheckbox"
  />
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  value: Boolean,
  disabled: Boolean,
})

const emit = defineEmits(['update:value'])

const handleCheckbox = (event: Event) => {
  const newChecked = (event.target as HTMLInputElement).checked
  emit('update:value', newChecked)
}
</script>
<style lang="postcss">
.checkbox {
  @apply w-5 h-5 rounded cursor-pointer;
  accent-color: var(--color-primary);
}

.checkbox:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.checkbox:disabled {
  @apply opacity-40 cursor-not-allowed;
}
</style>
