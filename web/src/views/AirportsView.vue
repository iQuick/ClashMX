<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useAirportStore } from '../stores/airport'
import type { Airport } from '../stores/airport'
import { storeToRefs } from 'pinia'
import { generateAirportId } from '../utils/crypto'
import { apiService } from '../api/service'
import logger from '../utils/logger'

// 使用机场数据store
const airportStore = useAirportStore()

// 使用storeToRefs保持响应性
const { airports, loaded, loading, error } = storeToRefs(airportStore)

// 复制提示状态
const copiedId = ref('')

// 加载数据方法
async function loadData() {
  try {
    console.log('开始加载机场数据...')
    await airportStore.loadAirports()
    console.log('数据加载完成，当前机场数据数量:', airports.value.length)
  } catch (error: any) {
    console.error('数据加载失败:', error)
  }
}

// 重置数据方法 - 谨慎使用
async function resetData() {
  if (!confirm('确定要清空所有机场数据吗？此操作不可恢复！')) {
    return
  }
  
  try {
    console.log('清空机场数据...')
    
    // 逐个删除所有机场
    const deletePromises = airports.value.map(airport => 
      airportStore.deleteAirport(airport.id)
    )
    
    await Promise.all(deletePromises)
    
    // 确保本地数据为空
    airports.value.length = 0
    
    console.log('机场数据已清空')
  } catch (error: any) {
    console.error('清空数据失败:', error)
    alert('清空数据失败: ' + (error.message || '未知错误'))
  }
}

// 数据迁移功能：将现有数据转换为单文件存储模式
async function migrateToSingleFileMode() {
  if (!confirm('确定要将机场数据迁移到单文件存储模式吗？此操作会修改数据存储方式。')) {
    return
  }
  
  try {
    console.log('开始数据迁移...')
    
    if (airports.value.length === 0) {
      console.log('没有数据需要迁移')
      alert('没有数据需要迁移')
      return
    }
    
    // 显示迁移进度
    const migrateStatus = ref({
      total: airports.value.length,
      processed: 0,
      success: 0,
      failed: 0
    })
    
    // 不使用 Promise.all，逐个迁移以避免服务器压力过大
    for (const airport of airports.value) {
      try {
        // 为每个机场生成基于名称和URL的新ID
        const newId = generateAirportId(airport.name, airport.url)
        
        // 准备数据（保留原始ID以兼容旧数据）
        const airportData = {
          ...airport,
          oldId: airport.id,  // 保存原始ID用于参考
          id: newId           // 使用新生成的ID
        }
        
        // 直接调用API保存为单独文件
        await apiService.saveAirport(airportData)
        
        migrateStatus.value.success++
        console.log(`成功迁移机场: ${airport.name}, 新ID: ${newId}`)
      } catch (error) {
        console.error(`迁移机场失败: ${airport.name}`, error)
        migrateStatus.value.failed++
      }
      
      migrateStatus.value.processed++
    }
    
    // 迁移完成后重新加载数据
    await loadData()
    
    alert(`数据迁移完成:\n成功: ${migrateStatus.value.success}\n失败: ${migrateStatus.value.failed}`)
  } catch (error: any) {
    console.error('数据迁移失败:', error)
    alert('数据迁移失败: ' + (error.message || '未知错误'))
  }
}

// 确保数据已加载
onMounted(async () => {
  if (!loaded.value) {
    await loadData()
  }
})

const showAddModal = ref(false)
const showEditModal = ref(false)
const currentAirport = ref<Airport | null>(null)

const newAirport = reactive({
  name: '',
  url: '',
  description: ''
})

function openAddModal() {
  newAirport.name = ''
  newAirport.url = ''
  newAirport.description = ''
  showAddModal.value = true
}

function closeAddModal() {
  showAddModal.value = false
}

async function handleCloseAddModal() {
  closeAddModal()
}

async function handleAddAirport() {
  if (!newAirport.name || !newAirport.url) {
    alert('请填写机场名称和地址')
    return
  }
    
  const airport = {
    name: newAirport.name,
    url: newAirport.url,
    description: newAirport.description,
    usedTraffic: 0,
    totalTraffic: 0,
    expireTime: 0
  }
  const airportInfo = await apiService.queryAirportInfoByUrl(newAirport.url)
  if (airportInfo.success) {
    airport.usedTraffic = airportInfo.data.download
    airport.totalTraffic = airportInfo.data.total
    airport.expireTime = airportInfo.data.expire
  } else {
    console.error('查询机场信息失败:', airportInfo.error)
    alert('无法获取机场详细信息: ' + (airportInfo.error || '未知错误') + '\n将以基本信息添加机场')
  }
    
  try {
    await airportStore.addAirport(airport)
    closeAddModal()
  } catch (error: any) {
    console.error('添加机场失败:', error)
    alert('添加机场失败: ' + (error.message || '未知错误'))
  }
}


