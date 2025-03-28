<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSimpleRuleStore } from '../stores/simpleRule'
import { storeToRefs } from 'pinia'

const simpleRuleStore = useSimpleRuleStore()
const { content } = storeToRefs(simpleRuleStore)

async function handleSave() {
  await simpleRuleStore.saveSimpleRules()
}

function handleInput(event: Event) {
  const target = event.target as HTMLTextAreaElement
  content.value = target.value
}

onMounted(async () => {
  await simpleRuleStore.loadSimpleRules()
})
</script>

<template>
  <div class="max-w-full">
    <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200 space-y-6">
      <div class="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h1 class="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">订阅规则</h1>
        <div class="flex flex-wrap gap-2">
          <button 
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
            @click="handleSave">保存</button>
        </div>
      </div>
      
      <div class="space-y-4">
        <div class="space-y-2">
          <label for="content" class="block text-sm font-medium text-gray-700">规则内容</label>
          <textarea 
            id="content"
            v-model="content"
            class="w-full px-3 py-2 border border-gray-300 rounded-md transition-colors min-h-[200px] max-h-[600px] overflow-y-auto font-mono text-sm whitespace-pre-wrap"
            placeholder="请输入规则内容"
            @input="handleInput"
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
textarea {
  resize: vertical;
  min-height: 200px;
  max-height: 600px;
  overflow-y: auto;
  line-height: 1.5;
  tab-size: 2;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}
</style> 