<template>
  <input type="checkbox" :checked="value" :disabled="disabled" @change="handleCheckbox" />
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
