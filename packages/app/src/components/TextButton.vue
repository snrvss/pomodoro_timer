<template>
  <button type="button" class="text-button" :disabled="disabled" @click="handleClick">
    {{ label }}
  </button>
</template>

<script setup lang="ts">
defineProps({
  label: {
    type: String,
    default: 'Text Button',
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
.text-button {
  @apply inline-flex items-center justify-center h-10 px-4 rounded-full
    text-primary font-semibold transition disabled:opacity-40 disabled:pointer-events-none;
}

.text-button:hover {
  background-color: color-mix(in srgb, var(--color-primary) 10%, transparent);
}

.text-button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
</style>
