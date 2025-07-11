import { createRouter, createWebHistory } from 'vue-router'
import TestComponents from '@/page/TestComponents.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: TestComponents,
    },
  ],
})

export default router
