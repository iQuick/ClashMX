import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: '主页'
      }
    },
    {
      path: '/airports',
      name: 'airports',
      component: () => import('../views/AirportsView.vue'),
      meta: {
        title: '机场管理'
      }
    },
    {
      path: '/subscription',
      name: 'subscription',
      component: () => import('../views/SubscriptionView.vue'),
      meta: {
        title: '订阅规则'
      }
    }
  ]
})

router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title || '首页'} - ClashMX`
  next()
})

export default router