<template>
  <button type="button" class="icon-button" :disabled="disabled" @click="handleClick">
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
defineProps({
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
.icon-button {
  @apply inline-flex items-center justify-center w-10 h-10 rounded-full
    text-onSurface text-lg transition disabled:opacity-40 disabled:pointer-events-none;
}

.icon-button:hover {
  background-color: color-mix(in srgb, var(--color-primary) 10%, transparent);
}

.icon-button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
</style>
