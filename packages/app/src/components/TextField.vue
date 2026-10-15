<template>
  <div class="md-text-field">
    <input
      :id="id"
      v-model="value"
      class="md-text-field__input"
      :type="type"
      :disabled="disabled"
      placeholder=" "
    />
    <label :for="id" class="md-text-field__label">{{ label }}</label>
  </div>
</template>

<script setup lang="ts">
import { useId } from 'vue'

defineProps({
  label: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const value = defineModel<string | number>()

const id = useId()
</script>

<style lang="postcss">
/* Material Design 3 – Outlined text field */
.md-text-field {
  @apply relative w-full;
}

.md-text-field__input {
  @apply w-full h-14 px-4 rounded bg-transparent text-onSurface outline-none;
  font-size: 16px;
  line-height: 24px;
  border: 1px solid color-mix(in srgb, var(--color-on-surface) 50%, transparent);
  transition: border-color 150ms;
}

.md-text-field__input:hover:not(:disabled) {
  border-color: var(--color-on-surface);
}

.md-text-field__input:focus {
  border: 2px solid var(--color-primary);
  /* Keep text from shifting when the border grows */
  padding-left: 15px;
}

.md-text-field__input:disabled {
  @apply opacity-40;
}

.md-text-field__label {
  @apply absolute left-3 top-1/2 px-1 -translate-y-1/2 bg-surface pointer-events-none;
  font-size: 16px;
  color: color-mix(in srgb, var(--color-on-surface) 70%, transparent);
  transition:
    top 150ms,
    font-size 150ms,
    color 150ms;
}

/* Floating label: focused or has a value */
.md-text-field__input:focus + .md-text-field__label,
.md-text-field__input:not(:placeholder-shown) + .md-text-field__label {
  @apply top-0;
  font-size: 12px;
}

.md-text-field__input:focus + .md-text-field__label {
  color: var(--color-primary);
}
</style>
