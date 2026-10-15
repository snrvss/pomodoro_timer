<template>
  <dialog
    ref="dialogRef"
    class="md-dialog"
    :class="{ 'md-dialog--closing': closing }"
    :aria-labelledby="$slots.title ? titleId : undefined"
    @cancel.prevent="onCancel"
    @click="onBackdropClick"
  >
    <div class="md-dialog__container">
      <h2 v-if="$slots.title" :id="titleId" class="md-dialog__headline">
        <slot name="title" />
      </h2>

      <div class="md-dialog__content">
        <slot />
      </div>

      <div v-if="$slots.actions" class="md-dialog__actions">
        <slot name="actions" :close="close" />
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, useId, watch } from 'vue'

const props = defineProps({
  // When true, the modal can't be dismissed via Escape or a scrim click
  persistent: {
    type: Boolean,
    default: false,
  },
})

const open = defineModel<boolean>({ default: false })

const dialogRef = ref<HTMLDialogElement | null>(null)
const closing = ref(false)
const titleId = useId()

const CLOSE_DURATION_MS = 150

/**
 * Opens the native `<dialog>` as a modal in the top layer.
 *
 * @remarks
 * No-op if the dialog element isn't mounted yet or is already open.
 * Resets any in-progress closing state before opening.
 */
const show = () => {
  const dialog = dialogRef.value
  if (!dialog || dialog.open) return
  closing.value = false
  dialog.showModal()
}

/**
 * Plays the exit animation, then closes the native `<dialog>`.
 *
 * @remarks
 * No-op if the dialog element isn't mounted or is already closed.
 * The dialog is closed after {@link CLOSE_DURATION_MS} so the
 * MD3 exit motion can finish.
 */
const hide = () => {
  const dialog = dialogRef.value
  if (!dialog || !dialog.open) return
  closing.value = true
  setTimeout(() => {
    dialog.close()
    closing.value = false
  }, CLOSE_DURATION_MS)
}

/**
 * Requests the modal to close by setting the `v-model` value to `false`.
 *
 * @remarks
 * Exposed to the parent via `defineExpose` and passed to the `actions`
 * slot as a slot prop. The actual closing is handled by the `open` watcher.
 */
const close = () => {
  open.value = false
}

/**
 * Handles the dialog's native `cancel` event (fired on Escape).
 *
 * @remarks
 * The default browser close is prevented so the exit animation and
 * `v-model` stay in sync. Ignored when the `persistent` prop is set.
 */
const onCancel = () => {
  if (!props.persistent) close()
}

/**
 * Closes the modal when the scrim (`::backdrop`) is clicked.
 *
 * @param event - The click event dispatched on the `<dialog>` element.
 *
 * @remarks
 * Clicks on the `::backdrop` are dispatched with the `<dialog>` itself
 * as target, while clicks inside the container target its children.
 * Ignored when the `persistent` prop is set.
 */
const onBackdropClick = (event: MouseEvent) => {
  if (event.target === dialogRef.value && !props.persistent) close()
}

watch(open, (value) => (value ? show() : hide()))

onMounted(() => {
  if (open.value) show()
})

defineExpose({ close })
</script>

<style lang="postcss">
/* Material Design 3 – Basic dialog */
.md-dialog {
  @apply p-0 m-auto border-none bg-transparent overflow-visible;
  max-width: min(560px, calc(100vw - 48px));
  min-width: 280px;
  max-height: calc(100vh - 48px);
}

.md-dialog::backdrop {
  /* MD3 scrim: 32% opacity */
  background-color: rgb(0 0 0 / 0.32);
}

.md-dialog__container {
  @apply bg-surface text-onSurface flex flex-col p-6;
  border-radius: 28px;
  max-height: calc(100vh - 48px);
  /* MD3 elevation level 3 */
  box-shadow:
    0 1px 3px 0 rgb(0 0 0 / 0.3),
    0 4px 8px 3px rgb(0 0 0 / 0.15);
}

/* Headline small */
.md-dialog__headline {
  @apply mb-4;
  font-size: 24px;
  line-height: 32px;
  font-weight: 400;
}

/* Body medium, on-surface-variant */
.md-dialog__content {
  @apply overflow-y-auto;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 0.25px;
  color: color-mix(in srgb, var(--color-on-surface) 80%, transparent);
}

.md-dialog__actions {
  @apply flex justify-end items-center gap-2 pt-6;
}

/* Motion: emphasized decelerate in, emphasized accelerate out */
.md-dialog[open] {
  animation: md-dialog-in 300ms cubic-bezier(0.05, 0.7, 0.1, 1);
}
.md-dialog[open]::backdrop {
  animation: md-dialog-fade-in 300ms linear;
}
.md-dialog--closing[open] {
  animation: md-dialog-out 150ms cubic-bezier(0.3, 0, 0.8, 0.15) forwards;
}
.md-dialog--closing[open]::backdrop {
  animation: md-dialog-fade-out 150ms linear forwards;
}

@keyframes md-dialog-in {
  from {
    opacity: 0;
    transform: translateY(-24px) scale(0.95);
  }
}
@keyframes md-dialog-out {
  to {
    opacity: 0;
    transform: translateY(-24px) scale(0.95);
  }
}
@keyframes md-dialog-fade-in {
  from {
    opacity: 0;
  }
}
@keyframes md-dialog-fade-out {
  to {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .md-dialog[open],
  .md-dialog[open]::backdrop {
    animation: none;
  }
}
</style>
