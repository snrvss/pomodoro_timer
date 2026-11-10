<template>
  <Transition name="session-complete-card">
    <section
      v-if="quoteStore.status !== 'idle'"
      class="session-complete-card"
      aria-labelledby="session-complete-title"
    >
      <img :src="RefreshingBeverage" alt="" class="session-complete-card__image" />

      <div class="flex-1 min-w-0" aria-live="polite">
        <h2 id="session-complete-title" class="session-complete-card__title">You did great!</h2>
        <figure v-if="quoteStore.status === 'success' && quoteStore.quote" data-test="quote">
          <blockquote class="session-complete-card__text">“{{ quoteStore.quote.text }}”</blockquote>
          <figcaption class="session-complete-card__author">
            — {{ quoteStore.quote.author }}
          </figcaption>
        </figure>
        <p v-else class="session-complete-card__text" aria-busy="true">
          Pomodoro session completed.
        </p>
      </div>

      <IconButton
        class="session-complete-card__close"
        aria-label="Dismiss"
        @click="quoteStore.reset()"
      >
        <font-awesome-icon icon="xmark" />
      </IconButton>
    </section>
  </Transition>
</template>

<script setup lang="ts">
import { onScopeDispose } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import RefreshingBeverage from '@/assets/undraw_refreshing-beverage_w8al.svg'
import IconButton from '../IconButton.vue'
import { usePomodoroStore } from '@/stores/pomodoro-session/use-pomodoro-session-store'
import { useQuoteStore } from '@/stores/quote'
library.add(faXmark)

const pomodoroStore = usePomodoroStore()
const quoteStore = useQuoteStore()

// Load a quote whenever a focus session runs out. The timer has already moved on to the break
// when this fires, and the load runs in the background, so it never blocks the timer.
const stop = pomodoroStore.onSessionEnd(({ ended }) => {
  if (ended === 'pomodoro') void quoteStore.load()
})
onScopeDispose(stop)
</script>

<style lang="postcss">
.session-complete-card {
  @apply relative w-full flex items-center gap-5 py-5 pl-5 pr-12 rounded-3xl
    bg-surface text-onSurface border border-outline;
  box-shadow: 0 6px 20px -8px rgb(74 44 32 / 0.18);
}

.session-complete-card__image {
  @apply h-24 w-auto shrink-0;
}

.session-complete-card__title {
  @apply text-xl font-bold text-primary mb-1;
}

.session-complete-card__text {
  @apply text-base font-medium leading-snug;
}

.session-complete-card__author {
  @apply mt-1 text-sm opacity-70;
}

.session-complete-card__close {
  @apply absolute top-2 right-2;
}

.session-complete-card-enter-active,
.session-complete-card-leave-active {
  transition:
    opacity 200ms,
    transform 200ms;
}

.session-complete-card-enter-from,
.session-complete-card-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (prefers-reduced-motion: reduce) {
  .session-complete-card-enter-active,
  .session-complete-card-leave-active {
    transition: none;
  }
}
</style>
