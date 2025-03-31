import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/page/home'
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue'),
      meta: {
        title: '登录',
        requiresAuth: false
      }
    },
    {
      path: '/page',
      name:'page',
      component: () => import('../views/Page.vue'),
      meta: {
        requiresAuth: true
      },
      children: [
        {
          path: 'home',
          name: 'home',
          component: () => import('../views/pages/HomeView.vue'),
          meta: {
            title: '主页'
          }
        },
        {
          path: 'airports',
          name: 'airports',
          component: () => import('../views/pages/AirportsView.vue'),
          meta: {
            title: '机场管理'
          }
        },
        {
          path: 'subscription',
          name: 'subscription',
          component: () => import('../views/pages/SubscriptionView.vue'),
          meta: {
            title: '订阅规则'
          }
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // 设置页面标题
  document.title = `${to.meta.title || '首页'} - ClashMX`
  
  // 检查是否需要认证
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // 需要认证但未登录，重定向到登录页
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (to.name === 'login' && authStore.isAuthenticated) {
    // 已登录用户访问登录页，重定向到首页
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router