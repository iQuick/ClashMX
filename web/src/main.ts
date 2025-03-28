import { createApp } from 'vue'
import router from './router'
import './style.css'
import App from './App.vue'
import { startApiMonitoring } from './api/status'
import { createPinia } from 'pinia'

// 创建应用实例
const app = createApp(App)

// 创建Pinia实例
const pinia = createPinia()

// 启动API服务状态监控
startApiMonitoring()

// 使用插件
app.use(router)
app.use(pinia)  // 使用Pinia

// 挂载应用
app.mount('#app')

// 开发环境提示
if (import.meta.env.DEV) {
  console.log('应用已启动，环境:', import.meta.env.MODE)
}
