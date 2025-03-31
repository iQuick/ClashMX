<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const error = ref('')

async function handleLogin() {
  if (!username.value || !password.value) {
    error.value = '请输入用户名和密码'
    setTimeout(() => {
      error.value = ''
    }, 3000)
    return
  }

  try {
    error.value = ''
    const result = await authStore.login(username.value, password.value)

    if (result.success) {
      // 保存token和用户信息
      router.push('/page/home');
    } else {
      error.value = result.error || '登录失败'
      setTimeout(() => {
        error.value = ''
      }, 3000)
    }
  } catch (e) {
    error.value = '登录失败，请稍后重试'
    setTimeout(() => {
      error.value = ''
    }, 3000)
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[#020617] relative overflow-hidden">
    <!-- 背景装饰 -->
    <div class="absolute inset-0">
      <!-- 网格背景 -->
      <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDIwIEwgMjAgMjAiIHN0cm9rZT0iIzE5MjIzYiIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48cGF0aCBkPSJNIDIwIDAgTCAyMCAyMCIgc3Ryb2tlPSIjMTkyMjNiIiBzdHJva2Utd2lkdGg9IjAuNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNncmlkKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==')] opacity-20"></div>

      <!-- 光效装饰 -->
      <div class="absolute top-0 left-1/4 w-1/2 h-1/2 bg-blue-500/30 rounded-full blur-[100px] animate-pulse"></div>
      <div class="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-cyan-400/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>
      
      <!-- 动态线条 -->
      <div class="absolute inset-0">
        <div class="absolute h-[2px] w-[200px] animate-tech-line-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
        <div class="absolute h-[2px] w-[300px] animate-tech-line-2 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
        <div class="absolute h-[2px] w-[250px] animate-tech-line-3 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
      </div>

      <!-- 粒子效果 -->
      <div class="absolute inset-0">
        <div class="absolute w-1 h-1 bg-white rounded-full animate-particle-1"></div>
        <div class="absolute w-1 h-1 bg-white rounded-full animate-particle-2"></div>
        <div class="absolute w-1 h-1 bg-white rounded-full animate-particle-3"></div>
      </div>
    </div>
    
    <!-- 登录表单卡片 -->
    <div class="w-full max-w-lg mx-4 bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl relative z-10 border border-white/10">
      <!-- 登录表单 -->
      <div class="p-12">
        <div class="text-center mb-14">
          <h2 class="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 animate-gradient-x mb-4">ClashMX</h2>
          <div class="h-[2px] w-20 bg-gradient-to-r from-blue-500 to-cyan-400 mx-auto rounded-full mb-4"></div>
          <p class="text-lg text-gray-300 font-medium">代理管理系统</p>
        </div>

        <form class="space-y-8" @submit.prevent="handleLogin">
          <div class="space-y-6">
            <div class="relative group z-20">
              <div class="relative">
                <input
                  id="username"
                  v-model="username"
                  name="username"
                  type="text"
                  required
                  class="peer w-full h-14 px-5 text-lg text-white bg-white/5 border-2 border-white/10 rounded-2xl outline-none backdrop-blur-sm transition-all duration-300 placeholder-transparent focus:border-cyan-400 focus:bg-white/10"
                  placeholder="用户名"
                />
                <label 
                  for="username" 
                  class="absolute left-5 top-1 text-sm font-medium text-gray-300 transition-all duration-300 bg-transparent px-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4 peer-focus:top-1 peer-focus:text-sm peer-focus:text-cyan-400"
                >
                  用户名
                </label>
              </div>
            </div>

            <div class="relative group z-10">
              <div class="relative">
                <input
                  id="password"
                  v-model="password"
                  name="password"
                  type="password"
                  required
                  class="peer w-full h-14 px-5 text-lg text-white bg-white/5 border-2 border-white/10 rounded-2xl outline-none backdrop-blur-sm transition-all duration-300 placeholder-transparent focus:border-cyan-400 focus:bg-white/10"
                  placeholder="密码"
                />
                <label 
                  for="password" 
                  class="absolute left-5 top-1 text-sm font-medium text-gray-300 transition-all duration-300 bg-transparent px-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4 peer-focus:top-1 peer-focus:text-sm peer-focus:text-cyan-400"
                >
                  密码
                </label>
              </div>
            </div>

            <!-- 记住我选项 -->
            <div class="flex items-center">
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-white/10 rounded-full peer peer-focus:ring-4 peer-focus:ring-cyan-400/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-400"></div>
                <span class="ml-3 text-sm font-medium text-gray-300">记住我</span>
              </label>
            </div>
          </div>

          <!-- 错误提示 -->
          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
          >
            <div 
              v-if="error" 
              class="absolute -top-32 left-1/2 transform -translate-x-1/2 bg-red-500/60 backdrop-blur-sm border border-red-500/60 rounded-2xl p-4 min-w-[300px]"
            >
              <div class="flex items-center text-red-400">
                <svg class="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span class="text-sm font-medium">{{ error }}</span>
              </div>
              <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-red-500/60 border-r border-b border-red-500/60 rotate-45"></div>
            </div>
          </Transition>

          <button
            type="submit"
            :disabled="authStore.loading"
            class="relative w-full h-14 text-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-400 rounded-2xl transition-all duration-300 hover:from-blue-600 hover:to-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
          >
            <span class="absolute inset-0 w-full h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 transform group-hover:translate-y-full"></span>
            <span class="relative">
              <span v-if="authStore.loading" class="inline-flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                登录中...
              </span>
              <span v-else>登录</span>
            </span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.from-\[\#0f172a\] {
  --tw-gradient-from: #0f172a;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgb(15 23 42 / 0));
}

.to-\[\#1e293b\] {
  --tw-gradient-to: #1e293b;
}

/* 输入框动画 */
.peer:focus ~ label,
.peer:not(:placeholder-shown) ~ label {
  --tw-text-opacity: 1;
  color: #ffffff;
  transform: translateY(-1rem);
  font-size: 0.875rem;
  background-color: #415568;
  border-radius: 0.5rem;
}

.peer:focus ~ label {
  background-color: #3b82f6;
  color: #ffffff;
}

/* 按钮渐变动画 */
@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.bg-animate {
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
}

/* 动态线条动画 */
@keyframes tech-line-1 {
  0% { transform: translate(-200px, 100px) rotate(-45deg); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translate(calc(100vw + 200px), calc(100vh - 100px)) rotate(-45deg); opacity: 0; }
}

@keyframes tech-line-2 {
  0% { transform: translate(-300px, 300px) rotate(30deg); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translate(calc(100vw + 300px), -100px) rotate(30deg); opacity: 0; }
}

@keyframes tech-line-3 {
  0% { transform: translate(-250px, calc(100vh - 200px)) rotate(-60deg); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translate(calc(100vw + 250px), 200px) rotate(-60deg); opacity: 0; }
}

/* 粒子动画 */
@keyframes particle-float {
  0% { transform: translate(0, 0); opacity: 0; }
  25% { opacity: 1; }
  50% { transform: translate(100px, -100px); }
  75% { opacity: 1; }
  100% { transform: translate(200px, 0); opacity: 0; }
}

.animate-tech-line-1 {
  animation: tech-line-1 8s linear infinite;
}

.animate-tech-line-2 {
  animation: tech-line-2 12s linear infinite;
  animation-delay: 4s;
}

.animate-tech-line-3 {
  animation: tech-line-3 10s linear infinite;
  animation-delay: 2s;
}

.animate-particle-1 {
  animation: particle-float 10s ease-in-out infinite;
}

.animate-particle-2 {
  animation: particle-float 8s ease-in-out infinite;
  animation-delay: 3s;
}

.animate-particle-3 {
  animation: particle-float 12s ease-in-out infinite;
  animation-delay: 6s;
}

.animate-gradient-x {
  background-size: 200% 100%;
  animation: gradient-x 4s linear infinite;
}

@keyframes gradient-x {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* 脉冲动画延迟 */
.delay-1000 {
  animation-delay: 1000ms;
}
</style> 