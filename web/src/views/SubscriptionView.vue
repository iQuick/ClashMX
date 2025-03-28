<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useSimpleRuleStore } from '../stores/simpleRule'
import { storeToRefs } from 'pinia'

// 使用简单订阅规则store
const simpleRuleStore = useSimpleRuleStore()
const { content, loading, error, lastSaved } = storeToRefs(simpleRuleStore)

// 本地状态
const rulesText = ref('')
const showSaveSuccess = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const lastScrollPosition = ref(0)
const validationError = ref('')


// 监听content变化，更新本地rulesText
function updateLocalText() {
  rulesText.value = content.value
  nextTick(() => {
    adjustHeight()
  })
}

function adjustHeight() {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`
  }
}

function handlePaste() {
  lastScrollPosition.value = window.scrollY
  nextTick(() => {
    adjustHeight()
    window.scrollTo(0, lastScrollPosition.value)
  })
}

function handleInput(event: Event) {
  // v-model已经负责更新rulesText.value，无需再次手动设置
  // 只需要在每次内容变更后调整高度
  nextTick(() => {
    adjustHeight()
  })
}

async function loadRules() {
  try {
    await simpleRuleStore.loadSimpleRules()
    updateLocalText()
  } catch (error: any) {
    console.error('加载订阅规则失败:', error)
  }
}

async function saveRules() {
  // 将本地文本同步到store
  simpleRuleStore.updateContent(rulesText.value)
  
  try {
    console.log('开始保存订阅规则...')
    
    // 保存到服务器
    const success = await simpleRuleStore.saveSimpleRules()
    
    if (success) {
      // 更新本地文本
      updateLocalText()
      
      showSaveSuccess.value = true
      // 3秒后隐藏成功提示
      setTimeout(() => {
        showSaveSuccess.value = false
      }, 3000)
      
      // 刷新数据以验证保存结果
      setTimeout(() => {
        loadRules()
      }, 1000)
    }
  } catch (error: any) {
    console.error('保存订阅规则失败:', error)
    alert('保存失败: ' + (error.message || '未知错误'))
  }
}

onMounted(async () => {
  // 加载规则数据
  await loadRules()
})
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-semibold text-gray-900">订阅规则 (YAML格式)</h2>
      <div class="flex items-center space-x-2">
        <a
          href="https://liquidjs.com/zh-cn/tutorials/intro-to-liquid.html" target="_blank"
          class="px-3 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          语法
      </a>
      </div>
    </div>
    
    <div class="space-y-4">
      <div v-if="loading" class="py-4 text-center text-gray-500">
        正在加载订阅规则...
      </div>
      
      <div v-else-if="error" class="py-4 text-center text-red-500">
        加载失败: {{ error.message }}
        <button @click="loadRules" class="text-blue-600 underline ml-2">重试</button>
      </div>
      
      <div v-else>
        <textarea 
          v-model="rulesText" 
          ref="textareaRef"
          placeholder="请输入YAML格式的规则内容"
          @paste="handlePaste"
          @input="handleInput"
          class="w-full px-4 py-3 rounded-lg border border-gray-300 transition-colors font-mono text-sm min-h-[400px] max-h-none overflow-hidden overflow-y-hidden resize-none"
          :class="{ 'border-red-500': validationError }"
        ></textarea>
        
        <div v-if="validationError" class="mt-2 text-red-500 text-sm">
          {{ validationError }}
        </div>
      </div>
      
      <div class="flex justify-between items-center">
        <div v-if="showSaveSuccess" class="text-green-600 font-medium animate-fade-in">
          <span class="inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            规则保存成功
          </span>
        </div>
        <div v-else-if="lastSaved" class="text-gray-500 text-sm">
          上次保存: {{ new Date(lastSaved).toLocaleString() }}
        </div>
        <div class="ml-auto">
          <button 
            :disabled="loading || !!validationError"
            class="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
            @click="saveRules"
          >
            {{ loading ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>