function openEditModal(airport: Airport) {
  currentAirport.value = { ...airport }
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
  currentAirport.value = null
}

async function updateAirport() {
  if (!currentAirport.value) return
  if (!currentAirport.value.name || !currentAirport.value.url) {
    alert('请填写机场名称和地址')
    return
  }

  try {
    const airportInfo = await apiService.queryAirportInfoByUrl(currentAirport.value.url)
    const airport = {
      name: currentAirport.value.name,
      url: currentAirport.value.url,
      description: currentAirport.value.description,
      usedTraffic: 0,
      totalTraffic: 0,
      expireTime: 0
    }
    if (airportInfo.success) {
      airport.usedTraffic = airportInfo.data.download
      airport.totalTraffic = airportInfo.data.total
      airport.expireTime = airportInfo.data.expire
    } else {
      console.error('查询机场信息失败:', airportInfo.error)
      alert('查询机场信息失败: ' + (airportInfo.error || '未知错误'))
      return
    }
    const success = await airportStore.updateAirport(currentAirport.value.id, airport)
    
    if (success) {
      closeEditModal()
    } else {
      alert('更新机场信息失败')
    }
  } catch (error: any) {
    console.error('更新机场失败:', error)
    alert('更新机场失败: ' + (error.message || '未知错误'))
  }
}

const importUrl = ref('')

async function handleImport() {
  if (!importUrl.value) {
    alert('请输入订阅URL')
    return
  }

  const url = importUrl.value
  
  try {
    const airportInfo = await apiService.queryAirportInfoByUrl(url)
    if (airportInfo.success) {
      console.log('查询机场信息成功:', airportInfo.data)
      const parsedUrl = new URL(url);
      await airportStore.addAirport({
        name: airportInfo.data.name || parsedUrl.hostname,
        url: url,
        description: airportInfo.data.name ? parsedUrl.hostname : '',
        usedTraffic: airportInfo.data.download,
        totalTraffic: airportInfo.data.total,
        expireTime: airportInfo.data.expire
      })
      // 清空导入URL
      importUrl.value = ''
    } else {
      console.error('查询机场信息失败:', airportInfo.error)
      alert('查询机场信息失败: ' + (airportInfo.error || '未知错误'))
    }
  } catch (error: any) {
    console.error('查询机场信息失败:', error)
    alert('查询机场信息失败: ' + (error.message || '未知错误'))
  }

}

