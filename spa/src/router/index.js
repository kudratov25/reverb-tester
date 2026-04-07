import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/broadcasting',
      name: 'broadcasting',
      component: () => import('../views/BroadcastingView.vue'),
    },
  ],
})

export default router
