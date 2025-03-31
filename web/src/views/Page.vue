<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import { apiStatus, checkApiStatus } from '@/api/status'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const navItems = [
  { path: '/page/home', name: '主页' },
  { path: '/page/airports', name: '机场管理' },
  { path: '/page/subscription', name: '订阅规则' }
]

// API状态文本
const apiStatusText = computed(() => {
  switch (apiStatus.value) {
    case 'available': return '正常'
    case 'unavailable': return '离线'
    case 'checking': return '检查中'
    default: return '未知'
  }
})

// API状态CSS类
const apiStatusClass = computed(() => {
  return {
    'status-available': apiStatus.value === 'available',
    'status-unavailable': apiStatus.value === 'unavailable',
    'status-checking': apiStatus.value === 'checking'
  }
})

// 重试连接
const retryConnection = async () => {
  if (apiStatus.value === 'unavailable') {
    await checkApiStatus()
  }
}

// 登出
function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <header class="sticky top-0 z-50 bg-white shadow-sm">
      <div class="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row justify-between items-center py-4 gap-4 sm:gap-0">
          <div class="flex items-center">
            <div class="text-2xl font-semibold text-primary mr-2">ClashMX</div>
            <div class="api-status-indicator flex items-center cursor-pointer" @click="retryConnection">
              <div class="api-status-dot" :class="apiStatusClass"></div>
              <span class="api-status-text ml-1 text-xs">{{ apiStatusText }}</span>
            </div>
          </div>
          <div class="flex items-center gap-6">
            <nav class="flex gap-6">
              <router-link 
                v-for="item in navItems" 
                :key="item.path" 
                :to="item.path"
                class="text-gray-600 font-medium hover:text-primary transition-colors relative pb-1"
                :class="{ 'text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded': route.path === item.path }"
              >
                {{ item.name }}
              </router-link>
            </nav>
            <button
              @click="handleLogout"
              class="text-gray-600 hover:text-red-600 transition-colors flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>登出</span>
            </button>
          </div>
        </div>
      </div>
    </header>
    
    <main class="flex-1 py-8">
      <div class="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
        <router-view />
      </div>
    </main>
    
    <footer class="bg-white border-t border-gray-200 mt-auto">
      <div class="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-500">
        &copy; {{ new Date().getFullYear() }} ClashMX - Clash 机场订阅整合
      </div>
    </footer>
  </div>
</template>

<style>
/* Tailwind classes for most styling */

/* API状态圆点 */
.api-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.api-status-dot.status-available {
  background-color: #2e7d32;
}

.api-status-dot.status-unavailable {
  background-color: #c62828;
}

.api-status-dot.status-checking {
  background-color: #f57f17;
}

/* API状态文本 */
.api-status-text {
  color: #666;
  font-size: 0.7rem;
}
</style>