async function confirmDelete(airport: Airport) {
  if (confirm(`确定要删除机场 ${airport.name} 吗？`)) {
    try {
      const success = await airportStore.deleteAirport(airport.id)
      
      if (!success) {
        alert('删除机场失败')
      }
    } catch (error: any) {
      console.error('删除机场失败:', error)
      alert('删除机场失败: ' + (error.message || '未知错误'))
    }
  }
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
  <div class="max-w-full">
    <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200 space-y-6">
      <div class="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h1 class="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">机场管理</h1>
        <div class="flex flex-wrap gap-2">
        </div>
      </div>
      
      <div class="flex flex-col sm:flex-row gap-3">
        <input v-model="importUrl" type="text" placeholder="请输入订阅URL"
          class="px-4 py-2 border border-gray-300 rounded-md transition-colors flex-1" />
        <button @click="handleImport"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white">
          导入
        </button>
        <button 
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
          @click="openAddModal">新建</button>
      </div>
    </div>
    <div class="border-t border-gray-200 pt-6">
    </div>

    <!-- 加载状态显示 -->
    <div v-if="loading" class="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-8 text-center text-blue-700 border border-blue-200 shadow-sm">
      <div class="flex items-center justify-center space-x-2">
        <svg class="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>正在加载机场数据...</span>
      </div>
    </div>
    
    <!-- 错误状态显示 -->
    <div v-else-if="error" class="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-8 text-center text-red-700 border border-red-200 shadow-sm">
      <div class="flex flex-col items-center space-y-4">
        <svg class="h-8 w-8 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>加载机场数据失败: {{ error.message }}</div>
        <button @click="loadData" class="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
          重试
        </button>
      </div>
    </div>
    
    <!-- 无数据状态 -->
    <div v-else-if="airports.length === 0" class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-8 text-center text-gray-700 border border-gray-200 shadow-sm">
      <div class="flex flex-col items-center space-y-4">
        <svg class="h-8 w-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <div>暂无机场信息，点击"新建"按钮添加</div>
      </div>
    </div>
    
    <!-- 数据展示 -->
    <div v-else class="space-y-4 mt-4">
      <div v-for="airport in airports" :key="airport.id"
        class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200 max-w-full">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <h2 class="text-xl font-bold text-gray-900">{{ airport.name }}</h2>
              <span class="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded">机场</span>
            </div>
            <button 
              @click="copyAirportUrl(airport)" 
              class="text-gray-500 hover:text-blue-600 transition-colors focus:outline-none flex items-center relative"
              title="复制订阅地址"
            >
              <span v-if="copiedId === airport.id" class="absolute -left-16 top-0 text-xs text-white bg-green-600 px-1.5 py-0.5 rounded whitespace-nowrap">已复制!</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
          <div class="space-y-2">
            <div class="flex items-start space-x-2">
              <span class="text-gray-500 text-sm font-medium w-16">订阅链接</span>
              <span class="text-gray-700 text-sm break-all flex-1">{{ airport.url }}</span>
            </div>
            <div class="flex items-start space-x-2" v-if="airport.description">
              <span class="text-gray-500 text-sm font-medium w-16">描述</span>
              <span class="text-gray-600 text-sm flex-1">{{ airport.description }}</span>
            </div>
            <div class="flex items-start space-x-2" v-if="airport.usedTraffic && airport.totalTraffic">
              <span class="text-gray-500 text-sm font-medium w-16">流量</span>
              <span class="text-gray-700 text-sm flex-1">{{ (airport.usedTraffic / 1024 / 1024 / 1024).toFixed(1) }}GB / {{ (airport.totalTraffic / 1024 / 1024 / 1024).toFixed(1) }}GB</span>
            </div>
            <div class="flex items-start space-x-2" v-if="airport.expireTime">
              <span class="text-gray-500 text-sm font-medium w-16">过期时间</span>
              <span class="text-gray-700 text-sm flex-1">{{ new Date(airport.expireTime * 1000).toLocaleString() }}</span>
            </div>
          </div>
          <div class="flex justify-end space-x-3 pt-4">
            <button
              class="text-gray-700 hover:text-white bg-white hover:bg-blue-600 px-4 py-2 rounded-md border border-gray-300 hover:border-blue-600 transition-all text-base font-medium flex items-center space-x-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
              @click="openEditModal(airport)">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>编辑</span>
            </button>
            <button
              class="text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md border border-red-500 hover:border-red-600 transition-all text-base font-medium flex items-center space-x-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
              @click="confirmDelete(airport)">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>删除</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加机场模态框 -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div class="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">添加机场</h2>
          <button class="text-gray-400 hover:text-gray-500 transition-colors" @click="handleCloseAddModal">×</button>
        </div>
        <div class="p-4 space-y-4">
          <div class="space-y-2">
            <label for="name" class="block text-sm font-medium text-gray-700">机场名称</label>
            <input id="name" v-model="newAirport.name" type="text" placeholder="请输入机场名称"
              class="w-full px-3 py-2 border border-gray-300 rounded-md transition-colors" />
          </div>
          <div class="space-y-2">
            <label for="url" class="block text-sm font-medium text-gray-700">订阅地址</label>
            <input id="url" v-model="newAirport.url" type="text" placeholder="请输入订阅地址"
              class="w-full px-3 py-2 border border-gray-300 rounded-md transition-colors" />
          </div>
          <div class="space-y-2">
            <label for="description" class="block text-sm font-medium text-gray-700">描述</label>
            <textarea id="description" v-model="newAirport.description" placeholder="请输入机场描述"
              class="w-full px-3 py-2 border border-gray-300 rounded-md transition-colors resize-none h-24"></textarea>
          </div>
        </div>
        <div class="flex justify-end space-x-3 p-4 border-t border-gray-200">
          <button class="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            @click="handleCloseAddModal">取消</button>
          <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            @click="handleAddAirport">确定</button>
        </div>
      </div>
    </div>

    <!-- 编辑机场模态框 -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div class="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">编辑机场</h2>
          <button class="text-gray-400 hover:text-gray-500 transition-colors" @click="closeEditModal">×</button>
        </div>
        <div class="p-4 space-y-4" v-if="currentAirport">
          <div class="space-y-2">
            <label for="edit-name" class="block text-sm font-medium text-gray-700">机场名称</label>
            <input id="edit-name" v-model="currentAirport.name" type="text" placeholder="请输入机场名称"
              class="w-full px-3 py-2 border border-gray-300 rounded-md transition-colors" />
          </div>
          <div class="space-y-2">
            <label for="edit-url" class="block text-sm font-medium text-gray-700">订阅地址</label>
            <input id="edit-url" v-model="currentAirport.url" type="text" placeholder="请输入订阅地址"
              class="w-full px-3 py-2 border border-gray-300 rounded-md transition-colors" />
          </div>
          <div class="space-y-2">
            <label for="edit-description" class="block text-sm font-medium text-gray-700">描述</label>
            <textarea id="edit-description" v-model="currentAirport.description" placeholder="请输入机场描述"
              class="w-full px-3 py-2 border border-gray-300 rounded-md transition-colors resize-none h-24"></textarea>
          </div>
        </div>
        <div class="flex justify-end space-x-3 p-4 border-t border-gray-200">
          <button class="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            @click="closeEditModal">取消</button>
          <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            @click="updateAirport">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Tailwind classes will handle all styling */
</style>