import { ref } from 'vue';
import axios from 'axios';
import { API_BASE_URL } from './client';

// API状态
export const apiStatus = ref<'checking' | 'available' | 'unavailable'>('checking');

/**
 * 检查API服务是否可用
 */
export async function checkApiStatus(): Promise<boolean> {
  try {
    apiStatus.value = 'checking';
    console.log('正在检查API服务状态...');
    
    // 使用健康检查端点
    const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 5000 });
    
    // 检查响应状态
    if (response.status === 200 && response.data?.status === 'ok') {
      console.log('API服务可用:', response.data);
      apiStatus.value = 'available';
      return true;
    } else {
      console.warn('API服务响应异常:', response.status, response.data);
      apiStatus.value = 'unavailable';
      return false;
    }
  } catch (error) {
    console.error('API服务不可用:', error);
    apiStatus.value = 'unavailable';
    return false;
  }
}

/**
 * 启动API状态监控
 */
export function startApiMonitoring() {
  // 立即检查一次
  checkApiStatus();
  
  // 设置定期检查
  setInterval(async () => {
    if (apiStatus.value !== 'available') {
      console.log('尝试重新连接API服务...');
      await checkApiStatus();
    }
  }, 30000); // 每30秒检查一次
}

// 导出服务状态实用函数
export const apiStatusUtils = {
  isAvailable: () => apiStatus.value === 'available',
  isUnavailable: () => apiStatus.value === 'unavailable',
  isChecking: () => apiStatus.value === 'checking'
}; 