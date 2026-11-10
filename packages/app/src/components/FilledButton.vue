<template>
  <button type="button" class="filled-button" :disabled="disabled" @click="handleClick">
    <slot name="icon" />
    {{ label }}
  </button>
</template>

<script setup lang="ts">
defineProps({
  label: {
    type: String,
    default: 'Click me',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['click'])

const handleClick = () => {
  emit('click')
}
</script>

<style lang="postcss">
.filled-button {
  @apply inline-flex items-center justify-center gap-2 h-11 px-7 rounded-full
    bg-primary text-onPrimary font-semibold select-none
    transition disabled:opacity-40 disabled:pointer-events-none;
  box-shadow: 0 2px 6px -1px rgb(74 44 32 / 0.35);
}

.filled-button:hover {
  filter: brightness(1.08);
}

.filled-button:active {
  filter: brightness(0.95);
}

.filled-button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
}
</style>
