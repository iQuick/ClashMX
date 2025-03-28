<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAirportStore } from '../stores/airport'
import type { Airport } from '../stores/airport'

// 使用机场数据store
const airportStore = useAirportStore()

// 复制提示状态
const copiedId = ref('')
// 订阅地址复制状态
const copiedSubscription = ref(false)

// 确保数据已加载
onMounted(async () => {
  if (!airportStore.loaded) {
    await airportStore.loadAirports()
  }
})

const subscriptionUrl = computed(() => {
  // 使用当前页面的origin作为基础URL
  return `${window.location.origin}/api/mx.yaml`
})

function copySubscriptionUrl() {
  navigator.clipboard.writeText(subscriptionUrl.value)
    .then(() => {
      copiedSubscription.value = true
      setTimeout(() => {
        copiedSubscription.value = false
      }, 2000)
    })
    .catch(err => {
      console.error('复制失败:', err)
    })
}

// 复制机场URL到剪贴板
function copyAirportUrl(airport: Airport) {
  navigator.clipboard.writeText(airport.url)
    .then(() => {
      copiedId.value = airport.id
      setTimeout(() => {
        copiedId.value = ''
      }, 2000)
    })
    .catch(err => {
      console.error('复制失败:', err)
    })
}
</script>

<template>
  <div>
    <h1 class="text-3xl font-semibold text-gray-900 mb-8 text-center">ClashMX</h1>
    
    <div class="bg-white rounded-lg shadow-sm p-6">
      
      <div class="bg-gray-50 rounded-lg p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 relative">
        <div class="font-medium text-gray-700">订阅地址:</div>
        <div class="flex-1 font-mono text-primary break-all">{{ subscriptionUrl }}</div>
        <button 
          class="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
          @click="copySubscriptionUrl"
        >
          复制
        </button>
        <!-- 订阅地址复制成功提示 -->
        <div 
          v-if="copiedSubscription" 
          class="absolute left-1/2 transform -translate-x-1/2 -top-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-3 rounded-lg shadow-xl text-base font-medium opacity-95 flex items-center space-x-3 transition-all duration-300 animate-fade-in z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>复制成功!</span>
        </div>
      </div>
      
      <div>
        <h3 class="text-xl font-semibold text-gray-900 mb-4">机场集合</h3>
        <div 
          v-if="airportStore.loading" 
          class="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 text-center text-blue-700 border border-blue-200 shadow-sm"
        >
          <div class="flex items-center justify-center space-x-2">
            <svg class="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>正在加载机场数据...</span>
          </div>
        </div>
        <div 
          v-else-if="airportStore.error" 
          class="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-6 text-center text-red-700 border border-red-200 shadow-sm"
        >
          <div class="flex flex-col items-center space-y-4">
            <svg class="h-8 w-8 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>加载失败: {{ airportStore.error.message }}</div>
          </div>
        </div>
        <div 
          v-else-if="airportStore.airports.length === 0" 
          class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6 text-center text-gray-700 border border-gray-200 shadow-sm"
        >
          <div class="flex flex-col items-center space-y-4">
            <svg class="h-8 w-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <div>暂无机场信息，请前往机场管理页面添加</div>
          </div>
        </div>
        <div 
          v-else 
          class="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div 
            v-for="airport in airportStore.airports" 
            :key="airport.id" 
            class="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div class="font-medium text-gray-900 mb-2 text-lg flex items-center justify-between">
              <span>{{ airport.name }}</span>
              <button 
                @click="copyAirportUrl(airport)" 
                class="text-gray-500 hover:text-blue-600 transition-colors focus:outline-none relative"
                title="复制订阅地址"
              >
                <span v-if="copiedId === airport.id" class="absolute -left-16 top-0 text-xs text-white bg-green-600 px-1.5 py-0.5 rounded whitespace-nowrap">已复制!</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            <div class="text-sm text-gray-600 mb-3">{{ airport.description }}</div>
            
            <!-- 流量进度条 -->
            <div v-if="airport.usedTraffic && airport.totalTraffic" class="mb-3">
              <div class="flex justify-between text-xs text-gray-500 mb-1">
                <span>流量使用</span>
                <span>{{ (airport.usedTraffic / airport.totalTraffic * 100).toFixed(0) }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div 
                  class="h-2.5 rounded-full transition-all duration-300"
                  :style="{ width: `${Math.min((airport.usedTraffic / airport.totalTraffic * 100), 100)}%` }"
                  :class="{
                    'bg-green-500': (airport.usedTraffic / airport.totalTraffic) < 0.7,
                    'bg-yellow-500': (airport.usedTraffic / airport.totalTraffic) >= 0.7 && (airport.usedTraffic / airport.totalTraffic) < 0.8,
                    'bg-red-500': (airport.usedTraffic / airport.totalTraffic) >= 0.8
                  }"
                ></div>
              </div>
            </div>
            
            <!-- 标签显示区域 -->
            <div class="flex items-center justify-between mt-3">
              <!-- 流量标签 -->
              <span 
                v-if="airport.usedTraffic && airport.totalTraffic" 
                class="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
              >
                {{ (airport.usedTraffic / 1024 / 1024 / 1024).toFixed(1) }}GB / {{ (airport.totalTraffic / 1024 / 1024 / 1024).toFixed(1) }}GB
              </span>
              <span v-else class="inline-block w-4"></span> <!-- 占位元素 -->
              
              <!-- 过期时间标签 -->
              <span 
                v-if="airport.expireTime" 
                class="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800"
              >
                {{ new Date(airport.expireTime * 1000).toLocaleDateString() }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Tailwind classes will handle all styling */
.animate-fade-in {
  animation: fadeIn 0.4s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -25px);
  }
  to {
    opacity: 0.95;
    transform: translate(-50%, 0);
  }
}
</style>